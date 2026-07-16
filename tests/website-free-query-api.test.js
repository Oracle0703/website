const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

async function loadModule() {
  const url = pathToFileURL(path.join(root, "apps/website/lib/free-query.ts"));
  return import(`${url.href}?test=${Date.now()}-${Math.random()}`);
}

function request(pathname, headers = {}, method = "GET") {
  return new Request(`https://www.meaningful.ink${pathname}`, { method, headers });
}

function weatherPayload() {
  return {
    location: {
      name: "Shanghai",
      region: "Shanghai",
      country: "China",
      lat: 31.23,
      lon: 121.47,
      localtime: "2026-07-16 15:30"
    },
    current: {
      last_updated: "2026-07-16 15:15",
      temp_c: 31.2,
      temp_f: 88.2,
      feelslike_c: 36.4,
      feelslike_f: 97.5,
      humidity: 72,
      wind_kph: 13.3,
      wind_mph: 8.3,
      condition: {
        text: "Partly cloudy",
        icon: "//cdn.weatherapi.com/secret-icon.png"
      },
      air_quality: {
        co: 210.4,
        pm2_5: 18.5,
        pm10: 27.2,
        "us-epa-index": 2
      }
    },
    forecast: {
      forecastday: [
        {
          date: "2026-07-16",
          day: {
            maxtemp_c: 34,
            maxtemp_f: 93.2,
            mintemp_c: 27,
            mintemp_f: 80.6,
            daily_chance_of_rain: 35,
            condition: { text: "Cloudy", icon: "//cdn.example.test/cloud.png" }
          },
          hour: new Array(24).fill({ temp_c: 30 })
        },
        {
          date: "2026-07-17",
          day: {
            maxtemp_c: 33,
            maxtemp_f: 91.4,
            mintemp_c: 26,
            mintemp_f: 78.8,
            daily_chance_of_rain: 50,
            condition: { text: "Rain" }
          }
        },
        {
          date: "2026-07-18",
          day: {
            maxtemp_c: 32,
            maxtemp_f: 89.6,
            mintemp_c: 25,
            mintemp_f: 77,
            daily_chance_of_rain: 60,
            condition: { text: "Rain" }
          }
        },
        {
          date: "2026-07-19",
          day: {
            maxtemp_c: 30,
            maxtemp_f: 86,
            mintemp_c: 24,
            mintemp_f: 75.2,
            daily_chance_of_rain: 10,
            condition: { text: "Sunny" }
          }
        }
      ]
    },
    key: "must-never-be-forwarded"
  };
}

test("free query parsers enforce strict parameters, origins, and canonical coordinates", async () => {
  const {
    FreeQueryError,
    parseLocationRequest,
    parseWeatherRequest
  } = await loadModule();

  assert.deepEqual(
    parseLocationRequest(request("/api/query/locations?q=%E4%B8%8A%E6%B5%B7&lang=zh")),
    { q: "上海", lang: "zh" }
  );
  assert.deepEqual(
    parseWeatherRequest(
      request("/api/query/weather?q=31.230400%2C121.473700&lang=en&units=imperial")
    ),
    { q: "31.2304,121.4737", lang: "en", units: "imperial" }
  );

  for (const target of [
    "/api/query/locations?q=Paris&q=London&lang=en",
    "/api/query/locations?q=Paris&lang=en&url=https%3A%2F%2Fevil.test",
    "/api/query/locations?q=auto%3Aip&lang=en",
    "/api/query/weather?q=999%2C999&lang=en&units=metric"
  ]) {
    assert.throws(
      () =>
        target.includes("/weather")
          ? parseWeatherRequest(request(target))
          : parseLocationRequest(request(target)),
      (error) => error instanceof FreeQueryError && error.code === "invalid_request"
    );
  }

  assert.throws(
    () =>
      parseLocationRequest(
        request("/api/query/locations?q=Paris&lang=en", {
          origin: "https://evil.example",
          "sec-fetch-site": "cross-site"
        })
      ),
    (error) => error instanceof FreeQueryError && error.code === "cross_origin_denied"
  );

  assert.throws(
    () =>
      parseLocationRequest(
        request("/api/query/locations?q=Paris&lang=en", {
          "sec-fetch-site": "same-site"
        })
      ),
    (error) => error instanceof FreeQueryError && error.code === "cross_origin_denied"
  );
});

