const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "..");
const dashboardWebRoot = path.join(repoRoot, "apps", "dashboard-web");

function resolveDashboardModule(fromFile, specifier) {
  if (!specifier.startsWith(".")) return specifier;

  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx")
  ];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!resolved) {
    throw new Error(`Unable to resolve ${specifier} from ${fromFile}`);
  }

  return resolved;
}

function loadDashboardWebModule(relativePath, globals = {}) {
  const cache = new Map();
  const entry = path.join(dashboardWebRoot, relativePath);

  function load(filename) {
    const resolved = path.resolve(filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;

    const source = fs.readFileSync(resolved, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        target: ts.ScriptTarget.ES2020
      },
      fileName: resolved
    }).outputText;

    const module = { exports: {} };
    cache.set(resolved, module);

    const sandbox = {
      Headers,
      Response,
      URL,
      URLSearchParams,
      console,
      exports: module.exports,
      fetch,
      module,
      process,
      require(specifier) {
        const next = resolveDashboardModule(resolved, specifier);
        return path.isAbsolute(next) ? load(next) : require(next);
      },
      window: undefined,
      ...globals
    };

    vm.runInNewContext(output, sandbox, { filename: resolved });
    return module.exports;
  }

  return load(entry);
}

test("dashboard-web shell components render a usable dashboard frame", () => {
  const { DashboardShell, GlassCard } = loadDashboardWebModule("exm.tsx");

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      DashboardShell,
      {
        activeTab: "dashboard",
        title: "Smoke Overview",
        subtitle: "Dashboard smoke render",
        onLogout: () => {},
        meta: React.createElement("span", null, "Smoke Meta")
      },
      React.createElement(
        GlassCard,
        { title: "Smoke Card" },
        React.createElement("div", null, "Smoke Child")
      )
    )
  );

  assert.match(html, /Dashboard Console/);
  assert.match(html, /Meaningful Ink/);
  assert.match(html, /Tasks/);
  assert.match(html, /Logs/);
  assert.match(html, /Status/);
  assert.match(html, /Smoke Overview/);
  assert.match(html, /Smoke Card/);
  assert.match(html, /Smoke Child/);
});

test("dashboard-web API client reads state and events through mocked fetch", async () => {
  const previousApiBase = process.env.NEXT_PUBLIC_DASHBOARD_API_BASE;
  process.env.NEXT_PUBLIC_DASHBOARD_API_BASE = "https://dashboard.example.test/api/dashboard";

  const calls = [];
  const localStorage = new Map([["dashboard_admin_token", "admin-token"]]);

  const api = loadDashboardWebModule("lib/api.ts", {
    fetch: async (url, init = {}) => {
      calls.push({ url: String(url), init });

      const body = String(url).includes("/events?")
        ? {
            events: [
              {
                id: "evt-1",
                ts: "2026-02-24T06:20:00.000Z",
                type: "task.started",
                category: "ops",
                title: "Smoke event",
                summary: "API client can consume events"
              }
            ]
          }
        : {
            updatedAt: "2026-02-24T06:20:00.000Z",
            now: {
              title: "Smoke state",
              summary: "API client can consume state",
              category: "ops",
              since: "2026-02-24T06:20:00.000Z"
            },
            next: [],
            recent: { done: [], failed: [] }
          };

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    },
    window: {
      localStorage: {
        getItem(key) {
          return localStorage.get(key) ?? null;
        },
        removeItem(key) {
          localStorage.delete(key);
        },
        setItem(key, value) {
          localStorage.set(key, value);
        }
      }
    }
  });

  try {
    const state = await api.getState();
    const events = await api.getEvents({ days: 3, limit: 5 });

    assert.equal(state.now.title, "Smoke state");
    assert.equal(events.events[0].title, "Smoke event");
    assert.equal(calls[0].url, "https://dashboard.example.test/api/dashboard/state");
    assert.equal(calls[1].url, "https://dashboard.example.test/api/dashboard/events?days=3&limit=5");
    assert.equal(calls[0].init.headers.get("authorization"), "Bearer admin-token");
    assert.equal(calls[1].init.cache, "no-store");
  } finally {
    if (previousApiBase === undefined) {
      delete process.env.NEXT_PUBLIC_DASHBOARD_API_BASE;
    } else {
      process.env.NEXT_PUBLIC_DASHBOARD_API_BASE = previousApiBase;
    }
  }
});
