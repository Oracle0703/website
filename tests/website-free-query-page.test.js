const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

test("free query lab exposes bilingual static routes with canonical metadata", async () => {
  const zhPage = read("apps/website/app/labs/query/page.tsx");
  const enPage = read("apps/website/app/en/labs/query/page.tsx");
  const routes = await importFresh("apps/website/lib/public-routes.mjs");

  assert.match(zhPage, /getMessages\(defaultLocale\)/);
  assert.match(zhPage, /getLanguageAlternates\("\/labs\/query"\)/);
  assert.match(zhPage, /<FreeQueryPage locale=\{defaultLocale\} copy=\{pages\.freeQuery\} \/>/);
  assert.match(enPage, /const locale: Locale = "en"/);
  assert.match(enPage, /getMessages\(locale\)/);
  assert.match(enPage, /getLanguageAlternates\("\/en\/labs\/query"\)/);
  assert.match(enPage, /canonical: toAbsoluteUrl\("\/en\/labs\/query"\)/);

  for (const source of [zhPage, enPage]) {
    assert.doesNotMatch(source, /"use client"|cookies\(|headers\(|getLocale\(|useSearchParams/);
  }

  assert.ok(routes.PUBLIC_WEBSITE_ROUTES.includes("/labs/query"));
  assert.ok(routes.PUBLIC_WEBSITE_EN_ROUTES.includes("/en/labs/query"));
  assert.equal(routes.PUBLIC_WEBSITE_LOCALE_ROUTES.length, 28);
});

test("free query page keeps the interactive boundary narrow and documents same-origin APIs", () => {
  const page = read("apps/website/app/labs/query/free-query-page.tsx");
  const client = read("apps/website/app/labs/query/free-query-client.tsx");

  assert.doesNotMatch(page, /"use client"/);
  assert.match(page, /<main/);
  assert.match(page, /<FreeQueryClient locale=\{locale\} copy=\{copy\} \/>/);
  assert.match(page, /GET \/api\/query\/locations\?q=Shanghai&lang=/);
  assert.match(page, /GET \/api\/query\/weather\?q=31\.2304%2C121\.4737&lang=/);
  assert.match(page, /https:\/\/www\.weatherapi\.com\//);
  assert.match(page, /className="min-w-0 space-y-5"/);
  assert.equal((page.match(/max-w-full overflow-x-auto/g) ?? []).length, 2);

  assert.match(client, /^"use client";/);
  assert.match(client, /import type \{ Locale, Messages \}/);
  assert.doesNotMatch(client, /getMessages\(|useI18n\(/);
  assert.match(client, /fetch\(`\/api\/query\/locations\?/);
  assert.match(client, /fetch\(`\/api\/query\/weather\?/);
  assert.match(client, /new URLSearchParams\(\{ q: normalizedQuery, lang: locale \}\)/);
  assert.match(client, /units: requestedUnits/);
  assert.doesNotMatch(client, /new URLSearchParams\(\{[^}]*\b(?:days|lat|lon):/s);
  assert.match(client, /maxLength=\{64\}/);
  assert.match(client, /aria-pressed=\{units === unit\}/);
  assert.match(client, /locationResultsTitleRef\.current\?\.focus/);
  assert.match(client, /copy\.forecastEyebrow/);
  assert.match(client, /copy\.airQualityEyebrow/);
  assert.match(client, /root\?\.data/);
  assert.match(client, /meta\?\.stale === true/);
});

test("free query UI copy records attribution, privacy, fair-use, and safety boundaries", () => {
  const messages = read("apps/website/lib/i18n.ts");
  const labs = read("apps/website/app/labs/labs-client.tsx");

  assert.match(labs, /getHref\("\/labs\/query"\)/);
  assert.match(messages, /WeatherAPI\.com/);
  assert.match(messages, /不使用浏览器定位/);
  assert.match(messages, /Browser geolocation is not used/);
  assert.match(messages, /不开放 CORS/);
  assert.match(messages, /CORS is not enabled/);
  assert.match(messages, /仅供一般信息用途/);
  assert.match(messages, /general informational purposes only/);
  assert.match(messages, /美国 EPA 类别（1–6）/);
  assert.match(messages, /US EPA category \(1–6\)/);
  assert.match(messages, /航空、海事航行、应急规划/);
  assert.match(messages, /aviation, marine navigation, or emergency planning/);
  assert.match(messages, /不构成医疗建议/);
  assert.match(messages, /does not constitute medical advice/);
});