test("free query normalizers trim upstream responses and map US EPA categories", async () => {
  const { normalizeLocationsPayload, normalizeWeatherPayload } = await loadModule();
  const locations = normalizeLocationsPayload([
    { id: 1, name: "Shanghai", region: "Shanghai", country: "China", lat: 31.23, lon: 121.47 },
    { id: 2, name: "Broken", lat: 999, lon: 999 },
    { id: 3, name: "Paris", region: "Ile-de-France", country: "France", lat: 48.86, lon: 2.35 }
  ]);

  assert.equal(locations.length, 2);
  assert.deepEqual(locations[0], {
    id: "1",
    name: "Shanghai",
    region: "Shanghai",
    country: "China",
    lat: 31.23,
    lon: 121.47
  });

  const metric = normalizeWeatherPayload(weatherPayload(), "metric", "zh");
  assert.equal(metric.current.temperature, 31.2);
  assert.equal(metric.current.windSpeed, 13.3);
  assert.equal(metric.forecast.length, 3);
  assert.equal(metric.airQuality.aqi, 2);
  assert.equal(metric.airQuality.label, "中等");
  assert.equal(metric.units, "metric");
  assert.doesNotMatch(JSON.stringify(metric), /icon|hour|must-never-be-forwarded/);

  const imperial = normalizeWeatherPayload(weatherPayload(), "imperial", "en");
  assert.equal(imperial.current.temperature, 88.2);
  assert.equal(imperial.current.windSpeed, 8.3);
  assert.equal(imperial.forecast[0].maxTemperature, 93.2);
  assert.equal(imperial.airQuality.label, "Moderate");
});

test("query health is local-only and never exposes or validates the upstream key", async () => {
  const { createFreeQueryService } = await loadModule();
  let fetchCalls = 0;
  const missing = createFreeQueryService({
    getApiKey: () => "",
    fetcher: async () => {
      fetchCalls += 1;
      throw new Error("health must not fetch");
    }
  });
  const missingResponse = await missing.health(request("/api/query/healthz"));
  const missingBody = await missingResponse.json();

  assert.equal(missingResponse.status, 503);
  assert.equal(missingBody.ready, false);
  assert.equal(missingBody.configuration, "not_configured");
  assert.equal(missingBody.error.code, "not_configured");

  const key = "weather-test-secret-key";
  const ready = createFreeQueryService({ getApiKey: () => key });
  const readyResponse = await ready.health(request("/api/query/healthz"));
  const readyText = await readyResponse.text();

  assert.equal(readyResponse.status, 200);
  assert.doesNotMatch(readyText, new RegExp(key));
  assert.equal(fetchCalls, 0);
  assert.equal(readyResponse.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(readyResponse.headers.get("access-control-allow-origin"), null);
});

test("locations endpoint uses a fixed upstream, normalized envelope, and bounded cache", async () => {
  const { createFreeQueryService } = await loadModule();
  const calls = [];
  const key = "weather-test-secret-key";
  const service = createFreeQueryService({
    getApiKey: () => key,
    fetcher: async (url, init) => {
      calls.push({ url: String(url), init });
      return Response.json([
        { id: 10, name: "Shanghai", region: "Shanghai", country: "China", lat: 31.23, lon: 121.47 }
      ]);
    }
  });

  const first = await service.locations(
    request("/api/query/locations?q=Shanghai&lang=zh", { "x-real-ip": "203.0.113.7" })
  );
  const firstText = await first.text();
  const second = await service.locations(
    request("/api/query/locations?q=Shanghai&lang=zh", { "x-real-ip": "203.0.113.7" })
  );
  const secondBody = await second.json();
  const english = await service.locations(
    request("/api/query/locations?q=Shanghai&lang=en", { "x-real-ip": "203.0.113.7" })
  );

  assert.equal(first.status, 200);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /^https:\/\/api\.weatherapi\.com\/v1\/search\.json\?/);
  assert.equal(new URL(calls[0].url).searchParams.get("q"), "Shanghai");
  assert.equal(new URL(calls[0].url).searchParams.get("key"), key);
  assert.equal(calls[0].init.redirect, "error");
  assert.doesNotMatch(firstText, new RegExp(key));
  assert.doesNotMatch(firstText, /api\.weatherapi\.com/);
  assert.equal(secondBody.meta.cached, true);
  assert.equal((await english.json()).meta.cached, true);
  assert.equal(calls.length, 1, "location data is shared across locales because upstream q is identical");
  assert.equal(second.headers.get("cache-control"), "private, no-store");
});

