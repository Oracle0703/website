const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function listen(port = 0) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function loadPortVerifier() {
  return import(pathToFileURL(path.join(root, "scripts/lib/static-verifier-port.mjs")).href);
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

test("workspace exposes a website static entrypoint verification command", () => {
  const packageJson = JSON.parse(read("package.json"));

  assert.equal(
    packageJson.scripts["verify:website-static"],
    "node scripts/verify-website-static-entrypoints.mjs"
  );
});

test("static entrypoint verifier covers public D2 routes and preference restore signals", async () => {
  const source = read("scripts/verify-website-static-entrypoints.mjs");
  const portSource = read("scripts/lib/static-verifier-port.mjs");
  const publicRoutes = await importFresh("apps/website/lib/public-routes.mjs");

  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.doesNotMatch(source, /for \(const route of PUBLIC_WEBSITE_ROUTES\)/);
  assert.doesNotMatch(source, /const staticRoutes\s*=/);
  assert.match(source, /findAvailablePort/);
  assert.match(portSource, /EADDRINUSE/);
  assert.match(source, /serverProcess/);
  assert.equal(publicRoutes.PUBLIC_WEBSITE_LOCALE_ROUTES.length, 30);

  assert.match(source, /NEXT_STATIC_VERIFY_BASE_URL/);
  assert.match(source, /localStorage/);
  assert.match(source, /document\.documentElement\.dataset\.theme/);
  assert.match(source, /data-theme/);
  assert.match(source, /const htmlTag = html\.match/);
  assert.match(source, /getTagAttribute\(htmlTag, "lang"\)/);
  assert.match(source, /route\.locale === "en" \? "en" : "zh-CN"/);
  assert.match(source, /Hydration failed|Text content does not match|Minified React error/);
  assert.match(source, /canonical/);
  assert.match(source, /og:url/);
  assert.match(source, /og:image/);
  assert.match(source, /twitter:image/);
  assert.match(source, /robots\.txt/);
  assert.match(source, /sitemap\.xml/);
  assert.match(source, /favicon\.ico/);
  assert.match(source, /og\.png/);
  assert.match(source, /rss\.xml/);
  assert.match(source, /application\\\/rss\\\+xml/);
  assert.match(source, /search-index\.json/);
  assert.match(source, /noindex, nofollow/);
  assert.match(source, /valid bilingual v1 index/);
  assert.match(source, /verifySecurityHeaders/);
  assert.match(source, /strict-transport-security/);
  assert.match(source, /permissions-policy/);
});

test("static entrypoint verifier falls forward from the default port when it is occupied", async () => {
  const occupiedServer = await listen();
  const occupiedPort = occupiedServer.address().port;

  try {
    const { findAvailablePort } = await loadPortVerifier();
    const selectedPort = await findAvailablePort(occupiedPort, { explicitPort: false, maxAttempts: 5 });

    assert.ok(selectedPort > occupiedPort);
    assert.ok(selectedPort < occupiedPort + 5);
  } finally {
    await close(occupiedServer);
  }
});

test("static entrypoint verifier rejects an occupied explicit port", async () => {
  const occupiedServer = await listen();
  const occupiedPort = occupiedServer.address().port;

  try {
    const { findAvailablePort } = await loadPortVerifier();

    await assert.rejects(
      () => findAvailablePort(occupiedPort, { explicitPort: true, maxAttempts: 5 }),
      /Port \d+ is already in use \(EADDRINUSE\)/
    );
  } finally {
    await close(occupiedServer);
  }
});

test("static rendering document records how to run the static entrypoint verifier", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /verify:website-static/);
  assert.match(source, /NEXT_STATIC_VERIFY_BASE_URL/);
  assert.match(source, /首页、博客页、Projects 页、Labs 页、AI 页面分析页/);
});
