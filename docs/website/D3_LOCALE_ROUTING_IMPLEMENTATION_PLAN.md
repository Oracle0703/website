# Website D3 Locale Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement asymmetric locale routing where Chinese keeps the existing root paths and English gains `/en/*` static URLs with correct SEO, sitemap, language switching, and verification coverage.

**Architecture:** Keep D2's static rendering model and add a locale-aware route layer instead of middleware-based redirects. `PUBLIC_WEBSITE_ROUTES` remains the Chinese public route source, while new helpers derive `/en/*` paths, alternate links, sitemap entries, and verifier route lists. Route locale must come from the URL, not from `localStorage` or `LOCALE_COOKIE`.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Node.js 22, npm workspaces, Playwright, current Node test suite.

---

## 0. 文件结构

| 文件 | 类型 | 责任 |
|---|---|---|
| `apps/website/lib/locale-routing.ts` | 新增 | Locale path helpers, route matrix, alternate path helpers |
| `apps/website/lib/public-routes.mjs` | 修改 | 保留中文公开入口，新增 JS 可用的 locale route matrix |
| `apps/website/lib/public-routes.ts` | 修改 | 导出 typed locale route matrix |
| `apps/website/lib/seo.ts` | 新增 | Canonical / language alternates / JSON-LD language helpers |
| `apps/website/app/en/**/page.tsx` | 新增 | 英文公开入口 facade pages |
| `apps/website/app/en/blog/[slug]/page.tsx` | 新增 | 英文 Blog 详情页 |
| `apps/website/app/en/projects/[slug]/page.tsx` | 新增 | 英文 Project 详情页 |
| `apps/website/app/sitemap.ts` | 修改 | 输出中文和英文 canonical URL |
| `apps/website/components/language-provider.tsx` | 修改 | 语言切换从 `router.refresh` 改为 `router.push(targetLocalePath)` |
| `scripts/verify-website-static-entrypoints.mjs` | 修改 | 验证 locale-aware public route matrix |
| `tests/website-d3-locale-routing.test.js` | 新增 | 路由矩阵、helper、SEO、sitemap、语言切换源码护栏 |
| `tests/website-browser-static.spec.ts` | 修改 | 浏览器验收覆盖英文关键入口和语言切换 URL |
| `tests/website-browser-verification.test.js` | 修改 | Playwright 结构测试覆盖 D3 route list |
| `tests/website-static-entrypoints-verification.test.js` | 修改 | 静态入口脚本测试覆盖中英文公开入口 |
| `docs/website/D3_LOCALE_ROUTING_DESIGN.md` | 已有 | D3 设计基线 |
| `docs/website/D2_ACCEPTANCE_REPORT.md` | 修改 | D3 执行状态引用 |
| `docs/website/RELEASE_CHECKLIST.md` | 修改 | D3 后发布前必跑项 |

## 1. 全局约束

| 约束 | 决策 |
|---|---|
| 中文 URL | 保持 `/`、`/blog`、`/projects` 等现有路径 |
| 英文 URL | 新增 `/en`、`/en/blog`、`/en/projects` 等路径 |
| `/zh/*` | 不生成页面；后续可用 redirect 规范化到中文根路径 |
| 自动跳转 | 不基于 cookie、localStorage、Accept-Language 或 IP 自动跳转 |
| route locale | 服务端和 metadata 以 URL locale 为准 |
| 用户偏好 | `localStorage` 和 `LOCALE_COOKIE` 继续保存用户选择，但不覆盖 route locale |
| 详情页 slug | Blog / Project slug 中英文保持一致 |

## Task 1: Locale 路由工具

**Files:**
- Create: `tests/website-d3-locale-routing.test.js`
- Create: `apps/website/lib/locale-routing.ts`
- Modify: `apps/website/lib/public-routes.mjs`
- Modify: `apps/website/lib/public-routes.ts`
- Test: `node --test tests\website-d3-locale-routing.test.js`

- [x] **Step 1: Write the failing route matrix test**

