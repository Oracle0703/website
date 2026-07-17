const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const ts = require("typescript");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

async function importFresh(relativePath) {
  const url = pathToFileURL(path.join(root, relativePath));
  return import(`${url.href}?test=${Date.now()}-${Math.random()}`);
}

test("site search builds a bilingual static index across pages, writing, projects, and tools", async () => {
  const sourcePath = path.join(root, "apps/website/lib/site-search.ts");
  const compiled = ts.transpileModule(read("apps/website/lib/site-search.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: sourcePath,
    reportDiagnostics: true
  });
  assert.deepEqual(compiled.diagnostics, []);
  const moduleUnderTest = { exports: {} };
  const stubRequire = (request) => {
    if (request === "./blog") {
      return {
        getPublishedPostsForLocale: (locale) => [
          {
            slug: `article-${locale}`,
            title: locale === "zh" ? "测试文章" : "Test article",
            summary: "Searchable summary",
            content: "# Searchable body",
            category: "engineering",
            tags: ["search"]
          },
          {
            slug: `hidden-${locale}`,
            title: "Noindex article",
            summary: "Must not be discoverable",
            content: "Hidden body",
            seo: { noindex: true }
          }
        ]
      };
    }
    if (request === "./blog-topics") return { getBlogTopicLabel: () => "Engineering" };
    if (request === "./changelog") {
      return {
        getChangelogEntries: (locale) => [{
          id: "low-memory-windows-release",
          kind: "improvement",
          title: locale === "zh" ? "小内存服务器与 Windows 发布流程" : "Low-memory server and Windows release workflow",
          summary: locale === "zh" ? "把构建工作移到 Windows CI。" : "Moved production builds to Windows CI.",
          highlights: locale === "zh" ? ["本地优先套件发布记录"] : ["Windows release artifact verification"]
        }]
      };
    }
    if (request === "./locale-routing") {
      return { getLocalePath: (pathname, locale) => locale === "en" ? (pathname === "/" ? "/en" : `/en${pathname}`) : pathname };
    }
    if (request === "./projects") {
      return {
        getProjectViews: (locale) => [{
          slug: `project-${locale}`,
          title: locale === "zh" ? "测试项目" : "Test project",
          subtitle: "Prototype",
          summary: "Project summary",
          problem: "Problem",
          solution: "Solution",
          highlights: ["Highlight"],
          stack: ["Next.js"],
          status: "prototype",
          type: "web"
        }]
      };
    }
    return require(request);
  };
  new Function("exports", "module", "require", compiled.outputText)(
    moduleUnderTest.exports,
    moduleUnderTest,
    stubRequire
  );
  const { getSiteSearchIndex } = moduleUnderTest.exports;
  const entries = getSiteSearchIndex();

  assert.ok(entries.length >= 30);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  assert.ok(entries.some((entry) => entry.locale === "zh" && entry.href === "/labs/tools"));
  assert.ok(entries.some((entry) => entry.locale === "en" && entry.href === "/en/labs/tools"));
  assert.ok(entries.some((entry) => entry.locale === "zh" && entry.href === "/changelog"));
  assert.ok(entries.some((entry) => entry.locale === "en" && entry.href === "/en/changelog"));
  assert.ok(entries.some((entry) =>
    entry.locale === "zh"
    && entry.href === "/changelog#low-memory-windows-release"
    && entry.text.includes("本地优先套件")
  ));
  assert.ok(entries.some((entry) =>
    entry.locale === "en"
    && entry.href === "/en/changelog#low-memory-windows-release"
    && entry.text.includes("Windows release")
  ));
  assert.ok(entries.some((entry) => entry.kind === "article" && entry.locale === "zh"));
  assert.ok(entries.some((entry) => entry.kind === "project" && entry.locale === "en"));
  assert.ok(!entries.some((entry) => entry.id.includes("hidden-")));
  assert.ok(entries.every((entry) => entry.text.length <= 1_601));
  assert.doesNotMatch(JSON.stringify(entries), /WEATHERAPI_KEY|GISCUS_CATEGORY_ID|submissions\.jsonl/);
});

test("search index is force-static and the command palette loads it only when opened", () => {
  const route = read("apps/website/app/search-index.json/route.ts");
  const client = read("apps/website/components/site-search.tsx");
  const header = read("apps/website/components/site-header.tsx");

  assert.match(route, /dynamic = "force-static"/);
  assert.match(route, /revalidate = false/);
  assert.match(route, /getSiteSearchIndex/);
  assert.match(route, /"X-Robots-Tag": "noindex, nofollow"/);
  assert.doesNotMatch(route, /stale-while-revalidate/);
  assert.doesNotMatch(route, /request|cookies\(|headers\(/);

  assert.match(client, /fetch\("\/search-index\.json"/);
  assert.match(client, /if \(!open\) return/);
  assert.match(client, /aria-keyshortcuts="Control\+K Meta\+K"/);
  assert.match(client, /aria-modal="true"/);
  assert.match(client, /ArrowDown|ArrowUp|Escape/);
  assert.equal((header.match(/<SiteSearch \/>/g) ?? []).length, 1);
  assert.match(client, /triggerRef\.current\?\.focus\(\)/);
  assert.match(client, /scrollIntoView\(\{ block: "nearest" \}\)/);
});

test("Explore exposes bilingual static routes and all five product areas", async () => {
  const routes = await importFresh("apps/website/lib/public-routes.mjs");
  const page = read("apps/website/app/explore/explore-page.tsx");
  const zhRoute = read("apps/website/app/explore/page.tsx");
  const enRoute = read("apps/website/app/en/explore/page.tsx");

  for (const route of ["/explore", "/changelog", "/labs/tools", "/tracker", "/resume", "/now"]) {
    assert.ok(routes.PUBLIC_WEBSITE_ROUTES.includes(route));
  }
  assert.ok(routes.PUBLIC_WEBSITE_EN_ROUTES.includes("/en/explore"));
  assert.match(page, /Local habit tracker/);
  assert.match(page, /Developer toolbox/);
  assert.match(page, /Capability resume/);
  assert.match(page, /href: "\/changelog"/);
  assert.match(page, /AI page analysis/);
  assert.match(zhRoute, /getLanguageAlternates\("\/explore"\)/);
  assert.match(enRoute, /canonical: toAbsoluteUrl\("\/en\/explore"\)/);
});