test("weather endpoint fixes upstream fields and returns the selected unit contract", async () => {
  const { createFreeQueryService } = await loadModule();
  const calls = [];
  const service = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    fetcher: async (url) => {
      calls.push(String(url));
      return Response.json(weatherPayload());
    }
  });

  const response = await service.weather(
    request("/api/query/weather?q=31.2304%2C121.4737&lang=en&units=imperial")
  );
  const body = await response.json();
  const upstream = new URL(calls[0]);

  assert.equal(response.status, 200);
  assert.equal(upstream.origin, "https://api.weatherapi.com");
  assert.equal(upstream.pathname, "/v1/forecast.json");
  assert.equal(upstream.searchParams.get("q"), "31.2304,121.4737");
  assert.equal(upstream.searchParams.get("days"), "3");
  assert.equal(upstream.searchParams.get("aqi"), "yes");
  assert.equal(upstream.searchParams.get("alerts"), "no");
  assert.equal(body.data.current.temperature, 88.2);
  assert.equal(body.data.current.windSpeed, 8.3);
  assert.equal(body.data.airQuality.aqi, 2);
  assert.equal(body.data.airQuality.label, "Moderate");
  assert.equal(body.meta.source, "WeatherAPI.com");
  assert.doesNotMatch(JSON.stringify(body), /hour|icon|key/);

  const metricResponse = await service.weather(
    request("/api/query/weather?q=31.2304%2C121.4737&lang=en&units=metric")
  );
  const metricBody = await metricResponse.json();
  assert.equal(metricBody.data.current.temperature, 31.2);
  assert.equal(metricBody.data.units, "metric");
  assert.equal(metricBody.meta.cached, true);
  assert.equal(calls.length, 1, "unit changes reuse the same small normalized upstream cache");
});

test("weather cache serves a clearly marked fallback only inside the 60 minute hard expiry", async () => {
  const { createFreeQueryService } = await loadModule();
  let clock = Date.parse("2026-07-16T00:00:00.000Z");
  let calls = 0;
  const service = createFreeQueryService({
    now: () => clock,
    getApiKey: () => "weather-test-secret-key",
    fetcher: async () => {
      calls += 1;
      if (calls > 1) throw new Error("upstream offline");
      return Response.json(weatherPayload());
    }
  });
  const target = "/api/query/weather?q=31.2304%2C121.4737&lang=zh&units=metric";

  assert.equal((await service.weather(request(target))).status, 200);
  clock += 16 * 60 * 1_000;
  const staleResponse = await service.weather(request(target));
  const staleBody = await staleResponse.json();
  assert.equal(staleResponse.status, 200);
  assert.equal(staleBody.meta.cached, true);
  assert.equal(staleBody.meta.stale, true);
  assert.equal(calls, 2);

  clock += 45 * 60 * 1_000;
  const expiredResponse = await service.weather(request(target));
  const expiredBody = await expiredResponse.json();
  assert.equal(expiredResponse.status, 503);
  assert.equal(expiredBody.error.code, "upstream_unavailable");
});

