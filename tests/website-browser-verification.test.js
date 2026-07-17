const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
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

function listen(port = 0) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}

async function listenFrom(startPort) {
  let lastError;

  for (let candidate = startPort; candidate < startPort + 200; candidate += 1) {
    try {
      return await listen(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
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

function runBrowserVerifier(args, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/verify-website-browser.mjs", ...args], {
      cwd: root,
      env: {
        ...process.env,
        ...env
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

test("workspace exposes a browser-level website verification command", () => {
  const packageJson = JSON.parse(read("package.json"));

  assert.equal(
    packageJson.scripts["verify:website-browser"],
    "node scripts/verify-website-browser.mjs"
  );
  assert.match(JSON.stringify(packageJson.devDependencies ?? {}), /@playwright\/test/);
});

test("playwright website config uses production build and desktop mobile projects", () => {
  const source = read("playwright.website.config.ts");

  assert.match(source, /webServer/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /WEBSITE_BROWSER_VERIFY_PORT/);
  assert.match(source, /verifyPort/);
  assert.match(source, /next start -p \${verifyPort}/);
  assert.match(source, /website-desktop/);
  assert.match(source, /website-mobile/);
  assert.match(source, /screenshots/);
});

test("browser verifier wrapper resolves ports before running Playwright", () => {
  const source = read("scripts/verify-website-browser.mjs");

  assert.match(source, /findAvailablePort/);
  assert.match(source, /WEBSITE_BROWSER_VERIFY_PORT/);
  assert.match(source, /WEBSITE_BROWSER_VERIFY_START_PORT/);
  assert.match(source, /playwright/);
  assert.match(source, /playwright\.website\.config\.ts/);
});

test("browser verifier wrapper falls forward when the default port is occupied", async () => {
  const occupiedServer = await listenFrom(4400);
  const occupiedPort = occupiedServer.address().port;

  try {
    const result = await runBrowserVerifier(["--print-port"], {
      WEBSITE_BROWSER_VERIFY_START_PORT: String(occupiedPort)
    });
    const selectedPort = Number(result.stdout.trim());

    assert.equal(result.code, 0);
    assert.ok(selectedPort > occupiedPort);
    assert.ok(selectedPort < occupiedPort + 20);
  } finally {
    await close(occupiedServer);
  }
});

test("browser verifier wrapper rejects an occupied explicit port", async () => {
  const occupiedServer = await listenFrom(4600);
  const occupiedPort = occupiedServer.address().port;

  try {
    const result = await runBrowserVerifier(["--print-port"], {
      WEBSITE_BROWSER_VERIFY_PORT: String(occupiedPort)
    });

    assert.equal(result.code, 1);
    assert.match(result.stderr, /Port \d+ is already in use \(EADDRINUSE\)/);
  } finally {
    await close(occupiedServer);
  }
});

test("browser verification covers D3 routes, console errors, preferences, and screenshots", async () => {
  const source = read("tests/website-browser-static.spec.ts");
  const publicRoutes = await importFresh("apps/website/lib/public-routes.mjs");

  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.equal(publicRoutes.PUBLIC_WEBSITE_LOCALE_ROUTES.length, 30);
  assert.doesNotMatch(source, /publicRouteNames/);
  assert.match(source, /getRouteName/);

  assert.match(source, /zh-blog-detail/);
  assert.match(source, /zh-project-detail/);
  assert.match(source, /en-blog-detail/);
  assert.match(source, /en-project-detail/);

  assert.match(source, /console/);
  assert.match(source, /pageerror/);
  assert.match(source, /localStorage\.setItem\("locale", "en"\)/);
  assert.match(source, /localStorage\.setItem\("theme", "dark"\)/);
  assert.match(source, /document\.documentElement\.lang/);
  assert.match(source, /toHaveAttribute\("lang", "en"\)/);
  assert.match(source, /toHaveAttribute\("lang", "zh-CN"\)/);
  assert.match(source, /document\.documentElement\.dataset\.theme/);
  assert.match(source, /toHaveScreenshot/);
});

test("static rendering document records the browser verifier", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /verify:website-browser/);
  assert.match(source, /Playwright/);
  assert.match(source, /桌面\/移动/);
  assert.match(source, /公开入口清单/);
  assert.match(source, /console error/);
});
