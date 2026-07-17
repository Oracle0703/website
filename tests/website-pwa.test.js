const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

async function loadGenerator() {
  return import(pathToFileURL(path.join(root, "scripts/generate-website-service-worker.mjs")).href);
}

test("locale-specific web app manifests define installable local-first shells", () => {
  const rootMetadata = read("apps/website/lib/root-metadata.ts");
  const chineseLayout = read("apps/website/app/(zh)/layout.tsx");
  const rootManifest = JSON.parse(read("apps/website/public/manifest.webmanifest"));
  const englishLayout = read("apps/website/app/en/layout.tsx");
  const englishManifest = JSON.parse(read("apps/website/public/en/manifest.webmanifest"));

  assert.match(chineseLayout, /getRootMetadata\("zh"\)/);
  assert.match(englishLayout, /getRootMetadata\("en"\)/);
  assert.match(rootMetadata, /locale === "en" \? "\/en\/manifest\.webmanifest" : "\/manifest\.webmanifest"/);
  assert.equal(rootManifest.id, "/");
  assert.equal(rootManifest.lang, "zh-CN");
  assert.equal(rootManifest.start_url, "/tracker");
  assert.equal(rootManifest.scope, "/");
  assert.equal(rootManifest.display, "standalone");
  assert.deepEqual(
    rootManifest.shortcuts.map(({ name, url }) => ({ name, url })),
    [
      { name: "习惯打卡", url: "/tracker" },
      { name: "开发者工具箱", url: "/labs/tools" }
    ]
  );
  assert.equal(rootManifest.icons.some(({ src }) => src === "/icon-192.png"), true);
  assert.equal(rootManifest.icons.some(({ src }) => src === "/icon-512.png"), true);
  assert.equal(rootManifest.icons.some(({ purpose }) => purpose === "maskable"), false);

  assert.equal(englishManifest.id, "/en/");
  assert.equal(englishManifest.lang, "en");
  assert.equal(englishManifest.start_url, "/en/tracker");
  assert.equal(englishManifest.scope, "/en/");
  assert.equal(englishManifest.display, "standalone");
  assert.deepEqual(
    englishManifest.shortcuts.map(({ name, url }) => ({ name, url })),
    [
      { name: "Habit Tracker", url: "/en/tracker" },
      { name: "Developer Tools", url: "/en/labs/tools" }
    ]
  );
  assert.doesNotMatch(JSON.stringify(englishManifest), /[\u3400-\u9fff]/);
});

test("static verifier checks built HTML manifest links and both manifest payloads", () => {
  const source = read("scripts/verify-website-static-entrypoints.mjs");

  assert.match(source, /verifyManifestLink\(route, html\)/);
  assert.match(source, /route\.locale === "en" \? "\/en\/manifest\.webmanifest"/);
  assert.match(source, /manifestTags\.length !== 1/);
  assert.match(source, /verifyPwaManifest/);
  assert.match(source, /startUrl:\s*"\/tracker"/);
  assert.match(source, /startUrl:\s*"\/en\/tracker"/);
  assert.match(source, /shortcutUrls:\s*\["\/en\/tracker", "\/en\/labs\/tools"\]/);
});

test("service worker generator extracts only hashed Next static assets", async () => {
  const generator = await loadGenerator();
  const html = `
    <link rel="stylesheet" href="/_next/static/css/site.css?v=1">
    <script src="/_next/static/chunks/app.js"></script>
    <img src="/private/contact.png">
    <script src="https://example.com/external.js"></script>
  `;

  assert.deepEqual(generator.extractStaticAssetPaths(html), [
    "/_next/static/chunks/app.js",
    "/_next/static/css/site.css"
  ]);
  const precache = generator.createPrecacheUrls(generator.extractStaticAssetPaths(html));
  assert.ok(precache.includes("/tracker"));
  assert.ok(precache.includes("/en/tracker"));
  assert.ok(precache.includes("/labs/tools"));
  assert.ok(precache.includes("/en/labs/tools"));
  assert.ok(precache.includes("/manifest.webmanifest"));
  assert.ok(precache.includes("/en/manifest.webmanifest"));
  assert.equal(precache.some((url) => url.startsWith("/api/")), false);
  assert.equal(precache.some((url) => url.includes("contact")), false);
  assert.equal(precache.some((url) => url.includes("query")), false);
});

