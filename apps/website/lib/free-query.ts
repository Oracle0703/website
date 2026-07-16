import { createHmac, randomBytes } from "node:crypto";

export const FREE_QUERY_PROVIDER = "WeatherAPI.com";
export const FREE_QUERY_VERSION = "v1";

export const FREE_QUERY_LIMITS = {
  requestQueryBytes: 1_024,
  upstreamTimeoutMs: 5_000,
  locationsResponseBytes: 256 * 1_024,
  weatherResponseBytes: 512 * 1_024,
  locationsPerMinute: 20,
  weatherPerMinute: 10,
  upstreamPerMinute: 60,
  upstreamPerHour: 500,
  upstreamPerDay: 2_500,
  upstreamPerMonth: 75_000,
  maxRateLimitIdentities: 5_000,
  maxCacheEntries: 256,
  maxInflightEntries: 64,
  maxUpstreamConcurrency: 4,
  maxUpstreamQueue: 16,
  upstreamQueueTimeoutMs: 1_500,
  locationsTtlMs: 60 * 60 * 1_000,
  emptyLocationsTtlMs: 5 * 60 * 1_000,
  weatherFreshMs: 15 * 60 * 1_000,
  weatherHardExpiryMs: 60 * 60 * 1_000
} as const;

type UnitSystem = "metric" | "imperial";
type QueryLanguage = "zh" | "en";

export type FreeQueryLocation = {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
};

export type FreeQueryWeather = {
  location: {
    name: string;
    region: string;
    country: string;
    localTime: string | null;
  };
  current: {
    temperature: number;
    feelsLike: number | null;
    humidity: number | null;
    windSpeed: number | null;
    condition: string | null;
  };
  forecast: Array<{
    date: string;
    condition: string | null;
    maxTemperature: number | null;
    minTemperature: number | null;
    rainChance: number | null;
  }>;
  airQuality: {
    aqi: number | null;
    label: string | null;
    pm25: number | null;
    pm10: number | null;
  };
  updatedAt: string | null;
  units: UnitSystem;
};

type JsonRecord = Record<string, unknown>;

type CacheEntry<T> = {
  data: T;
  fetchedAt: string;
  freshUntil: number;
  expiresAt: number;
};

type CacheHit<T> = CacheEntry<T> & { stale: boolean };

type RateLimitEntry = {
  count: number;
  windowStartedAt: number;
  lastSeenAt: number;
};

type BudgetWindow = {
  key: string;
  count: number;
};

type ServiceLimits = {
  [Key in keyof typeof FREE_QUERY_LIMITS]: number;
};

type FreeQueryServiceOptions = {
  fetcher?: typeof fetch;
  now?: () => number;
  getApiKey?: () => string | undefined;
  limits?: Partial<ServiceLimits>;
};

type ServiceSuccess<T> = {
  ok: true;
  data: T;
  meta: {
    source: typeof FREE_QUERY_PROVIDER;
    cached: boolean;
    stale: boolean;
    fetchedAt: string;
  };
};

type ParsedLocationRequest = {
  q: string;
  lang: QueryLanguage;
};

type ParsedWeatherRequest = ParsedLocationRequest & {
  units: UnitSystem;
};

type WeatherByUnit = Record<UnitSystem, FreeQueryWeather>;

export class FreeQueryError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfter?: number;

  constructor(code: string, status: number, retryAfter?: number) {
    super(code);
    this.name = "FreeQueryError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

class BoundedCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }

  get(key: string, now: number): CacheHit<T> | null {
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (now >= entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    this.entries.delete(key);
    this.entries.set(key, entry);
    return { ...entry, stale: now >= entry.freshUntil };
  }

  set(key: string, entry: CacheEntry<T>) {
    this.entries.delete(key);
    this.entries.set(key, entry);

    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function safeString(value: unknown, maxLength = 160): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength || /[\u0000-\u001f\u007f]/.test(normalized)) {
    return null;
  }
  return normalized;
}

