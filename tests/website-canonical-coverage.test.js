const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const publicRoutes = [
  ['/', 'apps/website/app/page.tsx'],
  ['/blog', 'apps/website/app/blog/page.tsx'],
  ['/projects', 'apps/website/app/projects/page.tsx'],
  ['/explore', 'apps/website/app/explore/page.tsx'],
  ['/labs', 'apps/website/app/labs/page.tsx'],
  ['/labs/query', 'apps/website/app/labs/query/page.tsx'],
  ['/labs/tools', 'apps/website/app/labs/tools/page.tsx'],
  ['/tracker', 'apps/website/app/tracker/page.tsx'],
  ['/resume', 'apps/website/app/resume/page.tsx'],
  ['/now', 'apps/website/app/now/page.tsx'],
  ['/about', 'apps/website/app/about/page.tsx'],
  ['/contact', 'apps/website/app/contact/page.tsx'],
  ['/enter', 'apps/website/app/enter/page.tsx'],
  ['/ai-page-analysis', 'apps/website/app/ai-page-analysis/page.tsx']
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

  const blogDetailSource = read('apps/website/app/blog/[slug]/page.tsx');
  assert.match(blogDetailSource, /canonicalPath\s*=\s*`\/blog\/\$\{slug\}`/);
  assert.match(blogDetailSource, /getLanguageAlternates\(canonicalPath,\s*post\.availableLocales\s*\?\?\s*\[defaultLocale\]\)/);
  assert.match(blogDetailSource, /canonical:\s*toAbsoluteUrl\(canonicalPath\)/);

  const englishBlogDetailSource = read('apps/website/app/en/blog/[slug]/page.tsx');
  assert.match(englishBlogDetailSource, /getLanguageAlternates\(canonicalPath,\s*post\.availableLocales\s*\?\?\s*\[locale\]\)/);

  const projectDetailSource = read('apps/website/app/projects/[slug]/page.tsx');
  assert.match(projectDetailSource, /canonicalPath\s*=\s*`\/projects\/\$\{encodeURIComponent\(project\.slug\)\}`/);
  assert.match(projectDetailSource, /getLanguageAlternates\(canonicalPath\)/);
  assert.match(projectDetailSource, /canonical:\s*toAbsoluteUrl\(canonicalPath\)/);
});