test("generated service worker is release-scoped and network-only outside the exact allowlist", async () => {
  const generator = await loadGenerator();
  const source = generator.renderServiceWorker({
    buildId: "test-build-123",
    staticAssets: ["/_next/static/chunks/app.js", "/_next/static/css/site.css"]
  });

  assert.match(source, /test-build-123/);
  assert.match(source, /CACHE_PREFIX = "meaningful-ink-offline-v1-"/);
  assert.match(source, /RETAINED_PREVIOUS_CACHES = 1/);
  assert.match(source, /request\.method !== "GET"/);
  assert.match(source, /url\.search !== ""/);
  assert.match(source, /request\.headers\.get\("RSC"\) === "1"/);
  assert.match(source, /Next-Router-State-Tree/);
  assert.match(source, /Next-Router-Prefetch/);
  assert.match(source, /isNetworkOnlyPath/);
  assert.match(source, /\/api\//);
  assert.match(source, /\/contact/);
  assert.match(source, /\/ai-page-analysis/);
  assert.match(source, /\/labs\/query/);
  assert.match(source, /\/search-index\.json/);
  assert.match(source, /\/rss\.xml/);
  assert.match(source, /matchReleaseCache\(url\.pathname\)/);
  assert.match(source, /url\.pathname\.startsWith\(NEXT_STATIC_PREFIX\)/);
  assert.match(source, /slice\(-RETAINED_PREVIOUS_CACHES\)/);
  assert.doesNotMatch(source, /cache\.put\(/);
  assert.doesNotMatch(source, /\bsync\b|pushManager|localStorage|indexedDB/i);
});

test("service worker cache cleanup keeps exactly the current and previous release", async () => {
  const generator = await loadGenerator();
  const prefix = "meaningful-ink-offline-v1-";
  const current = `${prefix}build-4`;
  const cacheNames = [
    "unrelated-cache",
    `${prefix}build-1`,
    `${prefix}build-2`,
    `${prefix}build-3`,
    current
  ];

  assert.deepEqual(generator.selectReleaseCachesToDelete(cacheNames, current), [
    `${prefix}build-1`,
    `${prefix}build-2`
  ]);
  assert.deepEqual(
    generator.selectReleaseCachesToDelete(["unrelated-cache", `${prefix}build-3`, current], current),
    []
  );
  assert.equal(generator.RETAINED_PREVIOUS_CACHES, 1);
  assert.deepEqual(generator.selectReleaseCacheLookupNames(cacheNames, current), [
    current,
    `${prefix}build-3`
  ]);
});

test("generator fails closed unless every offline route has prerendered HTML", async () => {
  const generator = await loadGenerator();
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "meaningful-pwa-"));

  try {
    fs.mkdirSync(path.join(temporaryRoot, ".next"), { recursive: true });
    fs.writeFileSync(path.join(temporaryRoot, ".next", "BUILD_ID"), "static-test-build\n");

    await assert.rejects(
      generator.generateServiceWorker({ websiteRoot: temporaryRoot }),
      /not a prerendered HTML file/
    );

    for (const route of generator.OFFLINE_ROUTES) {
      const htmlPath = generator.routeHtmlPath(temporaryRoot, route);
      fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
      fs.writeFileSync(
        htmlPath,
        `<link href="/_next/static/css/site.css"><script src="/_next/static/chunks/${route.replaceAll("/", "-")}.js"></script>`
      );
    }

    const result = await generator.generateServiceWorker({ websiteRoot: temporaryRoot });
    const source = fs.readFileSync(result.outputPath, "utf8");
    assert.match(source, /static-test-build/);
    for (const route of generator.OFFLINE_ROUTES) assert.match(source, new RegExp(route.replaceAll("/", "\\/")));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("PWA controls register securely and require a user action for updates", () => {
  const source = read("apps/website/components/pwa-controls.tsx");
  const footer = read("apps/website/components/site-footer.tsx");

  assert.match(source, /window\.isSecureContext/);
  assert.match(source, /register\("\/sw\.js", \{ scope: "\/", updateViaCache: "none" \}\)/);
  assert.match(source, /beforeinstallprompt/);
  assert.match(source, /userChoice/);
  assert.match(source, /waitingWorker\.postMessage\(\{ type: "SKIP_WAITING" \}\)/);
  assert.match(source, /controllerchange/);
  assert.match(source, /role="status"/);
  assert.match(footer, /<PwaControls locale=\{locale\} \/>/);
});

test("offline navigation uses cached document loads and blocks network-only interactions", () => {
  const boundary = read("apps/website/components/pwa-offline-boundary.tsx");
  const languageProvider = read("apps/website/components/language-provider.tsx");
  const search = read("apps/website/components/site-search.tsx");
  const routes = read("apps/website/lib/pwa-navigation.ts");
  const header = read("apps/website/components/site-header.tsx");
  const footer = read("apps/website/components/site-footer.tsx");
  const tracker = read("apps/website/app/tracker/tracker-client.tsx");
  const toolsPage = read("apps/website/app/labs/tools/developer-tools-page.tsx");

  for (const route of ["/tracker", "/en/tracker", "/labs/tools", "/en/labs/tools"]) {
    assert.match(routes, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(boundary, /document\.addEventListener\("click", handleDocumentClick, true\)/);
  assert.match(boundary, /window\.location\.assign/);
  assert.match(boundary, /data-offline-route="tracker"/);
  assert.match(boundary, /data-offline-route="tools"/);
  assert.match(languageProvider, /isOfflinePagePath\(targetPath\)/);
  assert.match(languageProvider, /window\.location\.assign\(targetPath\)/);
  assert.match(search, /disabled=\{!online\}/);
  assert.match(search, /announceBlockedOfflineNavigation/);
  assert.match(header, /href=\{getHref\("\/"\)\}[\s\S]*?prefetch=\{false\}/);
  assert.match(header, /href=\{getHref\(item\.href\)\}[\s\S]*?prefetch=\{false\}/);
  assert.match(footer, /href=\{getLocalePath\(item\.href, locale\)\}[\s\S]*?prefetch=\{false\}/);
  assert.equal((tracker.match(/prefetch=\{false\}/g) ?? []).length, 2);
  assert.match(toolsPage, /href=\{getLocalePath\("\/labs", locale\)\}[\s\S]*?prefetch=\{false\}/);
});

test("build and response headers make the generated root-scoped worker updateable", async () => {
  const packageJson = JSON.parse(read("apps/website/package.json"));
  const nextConfig = require(path.join(root, "apps/website/next.config.js"));
  const standaloneVerifier = read("scripts/verify-website-standalone.ps1");
  const rules = await nextConfig.headers();
  const workerRule = rules.find((rule) => rule.source === "/sw.js");
  const headers = new Map(workerRule?.headers.map(({ key, value }) => [key, value]));

  assert.match(packageJson.scripts.build, /next build && node \.\.\/\.\.\/scripts\/generate-website-service-worker\.mjs/);
  assert.equal(headers.get("Cache-Control"), "no-cache");
  assert.equal(headers.get("Service-Worker-Allowed"), "/");
  assert.match(read(".gitignore"), /apps\/website\/public\/sw\.js/);
  assert.match(
    read(".github/workflows/website-windows-release.yml"),
    /scripts\/generate-website-service-worker\.mjs/
  );
  assert.match(standaloneVerifier, /function Get-ResponseContentText/);
  assert.match(standaloneVerifier, /\[System\.Text\.Encoding\]::UTF8\.GetString\(\$content\)/);
  assert.match(
    standaloneVerifier,
    /\$pwaManifest = Get-ResponseContentText \$pwaManifestResponse \| ConvertFrom-Json/
  );
});