function safeIdentifier(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return safeString(value, 120);
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function boundedNumber(value: unknown, minimum: number, maximum: number): number | null {
  const number = finiteNumber(value);
  return number !== null && number >= minimum && number <= maximum ? number : null;
}

function conditionText(value: unknown): string | null {
  if (typeof value === "string") return safeString(value, 100);
  return safeString(asRecord(value)?.text, 100);
}

function configurationStatus(key: string) {
  if (!key) return "not_configured" as const;
  if (key.length < 8 || key.length > 256 || /\s|[\u0000-\u001f\u007f]/.test(key)) {
    return "invalid" as const;
  }
  return "configured" as const;
}

function responseHeaders() {
  return {
    "Cache-Control": "private, no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function jsonResponse(body: unknown, status = 200, retryAfter?: number) {
  const headers = new Headers(responseHeaders());
  if (retryAfter !== undefined) headers.set("Retry-After", String(Math.max(1, retryAfter)));
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(error: unknown) {
  const failure =
    error instanceof FreeQueryError
      ? error
      : new FreeQueryError("internal_error", 500);

  return jsonResponse(
    {
      ok: false,
      error: {
        code: failure.code,
        message: "The query could not be completed."
      }
    },
    failure.status,
    failure.retryAfter
  );
}

function requestOriginAllowed(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (origin === "null") return false;

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function validateRequestBoundary(
  request: Request,
  allowedKeys: readonly string[],
  maximumQueryBytes: number
) {
  if (request.method !== "GET") throw new FreeQueryError("method_not_allowed", 405);
  if (!requestOriginAllowed(request)) {
    throw new FreeQueryError("cross_origin_denied", 403);
  }

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    throw new FreeQueryError("invalid_request", 400);
  }

  if (new TextEncoder().encode(url.search).byteLength > maximumQueryBytes) {
    throw new FreeQueryError("invalid_request", 400);
  }

  const allowed = new Set(allowedKeys);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key) || url.searchParams.getAll(key).length !== 1) {
      throw new FreeQueryError("invalid_request", 400);
    }
  }

  return url.searchParams;
}

function normalizeLanguage(value: string | null): QueryLanguage {
  if (value === null || value === "") return "zh";
  if (value === "zh" || value === "en") return value;
  throw new FreeQueryError("invalid_request", 400);
}

function normalizeCityQuery(value: string | null) {
  const query = safeString(value, 64);
  if (!query || query.length < 2) throw new FreeQueryError("invalid_request", 400);
  if (!/^[\p{L}\p{M}\p{N}\s.'’(),-]+$/u.test(query)) {
    throw new FreeQueryError("invalid_request", 400);
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(query)) {
    throw new FreeQueryError("invalid_request", 400);
  }
  return query;
}

function normalizeWeatherQuery(value: string | null) {
  const query = safeString(value, 64);
  if (!query || query.length < 2) throw new FreeQueryError("invalid_request", 400);

  const coordinateMatch = query.match(
    /^(-?\d{1,3}(?:\.\d{1,6})?),\s*(-?\d{1,3}(?:\.\d{1,6})?)$/
  );
  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new FreeQueryError("invalid_request", 400);
    }
    const canonical = (number: number) =>
      number.toFixed(4).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    return `${canonical(latitude)},${canonical(longitude)}`;
  }

  return normalizeCityQuery(query);
}

export function parseLocationRequest(
  request: Request,
  maximumQueryBytes: number = FREE_QUERY_LIMITS.requestQueryBytes
): ParsedLocationRequest {
  const params = validateRequestBoundary(
    request,
    ["q", "lang"],
    maximumQueryBytes
  );
  return {
    q: normalizeCityQuery(params.get("q")),
    lang: normalizeLanguage(params.get("lang"))
  };
}

export function parseWeatherRequest(
  request: Request,
  maximumQueryBytes: number = FREE_QUERY_LIMITS.requestQueryBytes
): ParsedWeatherRequest {
  const params = validateRequestBoundary(
    request,
    ["q", "lang", "units"],
    maximumQueryBytes
  );
  const units = params.get("units") ?? "metric";
  if (units !== "metric" && units !== "imperial") {
    throw new FreeQueryError("invalid_request", 400);
  }
  return {
    q: normalizeWeatherQuery(params.get("q")),
    lang: normalizeLanguage(params.get("lang")),
    units
  };
}