test("a refresh that crosses the hard expiry cannot return the captured stale entry", async () => {
  const { createFreeQueryService } = await loadModule();
  const startedAt = Date.parse("2026-07-16T00:00:00.000Z");
  let clock = startedAt;
  let calls = 0;
  const service = createFreeQueryService({
    now: () => clock,
    getApiKey: () => "weather-test-secret-key",
    fetcher: async () => {
      calls += 1;
      if (calls === 1) return Response.json(weatherPayload());
      clock = startedAt + 61 * 60 * 1_000;
      throw new Error("refresh crossed hard expiry");
    }
  });
  const target = "/api/query/weather?q=31.2304%2C121.4737&lang=zh&units=metric";

  assert.equal((await service.weather(request(target))).status, 200);
  clock = startedAt + 59 * 60 * 1_000 + 59_000;
  const response = await service.weather(request(target));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "upstream_unavailable");
});

test("all requests count toward local limits while cache misses consume the upstream budget", async () => {
  const { createFreeQueryService } = await loadModule();
  let fetchCalls = 0;
  const rateLimited = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    limits: { locationsPerMinute: 2 },
    fetcher: async () => {
      fetchCalls += 1;
      return Response.json([
        { id: 1, name: "Paris", region: "Ile-de-France", country: "France", lat: 48.86, lon: 2.35 }
      ]);
    }
  });
  const target = request("/api/query/locations?q=Paris&lang=en", { "x-real-ip": "198.51.100.4" });
  assert.equal((await rateLimited.locations(target.clone())).status, 200);
  assert.equal((await rateLimited.locations(target.clone())).status, 200);
  const third = await rateLimited.locations(target.clone());
  assert.equal(third.status, 429);
  assert.equal((await third.json()).error.code, "rate_limited");
  assert.ok(Number(third.headers.get("retry-after")) >= 1);
  assert.equal(fetchCalls, 1, "cache hits still rate limit but do not call the provider");

  const budgeted = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    limits: { upstreamPerMinute: 1 },
    fetcher: async () => Response.json([])
  });
  assert.equal((await budgeted.locations(request("/api/query/locations?q=Paris&lang=en"))).status, 200);
  const exhausted = await budgeted.locations(request("/api/query/locations?q=London&lang=en"));
  assert.equal(exhausted.status, 503);
  assert.equal((await exhausted.json()).error.code, "upstream_budget_exhausted");
  assert.equal(exhausted.headers.get("retry-after"), null);
});

test("invalid, cross-site, oversized, and unconfigured requests fail without upstream access", async () => {
  const { createFreeQueryService } = await loadModule();
  let calls = 0;
  const service = createFreeQueryService({
    getApiKey: () => "",
    fetcher: async () => {
      calls += 1;
      return Response.json([]);
    }
  });

  const unconfigured = await service.locations(
    request("/api/query/locations?q=Paris&lang=en")
  );
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).error.code, "not_configured");
  for (let index = 0; index < 12; index += 1) {
    const repeated = await service.weather(
      request("/api/query/weather?q=31.2304%2C121.4737&lang=en&units=metric")
    );
    assert.equal(repeated.status, 503);
    assert.equal((await repeated.json()).error.code, "not_configured");
  }

  const crossSite = await service.locations(
    request("/api/query/locations?q=Paris&lang=en", {
      origin: "https://evil.example",
      "sec-fetch-site": "cross-site"
    })
  );
  assert.equal(crossSite.status, 403);
  assert.equal((await crossSite.json()).error.code, "cross_origin_denied");

  const unknown = await service.locations(
    request("/api/query/locations?q=Paris&lang=en&callback=steal")
  );
  assert.equal(unknown.status, 400);
  assert.equal(calls, 0);

  let oversizedBodyCancelled = 0;
  const oversizedService = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    limits: { locationsResponseBytes: 16 },
    fetcher: async () =>
      new Response(new ReadableStream({ cancel() { oversizedBodyCancelled += 1; } }), {
        headers: { "content-length": "4096" }
      })
  });
  const oversized = await oversizedService.locations(
    request("/api/query/locations?q=Paris&lang=en")
  );
  assert.equal(oversized.status, 502);
  assert.equal((await oversized.json()).error.code, "upstream_response_too_large");
  assert.equal(oversizedBodyCancelled, 1);

  let errorBodyCancelled = 0;
  const rejectedService = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    fetcher: async () =>
      new Response(new ReadableStream({ cancel() { errorBodyCancelled += 1; } }), {
        status: 503
      })
  });
  const rejected = await rejectedService.locations(
    request("/api/query/locations?q=Paris&lang=en")
  );
  assert.equal(rejected.status, 503);
  assert.equal((await rejected.json()).error.code, "upstream_unavailable");
  assert.equal(errorBodyCancelled, 1);
});

