import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const OFFLINE_ROUTES = [
  "/tracker",
  "/en/tracker",
  "/labs/tools",
  "/en/labs/tools"
];

export const NETWORK_ONLY_PATHS = [
  "/api/",
  "/contact",
  "/en/contact",
  "/ai-page-analysis",
  "/en/ai-page-analysis",
  "/labs/query",
  "/en/labs/query",
  "/search-index.json",
  "/rss.xml",
  "/en/rss.xml"
];

export const STABLE_OFFLINE_ASSETS = [
  "/manifest.webmanifest",
  "/en/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png"
];

export const RETAINED_PREVIOUS_CACHES = 1;
export const RELEASE_CACHE_PREFIX = "meaningful-ink-offline-v1-";

export function selectReleaseCachesToDelete(
  cacheNames,
  currentCacheName,
  retainedPreviousCaches = RETAINED_PREVIOUS_CACHES
) {
  const previousReleaseCaches = cacheNames.filter(
    (cacheName) =>
      cacheName.startsWith(RELEASE_CACHE_PREFIX) && cacheName !== currentCacheName
  );
  const deleteCount = Math.max(0, previousReleaseCaches.length - retainedPreviousCaches);
  return previousReleaseCaches.slice(0, deleteCount);
}

export function selectReleaseCacheLookupNames(
  cacheNames,
  currentCacheName,
  retainedPreviousCaches = RETAINED_PREVIOUS_CACHES
) {
  return [
    currentCacheName,
    ...cacheNames
      .filter(
        (cacheName) =>
          cacheName.startsWith(RELEASE_CACHE_PREFIX) && cacheName !== currentCacheName
      )
      .slice(-retainedPreviousCaches)
      .reverse()
  ];
}

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_WEBSITE_ROOT = path.resolve(SCRIPT_DIRECTORY, "../apps/website");

export function routeHtmlPath(websiteRoot, route) {
  const relativeRoute = route.replace(/^\//, "");
  return path.join(websiteRoot, ".next", "server", "app", `${relativeRoute}.html`);
}

export function extractStaticAssetPaths(html) {
  const assets = new Set();
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const rawValue = match[1].replaceAll("&amp;", "&");
    let url;
    try {
      url = new URL(rawValue, "https://meaningful.invalid");
    } catch {
      continue;
    }

    if (
      url.origin === "https://meaningful.invalid" &&
      url.pathname.startsWith("/_next/static/")
    ) {
      assets.add(url.pathname);
    }
  }

  return [...assets].sort();
}

export function createPrecacheUrls(staticAssets) {
  return [...new Set([...OFFLINE_ROUTES, ...STABLE_OFFLINE_ASSETS, ...staticAssets])].sort();
}

