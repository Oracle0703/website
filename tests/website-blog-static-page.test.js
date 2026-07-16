const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('blog list page avoids page-level request reads', () => {
  const pageSource = read('apps/website/app/blog/page.tsx');
  const clientSource = read('apps/website/app/blog/blog-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.doesNotMatch(pageSource, /searchParams/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /getPublishedPosts\(\)/);
  assert.match(pageSource, /getPublishedSeries\(\)/);
  assert.match(pageSource, /<Suspense/);
  assert.match(pageSource, /fallback=\{\s*<BlogListView/);
  assert.doesNotMatch(pageSource, /fallback=\{null\}/);
  assert.match(pageSource, /<BlogClient/);
  assert.match(pageSource, /copy=\{pages\.blog\}/);
  assert.match(pageSource, /common=\{pages\.common\}/);

  assert.match(clientSource, /"use client"/);
  assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
  assert.match(clientSource, /useSearchParams/);
  assert.match(clientSource, /copy: Messages\["pages"\]\["blog"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
});

test('blog client receives list-shaped data instead of full mdx posts', () => {
  const pageSource = read('apps/website/app/blog/page.tsx');
  const clientSource = read('apps/website/app/blog/blog-client.tsx');
  const listViewSource = read('apps/website/app/blog/blog-list-view.tsx');

  assert.match(listViewSource, /export type BlogListPost/);
  assert.match(listViewSource, /export type BlogListSeries/);
  assert.match(clientSource, /posts:\s*BlogListPost\[\]/);
  assert.match(clientSource, /series:\s*BlogListSeries\[\]/);
  assert.match(pageSource, /mapPostForList/);
  assert.match(pageSource, /mapSeriesForList/);
  assert.doesNotMatch(listViewSource, /content:\s*string/);
  assert.doesNotMatch(listViewSource, /filePath:\s*string/);
});

test('static rendering document records blog as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/blog/);
  assert.match(source, /BlogClient/);
  assert.match(source, /useSearchParams/);
});
