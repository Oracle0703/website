import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes.mjs";
import { findAvailablePort } from "./lib/static-verifier-port.mjs";

const root = process.cwd();
const buildIdPath = `${root}/apps/website/.next/BUILD_ID`;
const nextCliPath = `${root}/node_modules/next/dist/bin/next`;
const providedBaseUrl = process.env.NEXT_STATIC_VERIFY_BASE_URL;
const requestedPort = Number(process.env.NEXT_STATIC_VERIFY_PORT ?? 4321);
const siteBaseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.meaningful.ink"
).replace(/\/$/, "");
const hydrationWarningPattern = /Hydration failed|Text content does not match|Minified React error/i;
const scriptSrcPattern = /<script[^>]+src="([^"]+\/_next\/static\/[^"]+\.js[^"]*)"[^>]*>/g;
const offlineRoutes = ["/tracker", "/en/tracker", "/labs/tools", "/en/labs/tools"];

let serverProcess;
let baseUrl = providedBaseUrl;

function fail(message) {
  throw new Error(message);
}

function normalizeAssetUrl(src) {
  return new URL(src.replace(/&amp;/g, "&"), baseUrl).toString();
}

async function fetchText(pathname) {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers: {
      "user-agent": "website-static-entrypoint-verifier"
    }
  });

  if (!response.ok) {
    fail(`${pathname} returned HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchPublicAsset(pathname, contentTypePattern) {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers: {
      "user-agent": "website-static-entrypoint-verifier"
    }
  });

  if (!response.ok) {
    fail(`${pathname} returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentTypePattern.test(contentType)) {
    fail(`${pathname} returned unexpected content-type ${contentType || "<missing>"}`);
  }

  return response;
}

async function verifySecurityHeaders(pathname = "/") {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers: {
      "user-agent": "website-static-entrypoint-verifier"
    }
  });

  if (!response.ok) {
    fail(`${pathname} returned HTTP ${response.status}`);
  }

  const exactHeaders = new Map([
    ["strict-transport-security", "max-age=31536000; includeSubDomains"],
    ["x-content-type-options", "nosniff"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["x-frame-options", "DENY"]
  ]);

  for (const [name, expected] of exactHeaders) {
    const actual = response.headers.get(name);
    if (actual !== expected) {
      fail(`${pathname} ${name} is ${actual ?? "<missing>"}; expected ${expected}`);
    }
  }

  const permissionsPolicy = response.headers.get("permissions-policy") ?? "";
  for (const directive of ["camera=()", "microphone=()", "geolocation=()"]) {
    if (!permissionsPolicy.includes(directive)) {
      fail(`${pathname} permissions-policy is missing ${directive}`);
    }
  }
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { headers: { "user-agent": "website-static-entrypoint-verifier" } });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  fail(`Timed out waiting for ${baseUrl}: ${lastError?.message ?? "unknown error"}`);
}

async function startServerIfNeeded() {
  if (providedBaseUrl) return;

  if (!existsSync(buildIdPath)) {
    fail("Missing apps/website/.next/BUILD_ID. Run npm run build:website before npm run verify:website-static.");
  }

  if (!existsSync(nextCliPath)) {
    fail("Missing node_modules/next/dist/bin/next. Run npm install before npm run verify:website-static.");
  }

  const port = await findAvailablePort(requestedPort, {
    explicitPort: process.env.NEXT_STATIC_VERIFY_PORT !== undefined
  });
  baseUrl = `http://127.0.0.1:${port}`;

  serverProcess = spawn(process.execPath, [nextCliPath, "start", "-p", String(port)], {
    cwd: `${root}/apps/website`,
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (chunk) => {
    const output = String(chunk);
    if (process.env.NEXT_STATIC_VERIFY_DEBUG) process.stdout.write(output);
  });

  serverProcess.stderr.on("data", (chunk) => {
    const output = String(chunk);
    if (process.env.NEXT_STATIC_VERIFY_DEBUG) process.stderr.write(output);
  });
}

async function stopServer() {
  if (!serverProcess) return;
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 2_000);
    serverProcess.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

function verifyHtml(route, html) {
  const expectedLang = route.locale === "en" ? "en" : "zh-CN";
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const actualLang = getTagAttribute(htmlTag, "lang");
  if (actualLang !== expectedLang) {
    fail(`${route.path} html lang is ${actualLang || "<missing>"}; expected ${expectedLang}`);
  }

  if (!html.includes("data-theme=")) {
    fail(`${route.path} is missing a data-theme attribute on html`);
  }

  if (!html.includes("localStorage")) {
    fail(`${route.path} is missing the preference boot localStorage restore script`);
  }

  if (!html.includes("document.documentElement.dataset.theme")) {
    fail(`${route.path} is missing the preference boot theme restore script`);
  }

  if (hydrationWarningPattern.test(html)) {
    fail(`${route.path} contains a hydration warning signature in HTML`);
  }
}

function getTagAttribute(tag, attribute) {
  const match = tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "i"));
  return match?.[1]?.replace(/&amp;/g, "&");
}