export function renderServiceWorker({ buildId, staticAssets }) {
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(buildId)) {
    throw new Error(`Invalid Next.js BUILD_ID: ${buildId}`);
  }

  const precacheUrls = createPrecacheUrls(staticAssets);

  return `/* Generated after next build. Do not edit or commit this file. */
"use strict";

const BUILD_ID = ${JSON.stringify(buildId)};
const CACHE_PREFIX = ${JSON.stringify(RELEASE_CACHE_PREFIX)};
const CACHE_NAME = CACHE_PREFIX + BUILD_ID;
const RETAINED_PREVIOUS_CACHES = ${RETAINED_PREVIOUS_CACHES};
const NEXT_STATIC_PREFIX = "/_next/static/";
const OFFLINE_ROUTES = new Set(${JSON.stringify(OFFLINE_ROUTES)});
const STABLE_OFFLINE_ASSETS = new Set(${JSON.stringify(STABLE_OFFLINE_ASSETS)});
const NETWORK_ONLY_PATHS = ${JSON.stringify(NETWORK_ONLY_PATHS)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

function isNetworkOnlyPath(pathname) {
  return NETWORK_ONLY_PATHS.some((blocked) =>
    blocked.endsWith("/") ? pathname.startsWith(blocked) : pathname === blocked || pathname.startsWith(blocked + "/")
  );
}

function isRscRequest(request, url) {
  return (
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.has("Next-Router-State-Tree") ||
    request.headers.has("Next-Router-Prefetch")
  );
}

function selectReleaseCachesToDelete(cacheNames) {
  const previousReleaseCaches = cacheNames.filter(
    (cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
  );
  const deleteCount = Math.max(0, previousReleaseCaches.length - RETAINED_PREVIOUS_CACHES);
  return previousReleaseCaches.slice(0, deleteCount);
}

async function matchReleaseCache(pathname) {
  const cacheNames = await caches.keys();
  // The newly active worker controls existing tabs too. Check the retained previous
  // release so an older tab can still load one of its already-precached chunks.
  const releaseCacheNames = [
    CACHE_NAME,
    ...cacheNames
      .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
      .slice(-RETAINED_PREVIOUS_CACHES)
      .reverse()
  ];

  for (const cacheName of releaseCacheNames) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(pathname, { ignoreVary: true });
    if (response) return response;
  }
  return undefined;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(
        PRECACHE_URLS.map(
          (url) => new Request(url, { cache: "reload", credentials: "same-origin" })
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        // Keep one previous release for tabs that were open when this worker activated.
        selectReleaseCachesToDelete(cacheNames).map((cacheName) => caches.delete(cacheName))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    url.search !== "" ||
    isNetworkOnlyPath(url.pathname) ||
    isRscRequest(request, url)
  ) {
    return;
  }

  const isOfflineDocument = request.mode === "navigate" && OFFLINE_ROUTES.has(url.pathname);
  const isStaticAsset = url.pathname.startsWith(NEXT_STATIC_PREFIX);
  const isStableAsset = STABLE_OFFLINE_ASSETS.has(url.pathname);
  if (!isOfflineDocument && !isStaticAsset && !isStableAsset) return;

  event.respondWith(
    (async () => {
      const cached = await matchReleaseCache(url.pathname);
      return cached || fetch(request);
    })()
  );
});
`;
}

export async function generateServiceWorker({ websiteRoot = DEFAULT_WEBSITE_ROOT } = {}) {
  const buildId = (await readFile(path.join(websiteRoot, ".next", "BUILD_ID"), "utf8")).trim();
  const staticAssets = new Set();

  for (const route of OFFLINE_ROUTES) {
    const htmlPath = routeHtmlPath(websiteRoot, route);
    let html;
    try {
      html = await readFile(htmlPath, "utf8");
    } catch (error) {
      throw new Error(
        `Offline route ${route} is not a prerendered HTML file at ${htmlPath}. Keep all offline routes static.`,
        { cause: error }
      );
    }
    for (const asset of extractStaticAssetPaths(html)) staticAssets.add(asset);
  }

  if (staticAssets.size === 0) {
    throw new Error("No Next.js static assets were found for the offline routes.");
  }

  const source = renderServiceWorker({ buildId, staticAssets: [...staticAssets] });
  const publicDirectory = path.join(websiteRoot, "public");
  const outputPath = path.join(publicDirectory, "sw.js");
  const temporaryPath = path.join(publicDirectory, `.sw-${process.pid}-${Date.now()}.tmp`);
  await mkdir(publicDirectory, { recursive: true });
  await writeFile(temporaryPath, source, "utf8");
  try {
    await rename(temporaryPath, outputPath);
  } catch (error) {
    if (error?.code !== "EEXIST" && error?.code !== "EPERM") throw error;
    await rm(outputPath, { force: true });
    await rename(temporaryPath, outputPath);
  }
  console.log(`Generated ${outputPath} for ${OFFLINE_ROUTES.length} offline routes (${staticAssets.size} static assets).`);
  return { buildId, outputPath, staticAssets: [...staticAssets].sort() };
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  generateServiceWorker().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
