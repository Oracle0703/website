import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes.mjs";
import { findAvailablePort } from "./lib/static-verifier-port.mjs";

const root = process.cwd();
const buildIdPath = `${root}/apps/website/.next/BUILD_ID`;
const nextCliPath = `${root}/node_modules/next/dist/bin/next`;
const providedBaseUrl = process.env.NEXT_STATIC_VERIFY_BASE_URL;
const requestedPort = Number(process.env.NEXT_STATIC_VERIFY_PORT ?? 4321);
const hydrationWarningPattern = /Hydration failed|Text content does not match|Minified React error/i;
const scriptSrcPattern = /<script[^>]+src="([^"]+\/_next\/static\/[^"]+\.js[^"]*)"[^>]*>/g;

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
  if (!html.includes("<html lang=")) {
    fail(`${route} is missing an html lang attribute`);
  }

  if (!html.includes("data-theme=")) {
    fail(`${route} is missing a data-theme attribute on html`);
  }

  if (!html.includes("localStorage")) {
    fail(`${route} is missing the preference boot localStorage restore script`);
  }

  if (!html.includes("document.documentElement.lang")) {
    fail(`${route} is missing the preference boot language restore script`);
  }

  if (!html.includes("document.documentElement.dataset.theme")) {
    fail(`${route} is missing the preference boot theme restore script`);
  }

  if (hydrationWarningPattern.test(html)) {
    fail(`${route} contains a hydration warning signature in HTML`);
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

  const scriptSources = [];

  for (const route of PUBLIC_WEBSITE_LOCALE_ROUTES) {
    const html = await fetchText(route.path);
    verifyHtml(route.path, html);
    scriptSources.push(...collectScriptSources(html));
  }

  await verifyScriptBundles(scriptSources);

  console.log(`Verified ${PUBLIC_WEBSITE_LOCALE_ROUTES.length} static website entrypoints at ${baseUrl}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(stopServer);
