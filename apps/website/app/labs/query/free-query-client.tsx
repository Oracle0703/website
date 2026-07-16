"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Locale, Messages } from "../../../lib/i18n";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../../lib/typography";

type FreeQueryCopy = Messages["pages"]["freeQuery"];
type UnitSystem = "metric" | "imperial";

type LocationOption = {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
};

type ForecastDay = {
  date: string;
  condition: string | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  rainChance: number | null;
};

type WeatherView = {
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
  forecast: ForecastDay[];
  airQuality: {
    aqi: number | null;
    label: string | null;
    pm25: number | null;
    pm10: number | null;
  };
  updatedAt: string | null;
  stale: boolean;
};

type QueryPhase =
  | "idle"
  | "searching"
  | "locations"
  | "loading-weather"
  | "success"
  | "empty"
  | "error"
  | "not-configured";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function firstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);
    if (record) return record;
  }
  return null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function unwrapData(payload: unknown) {
  const root = asRecord(payload);
  return firstRecord(root?.data, root) ?? {};
}

function parseLocations(payload: unknown): LocationOption[] {
  const root = asRecord(payload);
  const data = unwrapData(payload);
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(data.locations)
      ? data.locations
      : Array.isArray(data.results)
        ? data.results
        : Array.isArray(root?.locations)
          ? root.locations
          : [];

  return source.flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];

    const name = firstString(record.name);
    const lat = firstNumber(record.lat, record.latitude);
    const lon = firstNumber(record.lon, record.longitude);
    if (
      !name ||
      lat === null ||
      lon === null ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return [];
    }

    return [
      {
        id: firstString(record.id) ?? `${lat},${lon},${index}`,
        name,
        region: firstString(record.region, record.admin1) ?? "",
        country: firstString(record.country) ?? "",
        lat,
        lon
      }
    ];
  });
}

function conditionText(value: unknown) {
  if (typeof value === "string") return firstString(value);
  const condition = asRecord(value);
  return firstString(condition?.text, condition?.label, condition?.name);
}

function parseForecastDay(value: unknown, units: UnitSystem): ForecastDay | null {
  const item = asRecord(value);
  if (!item) return null;
  const day = firstRecord(item.day, item) ?? item;
  const date = firstString(item.date, item.day);
  if (!date) return null;

  return {
    date,
    condition: conditionText(item.condition) ?? conditionText(day.condition),
    maxTemperature:
      units === "metric"
        ? firstNumber(
            day.maxTemperature,
            day.maxTemp,
            day.maxTempC,
            day.max_temp_c,
            day.maxtemp_c,
            day.highC
          )
        : firstNumber(
            day.maxTemperature,
            day.maxTemp,
            day.maxTempF,
            day.max_temp_f,
            day.maxtemp_f,
            day.highF
          ),
    minTemperature:
      units === "metric"
        ? firstNumber(
            day.minTemperature,
            day.minTemp,
            day.minTempC,
            day.min_temp_c,
            day.mintemp_c,
            day.lowC
          )
        : firstNumber(
            day.minTemperature,
            day.minTemp,
            day.minTempF,
            day.min_temp_f,
            day.mintemp_f,
            day.lowF
          ),
    rainChance: firstNumber(
      day.rainChance,
      day.chanceOfRain,
      day.chance_of_rain,
      day.daily_chance_of_rain
    )
  };
}

