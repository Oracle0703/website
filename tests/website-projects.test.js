const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

test('website projects system has the planned files and first project set', () => {
  assert.ok(exists('apps/website/lib/projects.ts'), 'projects data model should exist');
  assert.ok(exists('apps/website/app/projects/page.tsx'), 'projects list route should exist');
  assert.ok(
    exists('apps/website/app/projects/[slug]/page.tsx'),
    'project detail route should exist'
  );

  const projectsSource = read('apps/website/lib/projects.ts');
  for (const slug of [
    'ai-page-analysis',
    'tracker',
    'knock',
    'dashboard-console',
    'timestamp-tool'
  ]) {
    assert.match(projectsSource, new RegExp(`slug:\\s*"${slug}"`));
  }

  assert.match(projectsSource, /export function getAllProjects\(/);
  assert.match(projectsSource, /export function getFeaturedProjects\(/);
  assert.match(projectsSource, /export function getProjectBySlug\(/);
});

test('website projects routes are discoverable from navigation and sitemap', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"作品"\s*\}/);
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"Projects"\s*\}/);

  const sitemapSource = read('apps/website/app/sitemap.ts');
  const publicRoutesSource = read('apps/website/lib/public-routes.mjs');
  assert.match(publicRoutesSource, /"\/projects"/);
  assert.match(sitemapSource, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(sitemapSource, /getAllProjects/);
  assert.match(sitemapSource, /\/projects\/\$\{encodeURIComponent\(project\.slug\)\}/);
});

test('website project links do not point at repository-only docs paths', () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.doesNotMatch(
    projectsSource,
    /href:\s*"\/docs\//,
    'project links should only point to public website routes or external URLs'
  );
});