export function normalizeLocationsPayload(payload: unknown): FreeQueryLocation[] {
  if (!Array.isArray(payload)) throw new FreeQueryError("upstream_schema_invalid", 502);

  return payload.slice(0, 5).flatMap((value, index) => {
    const item = asRecord(value);
    if (!item) return [];
    const name = safeString(item.name, 120);
    const region = safeString(item.region, 120) ?? "";
    const country = safeString(item.country, 120) ?? "";
    const lat = boundedNumber(item.lat, -90, 90);
    const lon = boundedNumber(item.lon, -180, 180);
    if (!name || lat === null || lon === null) return [];

    return [
      {
        id: safeIdentifier(item.id) ?? `${lat.toFixed(4)},${lon.toFixed(4)},${index}`,
        name,
        region,
        country,
        lat,
        lon
      }
    ];
  });
}

const AQI_LABELS: Record<QueryLanguage, readonly string[]> = {
  zh: ["良好", "中等", "对敏感人群不健康", "不健康", "非常不健康", "危险"],
  en: [
    "Good",
    "Moderate",
    "Unhealthy for sensitive groups",
    "Unhealthy",
    "Very unhealthy",
    "Hazardous"
  ]
};

export function normalizeWeatherPayload(
  payload: unknown,
  units: UnitSystem,
  lang: QueryLanguage
): FreeQueryWeather {
  const root = asRecord(payload);
  const location = asRecord(root?.location);
  const current = asRecord(root?.current);
  const forecastRoot = asRecord(root?.forecast);
  const forecastDays = forecastRoot?.forecastday;
  if (!location || !current || !Array.isArray(forecastDays)) {
    throw new FreeQueryError("upstream_schema_invalid", 502);
  }

  const name = safeString(location.name, 120);
  const temperature = boundedNumber(
    units === "metric" ? current.temp_c : current.temp_f,
    -150,
    180
  );
  if (!name || temperature === null || forecastDays.length === 0) {
    throw new FreeQueryError("upstream_schema_invalid", 502);
  }

  const forecast = forecastDays.slice(0, 3).flatMap((value) => {
    const item = asRecord(value);
    const day = asRecord(item?.day);
    const date = safeString(item?.date, 10);
    if (!item || !day || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    return [
      {
        date,
        condition: conditionText(day.condition),
        maxTemperature: boundedNumber(
          units === "metric" ? day.maxtemp_c : day.maxtemp_f,
          -150,
          180
        ),
        minTemperature: boundedNumber(
          units === "metric" ? day.mintemp_c : day.mintemp_f,
          -150,
          180
        ),
        rainChance: boundedNumber(day.daily_chance_of_rain, 0, 100)
      }
    ];
  });

  if (forecast.length === 0) throw new FreeQueryError("upstream_schema_invalid", 502);

  const airQuality = asRecord(current.air_quality);
  const rawAqi = boundedNumber(airQuality?.["us-epa-index"], 1, 6);
  const aqi = rawAqi !== null && Number.isInteger(rawAqi) ? rawAqi : null;

  return {
    location: {
      name,
      region: safeString(location.region, 120) ?? "",
      country: safeString(location.country, 120) ?? "",
      localTime: safeString(location.localtime, 40)
    },
    current: {
      temperature,
      feelsLike: boundedNumber(
        units === "metric" ? current.feelslike_c : current.feelslike_f,
        -150,
        180
      ),
      humidity: boundedNumber(current.humidity, 0, 100),
      windSpeed: boundedNumber(
        units === "metric" ? current.wind_kph : current.wind_mph,
        0,
        1_000
      ),
      condition: conditionText(current.condition)
    },
    forecast,
    airQuality: {
      aqi,
      label: aqi === null ? null : AQI_LABELS[lang][aqi - 1],
      pm25: boundedNumber(airQuality?.pm2_5, 0, 100_000),
      pm10: boundedNumber(airQuality?.pm10, 0, 100_000)
    },
    updatedAt: safeString(current.last_updated, 40),
    units
  };
}

async function readJsonWithLimit(
  response: Response,
  maximumBytes: number,
  abortUpstream?: () => void
) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    abortUpstream?.();
    await response.body?.cancel().catch(() => undefined);
    throw new FreeQueryError("upstream_response_too_large", 502);
  }

  if (!response.body) throw new FreeQueryError("upstream_schema_invalid", 502);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        abortUpstream?.();
        await reader.cancel().catch(() => undefined);
        throw new FreeQueryError("upstream_response_too_large", 502);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new FreeQueryError("upstream_schema_invalid", 502);
  }
}