function parseWeather(payload: unknown, units: UnitSystem): WeatherView | null {
  const root = asRecord(payload);
  const data = unwrapData(payload);
  const location = asRecord(data.location);
  const current = asRecord(data.current);
  if (!location || !current) return null;

  const name = firstString(location.name);
  const temperature =
    units === "metric"
      ? firstNumber(current.temperature, current.temp, current.temperatureC, current.tempC, current.temp_c)
      : firstNumber(current.temperature, current.temp, current.temperatureF, current.tempF, current.temp_f);
  if (!name || temperature === null) return null;

  const forecastRecord = asRecord(data.forecast);
  const forecastSource = Array.isArray(data.forecast)
    ? data.forecast
    : Array.isArray(forecastRecord?.days)
      ? forecastRecord.days
      : Array.isArray(forecastRecord?.forecastday)
        ? forecastRecord.forecastday
        : [];
  const airQuality = firstRecord(
    data.airQuality,
    data.air_quality,
    current.airQuality,
    current.air_quality
  );
  const meta = firstRecord(root?.meta, data.meta);

  return {
    location: {
      name,
      region: firstString(location.region, location.admin1) ?? "",
      country: firstString(location.country) ?? "",
      localTime: firstString(location.localTime, location.local_time, location.localtime)
    },
    current: {
      temperature,
      feelsLike:
        units === "metric"
          ? firstNumber(
              current.feelsLike,
              current.feelsLikeC,
              current.feels_like_c,
              current.feelslike_c
            )
          : firstNumber(
              current.feelsLike,
              current.feelsLikeF,
              current.feels_like_f,
              current.feelslike_f
            ),
      humidity: firstNumber(current.humidity),
      windSpeed:
        units === "metric"
          ? firstNumber(current.windSpeed, current.windKph, current.wind_kph, current.windSpeedKph)
          : firstNumber(current.windSpeed, current.windMph, current.wind_mph, current.windSpeedMph),
      condition: conditionText(current.condition)
    },
    forecast: forecastSource
      .map((day) => parseForecastDay(day, units))
      .filter((day): day is ForecastDay => day !== null)
      .slice(0, 3),
    airQuality: {
      aqi: firstNumber(
        airQuality?.usEpaIndex,
        airQuality?.usAqi,
        airQuality?.us_aqi,
        airQuality?.["us-epa-index"],
        airQuality?.aqi
      ),
      label: firstString(
        airQuality?.label,
        airQuality?.category,
        airQuality?.usEpaCategory,
        airQuality?.level
      ),
      pm25: firstNumber(airQuality?.pm25, airQuality?.pm2_5, airQuality?.["pm2.5"]),
      pm10: firstNumber(airQuality?.pm10)
    },
    updatedAt: firstString(
      data.updatedAt,
      data.updated_at,
      current.updatedAt,
      current.lastUpdated,
      current.last_updated
    ),
    stale: meta?.stale === true
  };
}

function isNotConfigured(response: Response, payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const error = firstRecord(root?.error, data?.error);
  const code = firstString(error?.code, root?.code)?.toLowerCase() ?? "";

  return (
    root?.configured === false ||
    data?.configured === false ||
    code.includes("not_configured") ||
    code.includes("unconfigured") ||
    code.includes("missing_api_key") ||
    (response.status === 503 && code.includes("config"))
  );
}

function canonicalCoordinate(value: number) {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

function getLocationLabel(location: Pick<LocationOption, "name" | "region" | "country">) {
  return [location.name, location.region, location.country]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(" · ");
}

function formatDate(value: string, locale: Locale) {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return value;

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC"
  }).format(timestamp);
}

