const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();
const cjkPattern = /[\u3400-\u9fff\uF900-\uFAFF]/;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

async function loadChangelog() {
  const url = pathToFileURL(path.join(root, "apps/website/lib/changelog.ts"));
  return import(`${url.href}?test=${Date.now()}-${Math.random()}`);
}

test("changelog exposes paired, newest-first public release records", async () => {
  const { getChangelogEntries, getRecentChangelogEntries } = await loadChangelog();
  const zhEntries = getChangelogEntries("zh");
  const enEntries = getChangelogEntries("en");

  assert.equal(zhEntries.length, 3);
  assert.equal(enEntries.length, zhEntries.length);
  assert.deepEqual(
    enEntries.map((entry) => entry.id),
    zhEntries.map((entry) => entry.id)
  );
  assert.equal(new Set(zhEntries.map((entry) => entry.id)).size, zhEntries.length);
  assert.ok(zhEntries.every((entry) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)));
  assert.ok(zhEntries.every((entry) => Number.isFinite(Date.parse(entry.releasedAt))));

  const timestamps = zhEntries.map((entry) => Date.parse(entry.releasedAt));
  assert.deepEqual(timestamps, [...timestamps].sort((left, right) => right - left));
  assert.deepEqual(
    getRecentChangelogEntries("en", 2).map((entry) => entry.id),
    enEntries.slice(0, 2).map((entry) => entry.id)
  );
  assert.deepEqual(getRecentChangelogEntries("zh", 0), []);
  assert.equal(getRecentChangelogEntries("zh", Number.NaN).length, 3);

  for (const entry of enEntries) {
    assert.doesNotMatch(JSON.stringify(entry), cjkPattern);
    assert.ok(entry.title.length > 0);
    assert.ok(entry.summary.length > 0);
    assert.ok(entry.highlights.length > 0);
  }

  const publicEvidence = JSON.stringify(zhEntries);
  for (const pull of [5, 6, 7]) {
    assert.match(publicEvidence, new RegExp(`github\\.com/Oracle0703/website/pull/${pull}`));
  }
  assert.doesNotMatch(publicEvidence, /PWA|项目证据画廊|离线支持/);
});

test("changelog routes are bilingual static pages with canonical metadata", () => {
  const page = read("apps/website/app/changelog/changelog-page.tsx");
  const zhRoute = read("apps/website/app/changelog/page.tsx");
  const enRoute = read("apps/website/app/en/changelog/page.tsx");

  assert.match(page, /getChangelogEntries\(locale\)/);
  assert.match(page, /<ol/);
  assert.match(page, /<article/);
  assert.match(page, /dateTime=\{entry\.releasedAt\}/);
  assert.match(page, /aria-labelledby=\{titleId\}/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.doesNotMatch(page, /"use client"|fetch\(|cookies\(|headers\(|localStorage|window\.|document\./);

  assert.match(zhRoute, /getLanguageAlternates\("\/changelog"\)/);
  assert.match(zhRoute, /<ChangelogPage locale=\{defaultLocale\}/);
  assert.match(enRoute, /getLanguageAlternates\("\/en\/changelog"\)/);
  assert.match(enRoute, /canonical: toAbsoluteUrl\("\/en\/changelog"\)/);
  assert.match(enRoute, /<ChangelogPage locale=\{locale\}/);
});

test("home, Explore, footer, routes, and search expose the changelog", async () => {
  const routesUrl = pathToFileURL(path.join(root, "apps/website/lib/public-routes.mjs"));
  const routes = await import(`${routesUrl.href}?test=${Date.now()}`);
  const zhHome = read("apps/website/app/page.tsx");
  const enHome = read("apps/website/app/en/page.tsx");
  const home = read("apps/website/components/home/home-page-client.tsx");
  const explore = read("apps/website/app/explore/explore-page.tsx");
  const footerCopy = read("apps/website/lib/i18n-shell.ts");
  const search = read("apps/website/lib/site-search.ts");

  assert.ok(routes.PUBLIC_WEBSITE_ROUTES.includes("/changelog"));
  assert.ok(routes.PUBLIC_WEBSITE_EN_ROUTES.includes("/en/changelog"));

  for (const source of [zhHome, enHome]) {
    assert.match(source, /getRecentChangelogEntries\([^,]+, 3\)/);
    assert.match(source, /latestChangelogItems=\{latestChangelogItems\}/);
    assert.match(source, /changelogCopy=\{changelogCopy\.home\}/);
  }
  assert.match(home, /latestChangelogItems\.slice\(0, 3\)\.map/);
  assert.match(home, /`\/changelog#\$\{entry\.id\}`/);
  assert.doesNotMatch(home, /"use client"/);
  assert.match(explore, /href: "\/changelog"/);
  assert.match(explore, /Current snapshot/);
  assert.match(footerCopy, /href: "\/changelog", label: "更新日志", localized: true/);
  assert.match(footerCopy, /href: "\/changelog", label: "Changelog", localized: true/);
  assert.match(search, /title: "更新日志"[\s\S]*path: "\/changelog"/);
  assert.match(search, /title: "Changelog"[\s\S]*path: "\/changelog"/);
});
