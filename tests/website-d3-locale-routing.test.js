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
  const mod = await import(`${url.href}?t=${Date.now()}`);
  // A .ts module in a CommonJS package can surface named exports under
  // `default` when loaded via a transform loader (tsx) on Node 20. Flatten
  // so destructuring matches Node 22 native loading.
  return mod.default && typeof mod.default === "object" ? { ...mod.default, ...mod } : mod;
}

test("D3 locale routing exposes Chinese root paths and English /en paths", async () => {
  const source = read("apps/website/lib/public-routes.mjs");
  const routes = await importFresh("apps/website/lib/public-routes.mjs");

  assert.match(source, /PUBLIC_WEBSITE_ROUTES/);
  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /PUBLIC_WEBSITE_EN_ROUTES/);
  assert.doesNotMatch(source, /"\/zh\//);

  assert.deepEqual(routes.PUBLIC_WEBSITE_EN_ROUTES, [
    "/en",
    "/en/blog",
    "/en/projects",
    "/en/labs",
    "/en/tracker",
    "/en/about",
    "/en/contact",
    "/en/enter",
    "/en/ai-page-analysis"
  ]);

  assert.equal(routes.PUBLIC_WEBSITE_LOCALE_ROUTES.length, 18);
  assert.deepEqual(routes.PUBLIC_WEBSITE_LOCALE_ROUTES[0], {
    locale: "zh",
    path: "/",
    canonicalPath: "/"
  });
  assert.deepEqual(routes.PUBLIC_WEBSITE_LOCALE_ROUTES.at(-1), {
    locale: "en",
    path: "/en/ai-page-analysis",
    canonicalPath: "/en/ai-page-analysis"
  });
});

test("locale routing helpers define path conversion contracts", () => {
  const source = read("apps/website/lib/locale-routing.ts");

  assert.match(source, /getLocalePath/);
  assert.match(source, /getAlternateLocalePath/);
  assert.match(source, /stripLocalePrefix/);
  assert.match(source, /getRouteLocale/);
  assert.match(source, /defaultLocale/);
  assert.match(source, /\/en/);
});

test("locale routing helpers cover root, trailing slash, and prefix edge cases", () => {
  const source = read("apps/website/lib/locale-routing.ts");

  assert.match(source, /pathname\.startsWith\("\/"\)/);
  assert.match(source, /endsWith\("\/"\)/);
  assert.match(source, /normalized === EN_PREFIX/);
  assert.match(source, /normalized\.startsWith\(`\$\{EN_PREFIX\}\/`\)/);
});

test("English public entrypoints exist as static App Router pages", () => {
  const enPages = [
    "apps/website/app/en/page.tsx",
    "apps/website/app/en/blog/page.tsx",
    "apps/website/app/en/projects/page.tsx",
    "apps/website/app/en/labs/page.tsx",
    "apps/website/app/en/tracker/page.tsx",
    "apps/website/app/en/about/page.tsx",
    "apps/website/app/en/contact/page.tsx",
    "apps/website/app/en/enter/page.tsx",
    "apps/website/app/en/ai-page-analysis/page.tsx"
  ];

  for (const relPath of enPages) {
    assert.ok(fs.existsSync(path.join(root, relPath)), `${relPath} should exist`);
    const source = read(relPath);
    assert.match(source, /locale|Locale|en/);
    assert.doesNotMatch(source, /cookies\(/);
    assert.doesNotMatch(source, /getLocale\(/);
  }
});

test("D3 SEO helpers define canonical and hreflang contracts", () => {
  const source = read("apps/website/lib/seo.ts");

  assert.match(source, /getCanonicalPath/);
  assert.match(source, /getLanguageAlternates/);
  assert.match(source, /hreflang/);
  assert.match(source, /x-default/);
  assert.match(source, /toAbsoluteUrl/);
});

test("sitemap includes locale-aware public routes", () => {
  const source = read("apps/website/app/sitemap.ts");

  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /getLocalePath\(`\/blog\/\$\{slug\}`,\s*locale\)/);
  assert.match(source, /getLocalePath\(\s*`\/projects\/\$\{encodeURIComponent\(project\.slug\)\}`,\s*locale\s*\)/);
});

test("language provider switches locale by pushing locale URLs instead of refreshing", () => {
  const source = read("apps/website/components/language-provider.tsx");

  assert.match(source, /getAlternateLocalePath/);
  assert.match(source, /getLocalePath/);
  assert.match(source, /getRouteLocale/);
  assert.match(source, /router\.push/);
  assert.doesNotMatch(source, /router\.refresh\(\)/);
});

test("English detail pages generate static params and localized canonical metadata", () => {
  const blogDetail = read("apps/website/app/en/blog/[slug]/page.tsx");
  const projectDetail = read("apps/website/app/en/projects/[slug]/page.tsx");

  assert.match(blogDetail, /generateStaticParams/);
  assert.match(blogDetail, /getPublishedPosts/);
  assert.match(blogDetail, /\/en\/blog/);
  assert.match(blogDetail, /getJsonLdLanguage\(locale\)/);
  assert.match(projectDetail, /generateStaticParams/);
  assert.match(projectDetail, /getAllProjects/);
  assert.match(projectDetail, /\/en\/projects/);
  assert.match(projectDetail, /getJsonLdLanguage\(locale\)/);
});