function formatNumber(value: number | null, unavailable: string, digits = 0) {
  if (value === null) return unavailable;
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

function WeatherResult({
  locale,
  copy,
  weather,
  units
}: {
  locale: Locale;
  copy: FreeQueryCopy;
  weather: WeatherView;
  units: UnitSystem;
}) {
  const temperatureUnit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "km/h" : "mph";
  const locationLabel = getLocationLabel({
    name: weather.location.name,
    region: weather.location.region,
    country: weather.location.country
  });
  const aqiCategory =
    weather.airQuality.aqi !== null &&
    Number.isInteger(weather.airQuality.aqi) &&
    weather.airQuality.aqi >= 1 &&
    weather.airQuality.aqi <= copy.aqiLevels.length
      ? copy.aqiLevels[weather.airQuality.aqi - 1]
      : weather.airQuality.label;
  const aqiDetail = [formatNumber(weather.airQuality.aqi, copy.unavailable), aqiCategory]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-10 space-y-10" aria-live="polite">
      <section className="border-y border-edge/70 py-8 md:py-10" aria-labelledby="query-result-title">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:items-end">
          <div>
            <p className="section-kicker">{copy.resultEyebrow}</p>
            <h2 id="query-result-title" className={`mt-3 ${TITLE_2XL}`}>
              {locationLabel}
            </h2>
            <p className="mt-3 text-base text-secondary">
              {weather.current.condition ?? copy.unavailable}
            </p>
            <p className="mt-5 text-6xl font-semibold tracking-[-0.06em] text-accent sm:text-7xl">
              {formatNumber(weather.current.temperature, copy.unavailable, 1)}
              <span className="ml-1 text-2xl text-secondary">{temperatureUnit}</span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px border border-edge/70 bg-edge/70 text-sm">
            {[
              [copy.feelsLike, `${formatNumber(weather.current.feelsLike, copy.unavailable, 1)}${weather.current.feelsLike === null ? "" : ` ${temperatureUnit}`}`],
              [copy.humidity, `${formatNumber(weather.current.humidity, copy.unavailable)}${weather.current.humidity === null ? "" : "%"}`],
              [copy.wind, `${formatNumber(weather.current.windSpeed, copy.unavailable, 1)}${weather.current.windSpeed === null ? "" : ` ${windUnit}`}`],
              [copy.localTime, weather.location.localTime ?? copy.unavailable]
            ].map(([label, value]) => (
              <div key={label} className="bg-base p-4">
                <dt className="text-muted">{label}</dt>
                <dd className="mt-1 font-semibold text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-xs text-muted">
          {copy.updatedAt}: {weather.updatedAt ?? copy.unavailable}
          {weather.stale ? (
            <span className="ml-2 font-semibold text-accent">· {copy.staleNotice}</span>
          ) : null}
        </p>
        <div className="mt-6 border-l-4 border-accent bg-surface/75 p-4 sm:p-5">
          <h3 className="font-semibold text-primary">{copy.disclaimerTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-secondary">{copy.disclaimer}</p>
        </div>
      </section>

      <section aria-labelledby="forecast-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">{copy.forecastEyebrow}</p>
            <h2 id="forecast-title" className={`mt-2 ${TITLE_2XL}`}>
              {copy.forecastTitle}
            </h2>
          </div>
        </div>

        {weather.forecast.length ? (
          <div className="mt-6 grid gap-px border-y border-edge/70 bg-edge/70 md:grid-cols-3">
            {weather.forecast.map((day) => (
              <article key={day.date} className="bg-base px-1 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                <p className="text-sm font-semibold text-accent-secondary">
                  {formatDate(day.date, locale)}
                </p>
                <h3 className="mt-3 min-h-6 font-semibold text-primary">
                  {day.condition ?? copy.unavailable}
                </h3>
                <dl className="mt-5 space-y-2 text-sm text-secondary">
                  <div className="flex justify-between gap-4">
                    <dt>{copy.maxTemperature}</dt>
                    <dd>{formatNumber(day.maxTemperature, copy.unavailable, 1)}{day.maxTemperature === null ? "" : ` ${temperatureUnit}`}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{copy.minTemperature}</dt>
                    <dd>{formatNumber(day.minTemperature, copy.unavailable, 1)}{day.minTemperature === null ? "" : ` ${temperatureUnit}`}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{copy.rainChance}</dt>
                    <dd>{formatNumber(day.rainChance, copy.unavailable)}{day.rainChance === null ? "" : "%"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className={`mt-5 ${TEXT_SM_MUTED}`}>{copy.unavailable}</p>
        )}
      </section>

      <section className="brand-banner grid gap-6 p-6 sm:p-8 md:grid-cols-[0.55fr_1fr] md:items-center" aria-labelledby="air-quality-title">
        <div>
          <p className="section-kicker">{copy.airQualityEyebrow}</p>
          <h2 id="air-quality-title" className={`mt-2 ${TITLE_2XL}`}>
            {copy.airQualityTitle}
          </h2>
        </div>
        <dl className="grid gap-px border-y border-edge/70 bg-edge/70 sm:grid-cols-3">
          {[
            [copy.aqi, aqiDetail],
            [copy.pm25, `${formatNumber(weather.airQuality.pm25, copy.unavailable, 1)}${weather.airQuality.pm25 === null ? "" : " μg/m³"}`],
            [copy.pm10, `${formatNumber(weather.airQuality.pm10, copy.unavailable, 1)}${weather.airQuality.pm10 === null ? "" : " μg/m³"}`]
          ].map(([label, value]) => (
            <div key={label} className="bg-surface/85 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</dt>
              <dd className="mt-2 text-lg font-semibold text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function FreeQueryClient({ locale, copy }: { locale: Locale; copy: FreeQueryCopy }) {
  const [query, setQuery] = useState("");
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [phase, setPhase] = useState<QueryPhase>("idle");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [weather, setWeather] = useState<WeatherView | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const locationResultsTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => () => requestController.current?.abort(), []);

  useEffect(() => {
    if (phase !== "locations") return;
    const frame = requestAnimationFrame(() => locationResultsTitleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const beginRequest = () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    return controller;
  };

  const searchLocations = async (rawQuery: string) => {
    const normalizedQuery = rawQuery.trim().replace(/\s+/g, " ");
    if (normalizedQuery.length < 2) return;

    setQuery(normalizedQuery);
    setPhase("searching");
    setLocations([]);
    setSelectedLocation(null);
    setWeather(null);
    const controller = beginRequest();

    try {
      const params = new URLSearchParams({ q: normalizedQuery, lang: locale });
      const response = await fetch(`/api/query/locations?${params.toString()}`, {
        headers: { accept: "application/json" },
        signal: controller.signal
      });
      const payload: unknown = await response.json().catch(() => null);

      if (isNotConfigured(response, payload)) {
        setPhase("not-configured");
        return;
      }
      if (!response.ok) throw new Error("location_query_failed");

      const nextLocations = parseLocations(payload);
      setLocations(nextLocations);
      setPhase(nextLocations.length ? "locations" : "empty");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPhase("error");
    }
  };

  const loadWeather = async (location: LocationOption, requestedUnits: UnitSystem = units) => {
    setSelectedLocation(location);
    setWeather(null);
    setPhase("loading-weather");
    const controller = beginRequest();

    try {
      const coordinateQuery = `${canonicalCoordinate(location.lat)},${canonicalCoordinate(location.lon)}`;
      const params = new URLSearchParams({
        q: coordinateQuery,
        lang: locale,
        units: requestedUnits
      });
      const response = await fetch(`/api/query/weather?${params.toString()}`, {
        headers: { accept: "application/json" },
        signal: controller.signal
      });
      const payload: unknown = await response.json().catch(() => null);

      if (isNotConfigured(response, payload)) {
        setPhase("not-configured");
        return;
      }
      if (!response.ok) throw new Error("weather_query_failed");

      const nextWeather = parseWeather(payload, requestedUnits);
      if (!nextWeather) throw new Error("weather_response_invalid");
      setWeather(nextWeather);
      setPhase("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPhase("error");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void searchLocations(query);
  };

  const handleRetry = () => {
    if (selectedLocation) {
      void loadWeather(selectedLocation);
      return;
    }
    void searchLocations(query);
  };

  const handleUnitChange = (nextUnits: UnitSystem) => {
    if (nextUnits === units) return;
    setUnits(nextUnits);
    if (selectedLocation) void loadWeather(selectedLocation, nextUnits);
  };

  const busy = phase === "searching" || phase === "loading-weather";

  return (
    <div>
      <section className="feature-surface p-5 sm:p-7 md:p-9" aria-labelledby="city-query-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12">
          <div>
            <p className="section-kicker">{copy.searchEyebrow}</p>
            <h2 id="city-query-title" className={`mt-2 ${TITLE_2XL}`}>
              {copy.searchTitle}
            </h2>
            <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{copy.searchDescription}</p>
          </div>

          <div>
            <form onSubmit={handleSubmit} aria-busy={busy} className="space-y-3">
              <label htmlFor="free-query-city" className="block text-sm font-semibold text-primary">
                {copy.inputLabel}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="free-query-city"
                  name="city"
                  type="search"
                  minLength={2}
                  maxLength={64}
                  required
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.inputPlaceholder}
                  className="min-h-11 w-full rounded-xl border border-edge bg-base/70 px-4 py-2.5 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <button type="submit" className="btn-primary shrink-0" disabled={busy}>
                  {phase === "searching" ? copy.searching : copy.submit}
                </button>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {copy.popularTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {copy.popularCities.map((city) => (
                  <button
                    key={city.query}
                    type="button"
                    className="rounded-full border border-edge px-3 py-1.5 text-sm font-medium text-secondary transition hover:border-edge-strong hover:bg-base/70 hover:text-primary"
                    onClick={() => void searchLocations(city.query)}
                    disabled={busy}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {copy.unitLabel}
              </span>
              <div
                className="inline-flex rounded-full border border-edge bg-base/55 p-1"
                role="group"
                aria-label={copy.unitLabel}
              >
                {(["metric", "imperial"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={units === unit}
                    onClick={() => handleUnitChange(unit)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      units === unit
                        ? "bg-accent text-on-accent"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    {unit === "metric" ? copy.metric : copy.imperial}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(phase === "searching" || phase === "loading-weather") && (
          <div className="mt-7 border-t border-edge/70 pt-5 text-sm font-medium text-secondary" role="status" aria-live="polite">
            <span className="mr-3 inline-block h-2 w-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" aria-hidden="true" />
            {phase === "searching" ? copy.searching : copy.loadingWeather}
          </div>
        )}

        {phase === "locations" && (
          <section className="mt-8 border-t border-edge/70 pt-6" aria-labelledby="location-results-title">
            <p className="sr-only" role="status" aria-live="polite">
              {copy.locationResultsStatus.replace("{count}", String(locations.length))}
            </p>
            <h3
              ref={locationResultsTitleRef}
              id="location-results-title"
              tabIndex={-1}
              className="text-lg font-semibold text-primary outline-none"
            >
              {copy.locationTitle}
            </h3>
            <p className={`mt-1 ${TEXT_SM_MUTED}`}>{copy.locationDescription}</p>
            <ul className="mt-4 divide-y divide-edge/70 border-y border-edge/70">
              {locations.map((location) => (
                <li key={location.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-5 px-1 py-4 text-left transition hover:bg-base/55 focus-visible:bg-base/55"
                    onClick={() => void loadWeather(location)}
                  >
                    <span>
                      <span className="block font-semibold text-primary">{location.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {[location.region, location.country].filter(Boolean).join(" · ") || copy.unavailable}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-accent">
                      {copy.chooseLocation} <span aria-hidden="true">→</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {phase === "empty" && (
          <div className="mt-8 border-l-2 border-accent-secondary pl-4" role="status" aria-live="polite">
            <h3 className="font-semibold text-primary">{copy.emptyTitle}</h3>
            <p className={`mt-1 ${TEXT_SM_MUTED}`}>{copy.emptyDescription}</p>
          </div>
        )}

        {(phase === "error" || phase === "not-configured") && (
          <div className="mt-8 border-l-2 border-accent pl-4" role="alert">
            <h3 className="font-semibold text-primary">
              {phase === "not-configured" ? copy.notConfiguredTitle : copy.errorTitle}
            </h3>
            <p className={`mt-1 ${TEXT_SM_MUTED}`}>
              {phase === "not-configured" ? copy.notConfiguredDescription : copy.errorDescription}
            </p>
            <button type="button" className="btn-secondary mt-4" onClick={handleRetry}>
              {copy.retry}
            </button>
          </div>
        )}
      </section>

      {phase === "success" && weather ? (
        <WeatherResult locale={locale} copy={copy} weather={weather} units={units} />
      ) : null}
    </div>
  );
}