Create `tests/website-d3-locale-routing.test.js` with:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("D3 locale routing exposes Chinese root paths and English /en paths", () => {
  const source = read("apps/website/lib/public-routes.mjs");

  assert.match(source, /PUBLIC_WEBSITE_ROUTES/);
  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /PUBLIC_WEBSITE_EN_ROUTES/);
  assert.match(source, /locale: "zh"/);
  assert.match(source, /locale: "en"/);
  assert.match(source, /"\/en\/blog"/);
  assert.doesNotMatch(source, /"\/zh\//);
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
```

- [x] **Step 2: Run RED**

Run:

```powershell
$env:Path='F:\an\nvm\v22.22.0;' + $env:Path
node --test tests\website-d3-locale-routing.test.js
```

Expected: fails because `apps/website/lib/locale-routing.ts` does not exist and `PUBLIC_WEBSITE_LOCALE_ROUTES` is not exported.

- [x] **Step 3: Add route matrix to `public-routes.mjs`**

Update `apps/website/lib/public-routes.mjs` to keep existing routes and add derived locale routes:

```js
export const PUBLIC_WEBSITE_ROUTES = [
  "/",
  "/blog",
  "/projects",
  "/labs",
  "/tracker",
  "/about",
  "/contact",
  "/enter",
  "/ai-page-analysis"
];

export const PUBLIC_WEBSITE_EN_ROUTES = PUBLIC_WEBSITE_ROUTES.map((path) =>
  path === "/" ? "/en" : `/en${path}`
);

export const PUBLIC_WEBSITE_LOCALE_ROUTES = [
  ...PUBLIC_WEBSITE_ROUTES.map((path) => ({
    locale: "zh",
    path,
    canonicalPath: path
  })),
  ...PUBLIC_WEBSITE_EN_ROUTES.map((path) => ({
    locale: "en",
    path,
    canonicalPath: path
  }))
];
```

- [x] **Step 4: Add typed locale helpers**

Create `apps/website/lib/locale-routing.ts`:

```ts
import { defaultLocale, isLocale, type Locale } from "./i18n";

const EN_PREFIX = "/en";

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

export function stripLocalePrefix(pathname: string) {
  const normalized = normalizePath(pathname);
  if (normalized === EN_PREFIX) return "/";
  if (normalized.startsWith(`${EN_PREFIX}/`)) return normalized.slice(EN_PREFIX.length);
  return normalized;
}

export function getRouteLocale(pathname: string): Locale {
  const normalized = normalizePath(pathname);
  return normalized === EN_PREFIX || normalized.startsWith(`${EN_PREFIX}/`) ? "en" : defaultLocale;
}

export function getLocalePath(pathname: string, locale: Locale) {
  const basePath = stripLocalePrefix(pathname);
  if (!isLocale(locale)) return basePath;
  if (locale === defaultLocale) return basePath;
  return basePath === "/" ? EN_PREFIX : `${EN_PREFIX}${basePath}`;
}

export function getAlternateLocalePath(pathname: string) {
  const locale = getRouteLocale(pathname);
  return getLocalePath(pathname, locale === "en" ? defaultLocale : "en");
}
```

- [x] **Step 5: Export typed route matrix**

Update `apps/website/lib/public-routes.ts`:

```ts
import {
  PUBLIC_WEBSITE_EN_ROUTES as publicWebsiteEnRoutes,
  PUBLIC_WEBSITE_LOCALE_ROUTES as publicWebsiteLocaleRoutes,
  PUBLIC_WEBSITE_ROUTES as publicWebsiteRoutes
} from "./public-routes.mjs";
import type { Locale } from "./i18n";

export const PUBLIC_WEBSITE_ROUTES = publicWebsiteRoutes as readonly string[];
export const PUBLIC_WEBSITE_EN_ROUTES = publicWebsiteEnRoutes as readonly string[];

export type PublicWebsiteLocaleRoute = {
  locale: Locale;
  path: string;
  canonicalPath: string;
};

export const PUBLIC_WEBSITE_LOCALE_ROUTES =
  publicWebsiteLocaleRoutes as readonly PublicWebsiteLocaleRoute[];
```

- [x] **Step 6: Run GREEN**

Run:

```powershell
node --test tests\website-d3-locale-routing.test.js
npm test
```

Expected: new D3 route helper tests pass, existing route tests remain green.

## Task 2: 英文静态入口

**Files:**
- Modify: `tests/website-d3-locale-routing.test.js`
- Create: `apps/website/app/en/page.tsx`
- Create: `apps/website/app/en/blog/page.tsx`
- Create: `apps/website/app/en/projects/page.tsx`
- Create: `apps/website/app/en/labs/page.tsx`
- Create: `apps/website/app/en/tracker/page.tsx`
- Create: `apps/website/app/en/about/page.tsx`
- Create: `apps/website/app/en/contact/page.tsx`
- Create: `apps/website/app/en/enter/page.tsx`
- Create: `apps/website/app/en/ai-page-analysis/page.tsx`
- Test: `npm run build:website`

- [x] **Step 1: Add failing source tests for English entrypoints**

Append to `tests/website-d3-locale-routing.test.js`:

```js
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
```

- [x] **Step 2: Run RED**

Run:

```powershell
node --test tests\website-d3-locale-routing.test.js
```

Expected: fails because `/en/*` App Router pages do not exist.

- [x] **Step 3: Extract locale-aware page renderers where needed**

Before adding `/en/*` pages, inspect each existing page and extract a small server render function only when duplication would otherwise be large.

For simple client-only pages, use a facade pattern:

```tsx
import type { Metadata } from "next";
import { getMessages, type Locale } from "../../../lib/i18n";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { AboutClient } from "../../about/about-client";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);
  return {
    title: seo.aboutTitle,
    description: seo.aboutDescription,
    alternates: {
      canonical: toAbsoluteUrl("/en/about")
    }
  };
};

export default function Page() {
  return <AboutClient />;
}
```

Use the same pattern for `contact`, `labs`, `tracker`, `enter`, and `ai-page-analysis`, adjusting imports and metadata fields.

- [x] **Step 4: Add English home, blog, and projects pages**

For data pages, mirror current server data loading but use `locale: "en"` for metadata and fallback render props.

For `apps/website/app/en/blog/page.tsx`, use this shape:

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedPosts } from "../../../lib/blog";
import { getPublishedSeries } from "../../../lib/blog-series";
import { getMessages, type Locale } from "../../../lib/i18n";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { BlogClient } from "../../blog/blog-client";
import { BlogListView } from "../../blog/blog-list-view";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);
  return {
    title: seo.blogTitle,
    description: seo.blogDescription,
    alternates: {
      canonical: toAbsoluteUrl("/en/blog")
    }
  };
};

export default function Page() {
  const posts = getPublishedPosts().map((post) => ({
    title: post.title,
    slug: post.slug,
    date: post.date,
    updatedAt: post.updatedAt,
    summary: post.summary,
    cover: typeof post.cover === "string" ? { src: post.cover, alt: post.title } : post.cover,
    tags: post.tags,
    readingTime: post.readingTime
  }));
  const series = getPublishedSeries().map((item) => ({
    id: item.id,
    title: item.title,
    posts: item.posts.map((post) => ({ title: post.title, slug: post.slug }))
  }));
  const { pages } = getMessages(locale);

  return (
    <Suspense fallback={<BlogListView posts={posts} series={series} locale={locale} copy={pages.blog} common={pages.common} />}>
      <BlogClient posts={posts} series={series} initialLocale={locale} />
    </Suspense>
  );
}
```

If `BlogClient` does not yet support `initialLocale`, add that prop in Task 4 when language switching is updated. For Task 2, it is acceptable for the English page to render through provider restoration after Task 4, but metadata must already be English.

- [x] **Step 5: Run build**

Run:

```powershell
npm run build:website
```

Expected: `/en`, `/en/blog`, `/en/projects`, `/en/labs`, `/en/tracker`, `/en/about`, `/en/contact`, `/en/enter`, and `/en/ai-page-analysis` appear in route output and do not show dynamic `ƒ` due to cookie reads.

## Task 3: SEO 与 sitemap

**Files:**
- Create: `apps/website/lib/seo.ts`
- Modify: `apps/website/app/sitemap.ts`
- Modify: public and English page metadata files from Task 2
- Modify: `tests/website-canonical-coverage.test.js`
- Modify: `tests/website-sitemap-lastmod.test.js`
- Test: `npm test`

- [x] **Step 1: Add failing SEO helper tests**

Append to `tests/website-d3-locale-routing.test.js`:

```js
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
  assert.match(source, /\/en\/blog/);
  assert.match(source, /\/en\/projects/);
});
```

- [x] **Step 2: Run RED**

Run:

```powershell
node --test tests\website-d3-locale-routing.test.js
```

Expected: fails because `apps/website/lib/seo.ts` does not exist and sitemap still uses only `PUBLIC_WEBSITE_ROUTES`.

- [x] **Step 3: Add SEO helpers**

Create `apps/website/lib/seo.ts`:

```ts
import type { Locale } from "./i18n";
import { getLocalePath, stripLocalePrefix } from "./locale-routing";
import { toAbsoluteUrl } from "./site-url";

export function getCanonicalPath(pathname: string, locale: Locale) {
  return getLocalePath(stripLocalePrefix(pathname), locale);
}

export function getLanguageAlternates(pathname: string) {
  const basePath = stripLocalePrefix(pathname);
  return {
    canonical: toAbsoluteUrl(basePath),
    languages: {
      "zh-CN": toAbsoluteUrl(getLocalePath(basePath, "zh")),
      en: toAbsoluteUrl(getLocalePath(basePath, "en")),
      "x-default": toAbsoluteUrl(getLocalePath(basePath, "zh"))
    }
  };
}

export function getJsonLdLanguage(locale: Locale) {
  return locale === "en" ? "en" : "zh-CN";
}

export const hreflang = {
  zh: "zh-CN",
  en: "en"
} as const;
```

- [x] **Step 4: Update sitemap**

Modify `apps/website/app/sitemap.ts` to import `PUBLIC_WEBSITE_LOCALE_ROUTES` and add English detail routes:

```ts
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../lib/public-routes";
import { getLocalePath } from "../lib/locale-routing";
```

Use:

```ts
const entries: MetadataRoute.Sitemap = PUBLIC_WEBSITE_LOCALE_ROUTES.map((route) => ({
  url: `${baseUrl}${route.canonicalPath === "/" ? "" : route.canonicalPath}`
}));
```

For posts and projects, push both locales:

```ts
for (const locale of ["zh", "en"] as const) {
  entries.push({
    url: `${baseUrl}${getLocalePath(`/blog/${slug}`, locale)}`,
    lastModified
  });
}
```

Apply the same pattern to project details.

- [x] **Step 5: Update metadata alternates**

For every public page and `/en/*` page, use `getLanguageAlternates(pathname)` for `alternates`.

Example for `/blog`:

```ts
alternates: getLanguageAlternates("/blog")
```

Example for `/en/blog`:

```ts
alternates: {
  ...getLanguageAlternates("/en/blog"),
  canonical: toAbsoluteUrl("/en/blog")
}
```

- [x] **Step 6: Run SEO tests**

Run:

```powershell
npm test
npm run build:website
```

Expected: canonical and sitemap tests pass, build succeeds.

## Task 4: 语言切换

**Files:**
- Modify: `apps/website/components/language-provider.tsx`
- Modify: `apps/website/components/layout-shell.tsx`
- Modify: client page components if they need `initialLocale`
- Modify: `tests/website-d2-preference-spike.test.js`
- Modify: `tests/website-browser-static.spec.ts`
- Test: `npm test`, `npm run verify:website-browser`

- [x] **Step 1: Add failing language switch source test**

Append to `tests/website-d3-locale-routing.test.js`:

```js
test("language provider switches locale by pushing locale URLs instead of refreshing", () => {
  const source = read("apps/website/components/language-provider.tsx");

  assert.match(source, /getAlternateLocalePath/);
  assert.match(source, /router\.push/);
  assert.doesNotMatch(source, /router\.refresh\(\)/);
});
```

- [x] **Step 2: Run RED**

Run:

```powershell
node --test tests\website-d3-locale-routing.test.js
```

Expected: fails because `LanguageProvider` still uses `router.refresh()`.

- [x] **Step 3: Update provider path switching**

Modify `apps/website/components/language-provider.tsx`:

```tsx
import { usePathname, useRouter } from "next/navigation";
import { getAlternateLocalePath } from "../lib/locale-routing";
```

Inside `LanguageProvider`:

```tsx
const router = useRouter();
const pathname = usePathname();
```

Replace `updateLocale` with:

```tsx
const updateLocale = useCallback((nextLocale: Locale) => {
  persistLocale(nextLocale);
  setLocale(nextLocale);

  const targetPath = getAlternateLocalePath(pathname ?? "/");
  router.push(targetPath);
}, [pathname, router]);
```

If direct setLocale is used by non-toggle controls, add a helper that calls `getLocalePath(pathname ?? "/", nextLocale)` instead of always toggling.

- [x] **Step 4: Make route locale initial state explicit**

Update `LayoutShell` props if necessary so `/en/*` pages can start with `initialLocale="en"`.

If root `app/layout.tsx` cannot know nested route locale without dynamic request reads, prefer keeping root default `zh` and have `/en/*` page client components pass `initialLocale` into page-specific client components. Do not reintroduce `cookies()` or `headers()` in layout.

- [x] **Step 5: Add browser language switch coverage**

Update `tests/website-browser-static.spec.ts` with a focused test:

```ts
test("language toggle moves between Chinese and English canonical URLs", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("button", { name: /切换到英文|Switch to English/ }).click();
  await expect(page).toHaveURL(/\/en\/blog$/);

  await page.getByRole("button", { name: /切换到中文|Switch to Chinese/ }).click();
  await expect(page).toHaveURL(/\/blog$/);
});
```

Adjust accessible names to match the current language switch button in `LayoutShell`.

- [x] **Step 6: Run tests**

Run:

```powershell
npm test
npm run verify:website-browser
```

Expected: source tests pass and browser URL switching works without console errors.

## Task 5: 详情页 locale 路由

**Files:**
- Modify: `tests/website-detail-static-pages.test.js`
- Create: `apps/website/app/en/blog/[slug]/page.tsx`
- Create: `apps/website/app/en/projects/[slug]/page.tsx`
- Modify: `apps/website/app/blog/[slug]/page.tsx`
- Modify: `apps/website/app/projects/[slug]/page.tsx`
- Test: `npm test`, `npm run build:website`

- [x] **Step 1: Add failing detail route tests**

Append to `tests/website-d3-locale-routing.test.js`:

```js
test("English detail pages generate static params and localized canonical metadata", () => {
  const blogDetail = read("apps/website/app/en/blog/[slug]/page.tsx");
  const projectDetail = read("apps/website/app/en/projects/[slug]/page.tsx");

  assert.match(blogDetail, /generateStaticParams/);
  assert.match(blogDetail, /getPublishedPosts/);
  assert.match(blogDetail, /\/en\/blog/);
  assert.match(projectDetail, /generateStaticParams/);
  assert.match(projectDetail, /getAllProjects/);
  assert.match(projectDetail, /\/en\/projects/);
});
```

When reading these files manually in PowerShell, use:

```powershell
Get-Content -LiteralPath 'apps\website\app\en\blog\[slug]\page.tsx'
```

- [x] **Step 2: Run RED**

Run:

```powershell
node --test tests\website-d3-locale-routing.test.js
```

Expected: fails because English detail pages do not exist.

- [x] **Step 3: Add English Blog detail page**

Create `apps/website/app/en/blog/[slug]/page.tsx` by reusing the Chinese detail page structure with:

```ts
const locale: Locale = "en";
```

Metadata canonical must be:

```ts
canonical: toAbsoluteUrl(`/en/blog/${encodeURIComponent(post.slug)}`)
```

`generateStaticParams` must remain:

```ts
export const generateStaticParams = () => {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
};
```

- [x] **Step 4: Add English Project detail page**

Create `apps/website/app/en/projects/[slug]/page.tsx` by reusing the Chinese project detail structure with:

```ts
const locale: Locale = "en";
```

Metadata canonical must be:

```ts
canonical: toAbsoluteUrl(`/en/projects/${encodeURIComponent(project.slug)}`)
```

`generateStaticParams` must remain:

```ts
export const generateStaticParams = () => {
  return getAllProjects().map((project) => ({ slug: project.slug }));
};
```

- [x] **Step 5: Keep JSON-LD language aligned**

Use `getJsonLdLanguage(locale)` in both English detail pages.

Expected values:

| Locale | JSON-LD `inLanguage` |
|---|---|
| `zh` | `zh-CN` |
| `en` | `en` |

- [x] **Step 6: Run build**

Run:

```powershell
npm test
npm run build:website
```

Expected: English Blog and Project detail routes appear as static generated routes.

## Task 6: 验收脚本扩展

**Files:**
- Modify: `scripts/verify-website-static-entrypoints.mjs`
- Modify: `tests/website-static-entrypoints-verification.test.js`
- Modify: `tests/website-browser-static.spec.ts`
- Modify: `tests/website-browser-verification.test.js`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Modify: `docs/website/D2_ACCEPTANCE_REPORT.md`
- Test: `npm run verify:website-static`, `npm run verify:website-browser`

- [x] **Step 1: Add failing static verifier route matrix test**

Modify `tests/website-static-entrypoints-verification.test.js` so the route source assertion expects `PUBLIC_WEBSITE_LOCALE_ROUTES`:

```js
assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
assert.doesNotMatch(source, /for \(const route of PUBLIC_WEBSITE_ROUTES\)/);
```

- [x] **Step 2: Run RED**

Run:

```powershell
node --test tests\website-static-entrypoints-verification.test.js
```

Expected: fails because static verifier still loops only over `PUBLIC_WEBSITE_ROUTES`.

- [x] **Step 3: Update static verifier**

Modify `scripts/verify-website-static-entrypoints.mjs`:

```js
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes.mjs";
```

Loop over locale route paths:

```js
for (const route of PUBLIC_WEBSITE_LOCALE_ROUTES) {
  const html = await fetchText(route.path);
  verifyHtml(route.path, html);
  scriptSources.push(...collectScriptSources(html));
}
```

Update final log:

```js
console.log(`Verified ${PUBLIC_WEBSITE_LOCALE_ROUTES.length} static website entrypoints at ${baseUrl}`);
```

- [x] **Step 4: Update browser verifier route list**

Modify `tests/website-browser-static.spec.ts`:

```ts
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../apps/website/lib/public-routes";
```

Build route list:

```ts
const routes = [
  ...PUBLIC_WEBSITE_LOCALE_ROUTES.map((route) => ({
    path: route.path,
    name: `${route.locale}-${getRouteName(route.path)}`
  })),
  ...detailRoutes
];
```

Add English details:

```ts
const detailRoutes = [
  { path: "/blog/ci-agent-guardrails", name: "zh-blog-detail" },
  { path: "/projects/ai-page-analysis", name: "zh-project-detail" },
  { path: "/en/blog/ci-agent-guardrails", name: "en-blog-detail" },
  { path: "/en/projects/ai-page-analysis", name: "en-project-detail" }
];
```

- [x] **Step 5: Update docs**

Update `docs/website/RELEASE_CHECKLIST.md` and `docs/website/D2_ACCEPTANCE_REPORT.md` to state that D3 verification covers both Chinese root paths and English `/en/*` paths.

- [x] **Step 6: Run full verification**

Run:

```powershell
npm test
npm run validate:website-content
npm run build:website
npm run verify:website-static
npm run verify:website-browser
git diff --check
```

Expected:

| Command | Expected |
|---|---|
| `npm test` | All Node tests pass |
| `npm run validate:website-content` | Published content remains valid |
| `npm run build:website` | Chinese and English public routes build successfully |
| `npm run verify:website-static` | All locale-aware entrypoints pass HTML/script checks |
| `npm run verify:website-browser` | Desktop/mobile browser checks pass without console errors |
| `git diff --check` | No whitespace errors |

## 2. 自查清单

| 检查项 | 要求 |
|---|---|
| Spec coverage | Tasks 1-6 cover route matrix, `/en/*` entrypoints, SEO, sitemap, language switching, detail pages, verifiers |
| Placeholder scan | Plan contains no placeholder markers |
| Type consistency | Use `Locale`, `PublicWebsiteLocaleRoute`, `getLocalePath`, `getAlternateLocalePath`, and `PUBLIC_WEBSITE_LOCALE_ROUTES` consistently |
| Scope | This plan implements URL and SEO routing only; tag / series SEO pages remain outside this phase |
| TDD | Every behavior change starts with a failing Node or Playwright test |
