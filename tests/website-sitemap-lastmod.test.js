const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('sitemap lastModified values are stable for static and project routes', () => {
  const sitemapSource = read('apps/website/app/sitemap.ts');
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.doesNotMatch(sitemapSource, /const now\s*=\s*new Date\(\)/);
  assert.doesNotMatch(sitemapSource, /lastModified:\s*now/);
  assert.match(sitemapSource, /lastModified:\s*new Date\(project\.updatedAt\)/);
  assert.match(sitemapSource, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(sitemapSource, /NON_INDEXABLE_ROUTES/);
  assert.match(sitemapSource, /\.filter\(\(route\)\s*=>\s*!NON_INDEXABLE_ROUTES\.has\(route\.canonicalPath\)\)/);
  assert.match(sitemapSource, /getPublishedPosts\(\)\.filter\(\(post\)\s*=>\s*!post\.seo\?\.noindex\)/);
  assert.match(sitemapSource, /getLocalePath\(`\/blog\/\$\{slug\}`,\s*locale\)/);
  assert.match(sitemapSource, /getLocalePath\(\s*`\/projects\/\$\{encodeURIComponent\(project\.slug\)\}`,\s*locale\s*\)/);

  assert.match(projectsSource, /updatedAt:\s*string/);
  for (const slug of [
    'ai-page-analysis',
    'tracker',
    'knock',
    'dashboard-console',
    'timestamp-tool'
  ]) {
    assert.match(
      projectsSource,
      new RegExp(`slug:\\s*"${slug}"[\\s\\S]*?updatedAt:\\s*"\\d{4}-\\d{2}-\\d{2}"`)
    );
  }
});
