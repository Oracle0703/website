const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const publicRoutes = [
  ['/', 'apps/website/app/(zh)/page.tsx'],
  ['/blog', 'apps/website/app/(zh)/blog/page.tsx'],
  ['/projects', 'apps/website/app/(zh)/projects/page.tsx'],
  ['/explore', 'apps/website/app/(zh)/explore/page.tsx'],
  ['/changelog', 'apps/website/app/(zh)/changelog/page.tsx'],
  ['/labs', 'apps/website/app/(zh)/labs/page.tsx'],
  ['/labs/query', 'apps/website/app/(zh)/labs/query/page.tsx'],
  ['/labs/tools', 'apps/website/app/(zh)/labs/tools/page.tsx'],
  ['/tracker', 'apps/website/app/(zh)/tracker/page.tsx'],
  ['/resume', 'apps/website/app/(zh)/resume/page.tsx'],
  ['/now', 'apps/website/app/(zh)/now/page.tsx'],
  ['/about', 'apps/website/app/(zh)/about/page.tsx'],
  ['/contact', 'apps/website/app/(zh)/contact/page.tsx'],
  ['/enter', 'apps/website/app/(zh)/enter/page.tsx'],
  ['/ai-page-analysis', 'apps/website/app/(zh)/ai-page-analysis/page.tsx']
];

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('public website routes are defined once and reused by sitemap', () => {
  const routesSource = read('apps/website/lib/public-routes.mjs');
  const routesFacadeSource = read('apps/website/lib/public-routes.ts');
  const sitemapSource = read('apps/website/app/sitemap.ts');

  assert.match(routesSource, /export const PUBLIC_WEBSITE_ROUTES/);
  assert.match(routesFacadeSource, /public-routes\.mjs/);
  for (const [route] of publicRoutes) {
    assert.match(routesSource, new RegExp(`"${route === '/' ? '\\/' : route}"`));
  }

  assert.match(sitemapSource, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.doesNotMatch(sitemapSource, /const staticPages\s*=/);
});

test('public website pages expose locale-aware canonical metadata', () => {
  for (const [route, relPath] of publicRoutes) {
    const source = read(relPath);

    assert.match(source, /export const generateMetadata/);
    assert.match(source, /getLanguageAlternates/);
    assert.match(source, new RegExp(`getLanguageAlternates\\("${route === '/' ? '\\/' : route}"\\)`));
  }

  const blogDetailSource = read('apps/website/app/(zh)/blog/[slug]/page.tsx');
  assert.match(blogDetailSource, /canonicalPath\s*=\s*`\/blog\/\$\{slug\}`/);
  assert.match(blogDetailSource, /getLanguageAlternates\(canonicalPath,\s*post\.availableLocales\s*\?\?\s*\[defaultLocale\]\)/);
  assert.match(blogDetailSource, /canonical:\s*toAbsoluteUrl\(canonicalPath\)/);

  const englishBlogDetailSource = read('apps/website/app/en/blog/[slug]/page.tsx');
  assert.match(englishBlogDetailSource, /getLanguageAlternates\(canonicalPath,\s*post\.availableLocales\s*\?\?\s*\[locale\]\)/);

  const projectDetailSource = read('apps/website/app/(zh)/projects/[slug]/page.tsx');
  assert.match(projectDetailSource, /canonicalPath\s*=\s*`\/projects\/\$\{encodeURIComponent\(project\.slug\)\}`/);
  assert.match(projectDetailSource, /getLanguageAlternates\(canonicalPath\)/);
  assert.match(projectDetailSource, /canonical:\s*toAbsoluteUrl\(canonicalPath\)/);
});