function findTag(html, tagName, identifyingAttribute, identifyingValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  return tags.find(
    (tag) => getTagAttribute(tag, identifyingAttribute)?.toLowerCase() === identifyingValue
  );
}

function findTags(html, tagName, identifyingAttribute, identifyingValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  return tags.filter(
    (tag) => getTagAttribute(tag, identifyingAttribute)?.toLowerCase() === identifyingValue
  );
}

function getExpectedPublicUrl(pathname) {
  return new URL(pathname, `${siteBaseUrl}/`).toString().replace(/\/$/, "");
}

function verifyMetadata(route, html) {
  const expectedCanonical = getExpectedPublicUrl(route.canonicalPath);
  const canonicalTag = findTag(html, "link", "rel", "canonical");
  const canonical = canonicalTag ? getTagAttribute(canonicalTag, "href") : undefined;
  if (canonical !== expectedCanonical) {
    fail(`${route.path} canonical is ${canonical ?? "<missing>"}; expected ${expectedCanonical}`);
  }

  const openGraphUrlTag = findTag(html, "meta", "property", "og:url");
  const openGraphUrl = openGraphUrlTag ? getTagAttribute(openGraphUrlTag, "content") : undefined;
  if (openGraphUrl !== expectedCanonical) {
    fail(`${route.path} og:url is ${openGraphUrl ?? "<missing>"}; expected ${expectedCanonical}`);
  }

  for (const [label, identifyingAttribute, identifyingValue] of [
    ["og:image", "property", "og:image"],
    ["twitter:image", "name", "twitter:image"]
  ]) {
    const tag = findTag(html, "meta", identifyingAttribute, identifyingValue);
    const value = tag ? getTagAttribute(tag, "content") : undefined;
    if (!value) {
      fail(`${route.path} is missing ${label}`);
    }

    const imageUrl = new URL(value);
    if (imageUrl.protocol !== "https:" || imageUrl.hostname === "localhost") {
      fail(`${route.path} ${label} must be a public HTTPS URL, received ${value}`);
    }
  }
}

function verifyManifestLink(route, html) {
  const manifestTags = findTags(html, "link", "rel", "manifest");
  if (manifestTags.length !== 1) {
    fail(`${route.path} has ${manifestTags.length} manifest links; expected exactly one`);
  }

  const actual = getTagAttribute(manifestTags[0], "href");
  const expected = route.locale === "en" ? "/en/manifest.webmanifest" : "/manifest.webmanifest";
  if (actual !== expected) {
    fail(`${route.path} manifest is ${actual ?? "<missing>"}; expected ${expected}`);
  }
}

function verifyRssDiscoveryLink(route, html) {
  const rssTags = findTags(html, "link", "rel", "alternate").filter(
    (tag) => getTagAttribute(tag, "type") === "application/rss+xml"
  );
  if (rssTags.length !== 1) {
    fail(`${route.path} has ${rssTags.length} RSS discovery links; expected exactly one`);
  }

  const actual = getTagAttribute(rssTags[0], "href");
  const expectedPath = route.locale === "en" ? "/en/rss.xml" : "/rss.xml";
  const expected = getExpectedPublicUrl(expectedPath);
  if (actual !== expected) {
    fail(`${route.path} RSS discovery URL is ${actual ?? "<missing>"}; expected ${expected}`);
  }
}