test("the upstream timeout covers response-body streaming and maps broken bodies safely", async () => {
  const { createFreeQueryService } = await loadModule();
  const encoder = new TextEncoder();
  const timeoutService = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    limits: { upstreamTimeoutMs: 20 },
    fetcher: async (_url, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('{"location":'));
            init.signal.addEventListener(
              "abort",
              () => controller.error(new DOMException("aborted", "AbortError")),
              { once: true }
            );
          }
        })
      )
  });
  const target = "/api/query/weather?q=31.2304%2C121.4737&lang=en&units=metric";
  const timeoutResponse = await timeoutService.weather(request(target));
  assert.equal(timeoutResponse.status, 504);
  assert.equal((await timeoutResponse.json()).error.code, "upstream_timeout");

  const brokenBodyService = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    fetcher: async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('{"location":'));
            queueMicrotask(() => controller.error(new Error("connection reset")));
          }
        })
      )
  });
  const brokenResponse = await brokenBodyService.weather(request(target));
  assert.equal(brokenResponse.status, 503);
  assert.equal((await brokenResponse.json()).error.code, "upstream_unavailable");
});

test("a streaming response that crosses the byte cap keeps the precise 502 error", async () => {
  const { createFreeQueryService } = await loadModule();
  const encoder = new TextEncoder();
  const service = createFreeQueryService({
    getApiKey: () => "weather-test-secret-key",
    limits: { locationsResponseBytes: 8 },
    fetcher: async (_url, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("12345678901"));
            init.signal.addEventListener(
              "abort",
              () => controller.error(new DOMException("aborted", "AbortError")),
              { once: true }
            );
          }
        })
      )
  });

  const response = await service.locations(
    request("/api/query/locations?q=Paris&lang=en")
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error.code, "upstream_response_too_large");
});

test("query routes remain thin Node runtime adapters and source contains bounded protections", () => {
  const moduleSource = read("apps/website/lib/free-query.ts");
  for (const route of ["locations", "weather", "healthz"]) {
    const source = read(`apps/website/app/api/query/${route}/route.ts`);
    assert.match(source, /runtime = "nodejs"/);
    assert.match(source, /dynamic = "force-dynamic"/);
    assert.match(source, /freeQueryService/);
  }

  assert.match(moduleSource, /https:\/\/api\.weatherapi\.com/);
  assert.match(moduleSource, /upstreamPerDay:\s*2_500/);
  assert.match(moduleSource, /upstreamPerMonth:\s*75_000/);
  assert.match(moduleSource, /maxUpstreamConcurrency:\s*4/);
  assert.match(moduleSource, /maxUpstreamQueue:\s*16/);
  assert.match(moduleSource, /weatherFreshMs:\s*15 \* 60 \* 1_000/);
  assert.match(moduleSource, /weatherHardExpiryMs:\s*60 \* 60 \* 1_000/);
  assert.match(moduleSource, /redirect:\s*"error"/);
  assert.match(moduleSource, /WEATHERAPI_KEY/);
  assert.doesNotMatch(moduleSource, /NEXT_PUBLIC_WEATHERAPI_KEY/);
  assert.doesNotMatch(moduleSource, /console\.(?:log|error)|request_uri|Access-Control-Allow-Origin/);
});