function clientIdentity(request: Request, salt: Uint8Array) {
  const raw =
    request.headers.get("x-real-ip")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown";
  return createHmac("sha256", salt).update(raw).digest("hex").slice(0, 32);
}

function utcDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function utcMonthKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 7);
}

export function createFreeQueryService(options: FreeQueryServiceOptions = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? Date.now;
  const getApiKey = options.getApiKey ?? (() => process.env.WEATHERAPI_KEY);
  const limits = { ...FREE_QUERY_LIMITS, ...options.limits } as ServiceLimits;
  const identitySalt = randomBytes(32);
  const rateLimits = new Map<string, RateLimitEntry>();
  const locationsCache = new BoundedCache<FreeQueryLocation[]>(limits.maxCacheEntries);
  const weatherCache = new BoundedCache<WeatherByUnit>(limits.maxCacheEntries);
  const locationsInflight = new Map<string, Promise<ServiceSuccess<{ locations: FreeQueryLocation[] }>>>();
  const weatherInflight = new Map<
    string,
    Promise<{ data: WeatherByUnit; fetchedAt: string }>
  >();
  let activeUpstreamRequests = 0;
  const upstreamQueue: Array<{
    resolve: () => void;
    reject: (error: FreeQueryError) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];
  const budgets: Record<"minute" | "hour" | "day" | "month", BudgetWindow> = {
    minute: { key: "", count: 0 },
    hour: { key: "", count: 0 },
    day: { key: "", count: 0 },
    month: { key: "", count: 0 }
  };

  function checkLocalRateLimit(request: Request, route: "locations" | "weather") {
    const timestamp = now();
    const identity = `${route}:${clientIdentity(request, identitySalt)}`;
    const maximum =
      route === "locations" ? limits.locationsPerMinute : limits.weatherPerMinute;
    let entry = rateLimits.get(identity);

    if (!entry || timestamp - entry.windowStartedAt >= 60_000) {
      entry = { count: 0, windowStartedAt: timestamp, lastSeenAt: timestamp };
    }

    if (entry.count >= maximum) {
      const retryAfter = Math.max(1, Math.ceil((60_000 - (timestamp - entry.windowStartedAt)) / 1_000));
      throw new FreeQueryError("rate_limited", 429, retryAfter);
    }

    entry.count += 1;
    entry.lastSeenAt = timestamp;
    rateLimits.delete(identity);
    rateLimits.set(identity, entry);

    while (rateLimits.size > limits.maxRateLimitIdentities) {
      const oldest = rateLimits.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      rateLimits.delete(oldest);
    }
  }

  function reserveUpstreamBudget(timestamp: number) {
    const keys = {
      minute: String(Math.floor(timestamp / 60_000)),
      hour: String(Math.floor(timestamp / 3_600_000)),
      day: utcDayKey(timestamp),
      month: utcMonthKey(timestamp)
    };
    const maximums = {
      minute: limits.upstreamPerMinute,
      hour: limits.upstreamPerHour,
      day: limits.upstreamPerDay,
      month: limits.upstreamPerMonth
    };

    for (const windowName of Object.keys(keys) as Array<keyof typeof keys>) {
      if (budgets[windowName].key !== keys[windowName]) {
        budgets[windowName] = { key: keys[windowName], count: 0 };
      }
      if (budgets[windowName].count >= maximums[windowName]) return false;
    }
    for (const windowName of Object.keys(keys) as Array<keyof typeof keys>) {
      budgets[windowName].count += 1;
    }
    return true;
  }

  async function acquireUpstreamSlot() {
    if (activeUpstreamRequests < limits.maxUpstreamConcurrency) {
      activeUpstreamRequests += 1;
      return;
    }
    if (upstreamQueue.length >= limits.maxUpstreamQueue) {
      throw new FreeQueryError("upstream_busy", 503, 2);
    }

    await new Promise<void>((resolve, reject) => {
      const queued = {
        resolve: () => {
          clearTimeout(queued.timer);
          activeUpstreamRequests += 1;
          resolve();
        },
        reject,
        timer: setTimeout(() => {
          const index = upstreamQueue.indexOf(queued);
          if (index >= 0) upstreamQueue.splice(index, 1);
          reject(new FreeQueryError("upstream_busy", 503, 2));
        }, limits.upstreamQueueTimeoutMs)
      };
      upstreamQueue.push(queued);
    });
  }

  function releaseUpstreamSlot() {
    activeUpstreamRequests = Math.max(0, activeUpstreamRequests - 1);
    const next = upstreamQueue.shift();
    next?.resolve();
  }

  async function callWeatherApi(
    path: "/search.json" | "/forecast.json",
    params: Record<string, string>,
    maximumBytes: number
  ) {
    const key = (getApiKey() ?? "").trim();
    if (configurationStatus(key) !== "configured") {
      throw new FreeQueryError("not_configured", 503);
    }

    await acquireUpstreamSlot();
    try {
      if (!reserveUpstreamBudget(now())) {
        throw new FreeQueryError("upstream_budget_exhausted", 503);
      }

      const url = new URL(`/v1${path}`, "https://api.weatherapi.com");
      url.searchParams.set("key", key);
      for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, limits.upstreamTimeoutMs);

      let response: Response;
      try {
        response = await fetcher(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            "user-agent": "meaningful-ink-free-query/1.0"
          },
          redirect: "error",
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) {
          controller.abort();
          await response.body?.cancel().catch(() => undefined);
          if (response.status === 429 || response.status >= 500) {
            throw new FreeQueryError("upstream_unavailable", 503);
          }
          throw new FreeQueryError("upstream_rejected", 502);
        }

        return await readJsonWithLimit(response, maximumBytes, () => controller.abort());
      } catch (error) {
        if (error instanceof FreeQueryError) throw error;
        if (timedOut) throw new FreeQueryError("upstream_timeout", 504);
        throw new FreeQueryError("upstream_unavailable", 503);
      } finally {
        clearTimeout(timer);
      }
    } finally {
      releaseUpstreamSlot();
    }
  }

  async function dedupe<T>(key: string, map: Map<string, Promise<T>>, loader: () => Promise<T>) {
    const existing = map.get(key);
    if (existing) return existing;
    if (map.size >= limits.maxInflightEntries) {
      throw new FreeQueryError("upstream_busy", 503, 2);
    }
    const promise = loader().finally(() => map.delete(key));
    map.set(key, promise);
    return promise;
  }

  async function loadLocations(input: ParsedLocationRequest) {
    const timestamp = now();
    const cacheKey = input.q.toLocaleLowerCase("en-US");
    const cached = locationsCache.get(cacheKey, timestamp);
    if (cached && !cached.stale) {
      return {
        ok: true,
        data: { locations: cached.data },
        meta: {
          source: FREE_QUERY_PROVIDER,
          cached: true,
          stale: false,
          fetchedAt: cached.fetchedAt
        }
      } satisfies ServiceSuccess<{ locations: FreeQueryLocation[] }>;
    }

    return dedupe(cacheKey, locationsInflight, async () => {
      const payload = await callWeatherApi(
        "/search.json",
        { q: input.q },
        limits.locationsResponseBytes
      );
      const locations = normalizeLocationsPayload(payload);
      const fetchedAt = new Date(now()).toISOString();
      const ttl = locations.length ? limits.locationsTtlMs : limits.emptyLocationsTtlMs;
      locationsCache.set(cacheKey, {
        data: locations,
        fetchedAt,
        freshUntil: now() + ttl,
        expiresAt: now() + ttl
      });
      return {
        ok: true,
        data: { locations },
        meta: { source: FREE_QUERY_PROVIDER, cached: false, stale: false, fetchedAt }
      } satisfies ServiceSuccess<{ locations: FreeQueryLocation[] }>;
    });
  }

  async function loadWeather(input: ParsedWeatherRequest) {
    const timestamp = now();
    const cacheKey = `${input.lang}:${input.q.toLocaleLowerCase("en-US")}`;
    const cached = weatherCache.get(cacheKey, timestamp);
    if (cached && !cached.stale) {
      return {
        ok: true,
        data: cached.data[input.units],
        meta: {
          source: FREE_QUERY_PROVIDER,
          cached: true,
          stale: false,
          fetchedAt: cached.fetchedAt
        }
      } satisfies ServiceSuccess<FreeQueryWeather>;
    }

    try {
      const loaded = await dedupe(cacheKey, weatherInflight, async () => {
        const payload = await callWeatherApi(
          "/forecast.json",
          {
            q: input.q,
            days: "3",
            aqi: "yes",
            alerts: "no",
            lang: input.lang
          },
          limits.weatherResponseBytes
        );
        const weather: WeatherByUnit = {
          metric: normalizeWeatherPayload(payload, "metric", input.lang),
          imperial: normalizeWeatherPayload(payload, "imperial", input.lang)
        };
        const fetchedAt = new Date(now()).toISOString();
        weatherCache.set(cacheKey, {
          data: weather,
          fetchedAt,
          freshUntil: now() + limits.weatherFreshMs,
          expiresAt: now() + limits.weatherHardExpiryMs
        });
        return { data: weather, fetchedAt };
      });
      return {
        ok: true,
        data: loaded.data[input.units],
        meta: {
          source: FREE_QUERY_PROVIDER,
          cached: false,
          stale: false,
          fetchedAt: loaded.fetchedAt
        }
      } satisfies ServiceSuccess<FreeQueryWeather>;
    } catch (error) {
      const fallback = weatherCache.get(cacheKey, now());
      if (fallback) {
        return {
          ok: true,
          data: fallback.data[input.units],
          meta: {
            source: FREE_QUERY_PROVIDER,
            cached: true,
            stale: fallback.stale,
            fetchedAt: fallback.fetchedAt
          }
        } satisfies ServiceSuccess<FreeQueryWeather>;
      }
      throw error;
    }
  }

  return {
    async locations(request: Request) {
      try {
        const input = parseLocationRequest(
          request,
          limits.requestQueryBytes
        );
        const key = (getApiKey() ?? "").trim();
        if (configurationStatus(key) !== "configured") {
          throw new FreeQueryError("not_configured", 503);
        }
        checkLocalRateLimit(request, "locations");
        return jsonResponse(await loadLocations(input));
      } catch (error) {
        return errorResponse(error);
      }
    },

    async weather(request: Request) {
      try {
        const input = parseWeatherRequest(
          request,
          limits.requestQueryBytes
        );
        const key = (getApiKey() ?? "").trim();
        if (configurationStatus(key) !== "configured") {
          throw new FreeQueryError("not_configured", 503);
        }
        checkLocalRateLimit(request, "weather");
        return jsonResponse(await loadWeather(input));
      } catch (error) {
        return errorResponse(error);
      }
    },

    async health(request: Request) {
      try {
        validateRequestBoundary(
          request,
          [],
          limits.requestQueryBytes
        );
        const status = configurationStatus((getApiKey() ?? "").trim());
        return jsonResponse(
          {
            ok: status === "configured",
            ready: status === "configured",
            service: "website-free-query",
            version: FREE_QUERY_VERSION,
            provider: FREE_QUERY_PROVIDER,
            configured: status === "configured",
            configuration: status,
            ...(status === "configured"
              ? {}
              : {
                  error: {
                    code: "not_configured",
                    message: "The query service is not configured."
                  }
                })
          },
          status === "configured" ? 200 : 503
        );
      } catch (error) {
        return errorResponse(error);
      }
    }
  };
}

export const freeQueryService = createFreeQueryService();