async function verifyRssFeed({ pathname, language, itemPathPrefix, requiredSlugs = [], forbiddenSlugs = [] }) {
  const response = await fetchPublicAsset(pathname, /^application\/rss\+xml/i);
  const xml = await response.text();

  if (!xml.includes("<rss version=\"2.0\"") || !xml.includes("<atom:link")) {
    fail(`${pathname} is missing the RSS 2.0 root or Atom self-discovery link`);
  }
  if (!xml.includes(`<language>${language}</language>`)) {
    fail(`${pathname} does not declare ${language}`);
  }
  if (!xml.includes(`href=\"${siteBaseUrl}${pathname}\" rel=\"self\"`)) {
    fail(`${pathname} has the wrong Atom self-discovery URL`);
  }

  const itemLinks = Array.from(
    xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g),
    (match) => match[1]
  );
  if (itemLinks.length === 0) {
    fail(`${pathname} has no published items`);
  }
  const expectedPrefix = `${siteBaseUrl}${itemPathPrefix}`;
  if (itemLinks.some((link) => !link.startsWith(expectedPrefix))) {
    fail(`${pathname} contains an item outside ${itemPathPrefix}`);
  }
  for (const slug of requiredSlugs) {
    if (!xml.includes(slug)) fail(`${pathname} is missing ${slug}`);
  }
  for (const slug of forbiddenSlugs) {
    if (xml.includes(slug)) fail(`${pathname} must not include ${slug}`);
  }
}

function verifyPwaManifest(manifest, expected) {
  if (
    manifest?.id !== expected.id ||
    manifest?.lang !== expected.lang ||
    manifest?.scope !== expected.scope ||
    manifest?.start_url !== expected.startUrl ||
    manifest?.display !== "standalone" ||
    !Array.isArray(manifest?.icons) ||
    !manifest.icons.some((icon) => icon?.src === "/icon-192.png" && icon?.sizes === "192x192") ||
    !manifest.icons.some((icon) => icon?.src === "/icon-512.png" && icon?.sizes === "512x512") ||
    !Array.isArray(manifest?.shortcuts) ||
    !expected.shortcutUrls.every((url) => manifest.shortcuts.some((shortcut) => shortcut?.url === url))
  ) {
    fail(`${expected.pathname} is missing its locale-specific install metadata`);
  }
}

function collectScriptSources(html) {
  return Array.from(html.matchAll(scriptSrcPattern), (match) => normalizeAssetUrl(match[1]));
}

async function verifyScriptBundles(scriptSources) {
  const uniqueSources = [...new Set(scriptSources)];

  for (const src of uniqueSources) {
    const response = await fetch(src, {
      headers: {
        "user-agent": "website-static-entrypoint-verifier"
      }
    });

    if (!response.ok) {
      fail(`${src} returned HTTP ${response.status}`);
    }

    const source = await response.text();
    if (hydrationWarningPattern.test(source)) {
      fail(`${src} contains a hydration warning signature`);
    }
  }
}

async function main() {
  await startServerIfNeeded();
  await waitForServer();

  const expectedBuildId = providedBaseUrl
    ? null
    : (await readFile(buildIdPath, "utf8")).trim();

  const scriptSources = [];

  for (const route of PUBLIC_WEBSITE_LOCALE_ROUTES) {
    const html = await fetchText(route.path);
    verifyHtml(route, html);
    verifyMetadata(route, html);
    verifyManifestLink(route, html);
    verifyRssDiscoveryLink(route, html);
    scriptSources.push(...collectScriptSources(html));
  }

  const robots = await fetchPublicAsset("/robots.txt", /^text\/plain/i);
  const robotsText = await robots.text();
  if (!robotsText.includes(`${siteBaseUrl}/sitemap.xml`)) {
    fail("robots.txt does not point to the production sitemap URL");
  }

  const sitemap = await fetchPublicAsset("/sitemap.xml", /^(application|text)\/(xml|[^;]+\+xml)/i);
  const sitemapText = await sitemap.text();
  for (const route of PUBLIC_WEBSITE_LOCALE_ROUTES) {
    const expectedUrl = getExpectedPublicUrl(route.canonicalPath);
    const shouldBeIndexed = route.canonicalPath !== "/enter" && route.canonicalPath !== "/en/enter";
    if (sitemapText.includes(`<loc>${expectedUrl}</loc>`) !== shouldBeIndexed) {
      fail(`sitemap.xml has the wrong indexability state for ${route.canonicalPath}`);
    }
  }

  await fetchPublicAsset("/favicon.ico", /^image\/(x-icon|vnd\.microsoft\.icon)/i);
  const socialImage = await fetchPublicAsset("/og.png", /^image\/png/i);
  if (Number(socialImage.headers.get("content-length") ?? 0) < 10_000) {
    fail("og.png is unexpectedly small; verify that the branded image replaced the flat placeholder");
  }

  const englishOnlySlugs = [
    "blog-content-model-state-machine",
    "timestamp-tool-retrospective-timezone-precision-ux"
  ];
  await verifyRssFeed({
    pathname: "/rss.xml",
    language: "zh-CN",
    itemPathPrefix: "/blog/",
    forbiddenSlugs: englishOnlySlugs
  });
  await verifyRssFeed({
    pathname: "/en/rss.xml",
    language: "en",
    itemPathPrefix: "/en/blog/",
    requiredSlugs: englishOnlySlugs
  });

  const searchIndex = await fetchPublicAsset("/search-index.json", /^application\/json/i);
  if (searchIndex.headers.get("x-robots-tag") !== "noindex, nofollow") {
    fail("search-index.json must opt out of search engine indexing");
  }
  const searchPayload = await searchIndex.json();
  if (
    searchPayload?.version !== 1 ||
    !Array.isArray(searchPayload.entries) ||
    searchPayload.entries.length === 0 ||
    !searchPayload.entries.some((entry) => entry?.locale === "zh") ||
    !searchPayload.entries.some((entry) => entry?.locale === "en")
  ) {
    fail("search-index.json is missing a valid bilingual v1 index");
  }

  const manifestResponse = await fetchPublicAsset(
    "/manifest.webmanifest",
    /^application\/(manifest\+json|json)/i
  );
  const manifest = await manifestResponse.json();
  verifyPwaManifest(manifest, {
    pathname: "/manifest.webmanifest",
    id: "/",
    lang: "zh-CN",
    scope: "/",
    startUrl: "/tracker",
    shortcutUrls: ["/tracker", "/labs/tools"]
  });

  const englishManifestResponse = await fetchPublicAsset(
    "/en/manifest.webmanifest",
    /^application\/(manifest\+json|json)/i
  );
  const englishManifest = await englishManifestResponse.json();
  verifyPwaManifest(englishManifest, {
    pathname: "/en/manifest.webmanifest",
    id: "/en/",
    lang: "en",
    scope: "/en/",
    startUrl: "/en/tracker",
    shortcutUrls: ["/en/tracker", "/en/labs/tools"]
  });

  const serviceWorkerResponse = await fetchPublicAsset(
    "/sw.js",
    /^(application|text)\/javascript/i
  );
  const workerCacheControl = serviceWorkerResponse.headers.get("cache-control") ?? "";
  if (!workerCacheControl.toLowerCase().includes("no-cache")) {
    fail(`sw.js cache-control must include no-cache, received ${workerCacheControl || "<missing>"}`);
  }
  if (serviceWorkerResponse.headers.get("service-worker-allowed") !== "/") {
    fail("sw.js must return Service-Worker-Allowed: /");
  }
  const serviceWorker = await serviceWorkerResponse.text();
  if (expectedBuildId) {
    if (!serviceWorker.includes(expectedBuildId)) {
      fail("sw.js does not contain the current Next.js BUILD_ID");
    }
  } else if (!/const BUILD_ID = "[A-Za-z0-9._-]{1,128}";/.test(serviceWorker)) {
    fail("sw.js does not contain a valid generated Next.js BUILD_ID");
  }
  for (const route of offlineRoutes) {
    if (!serviceWorker.includes(route)) fail(`sw.js is missing offline route ${route}`);
  }
  for (const signal of ["/api/", "/contact", "/ai-page-analysis", "/labs/query", "/search-index.json", "/rss.xml", "/en/rss.xml", "Next-Router-State-Tree"]) {
    if (!serviceWorker.includes(signal)) fail(`sw.js is missing network-only guard ${signal}`);
  }

  await verifySecurityHeaders();

  await verifyScriptBundles(scriptSources);

  console.log(`Verified ${PUBLIC_WEBSITE_LOCALE_ROUTES.length} static website entrypoints at ${baseUrl}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(stopServer);
