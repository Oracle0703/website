const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('blog frontmatter supports series metadata with validation', () => {
  const blogSource = read('apps/website/lib/blog.ts');

  assert.match(blogSource, /series\?:\s*BlogSeriesFrontmatter/);
  assert.match(blogSource, /id:\s*string/);
  assert.match(blogSource, /title:\s*string/);
  assert.match(blogSource, /order:\s*number/);
  assert.match(blogSource, /invalid series id/);
  assert.match(blogSource, /invalid series title/);
  assert.match(blogSource, /invalid series order/);
});

test('published blog series are aggregated from published posts only', () => {
  const seriesSource = read('apps/website/lib/blog-series.ts');

  assert.match(seriesSource, /export type BlogSeries/);
  assert.match(seriesSource, /export function getPublishedSeries\(/);
  assert.match(seriesSource, /getPublishedPosts\(\)/);
  assert.match(seriesSource, /new Map<string,\s*BlogSeries>/);
  assert.match(seriesSource, /series\.posts\.sort/);
});

test('selected published posts include first batch series metadata', () => {
  const expectations = [
    ['content/blog/2026-01-22-个人网站搭建.mdx', 'website-engineering', 1],
    ['content/blog/2026-02-11-blog-seo-baseline-nextjs.mdx', 'website-engineering', 2],
    ['content/blog/2026-02-11-mdx-components-in-production.mdx', 'website-engineering', 3],
    ['content/blog/2026-02-11-from-awesome-llm-apps-to-product-patterns.mdx', 'ai-productization', 1],
    ['content/blog/2026-02-11-build-your-own-eval-harness.mdx', 'ai-productization', 2],
    ['content/blog/2026-02-11-ci-agent-guardrails.mdx', 'ai-productization', 3],
    ['content/blog/2026-02-11-transformersjs-v4-webgpu-productization.mdx', 'ai-productization', 4],
    ['content/blog/2026-02-03-修行打卡制度.mdx', 'tracker-system', 1],
    ['content/blog/2026-02-11-streak-incentive-design-0-to-1.mdx', 'tracker-system', 2]
  ];

  for (const [relPath, id, order] of expectations) {
    const source = read(relPath);
    assert.match(source, /series:\s*\n/);
    assert.match(source, new RegExp(`id:\\s*"${id}"`));
    assert.match(source, new RegExp(`order:\\s*${order}`));
  }
});

test('blog list and detail pages expose series discovery and article ctas', () => {
  const listSource = read('apps/website/app/blog/page.tsx');
  const listViewSource = read('apps/website/app/blog/blog-list-view.tsx');
  const detailPageSource = read('apps/website/app/blog/[slug]/page.tsx');
  const detailClientSource = read('apps/website/app/blog/[slug]/blog-detail-client.tsx');
  const i18nSource = read('apps/website/lib/i18n.ts');

  assert.match(listSource, /getPublishedSeries/);
  assert.match(listViewSource, /posts\.length/);
  assert.match(listViewSource, /seriesTitle/);

  assert.match(detailPageSource, /getSeriesByPostSlug/);
  assert.match(detailPageSource, /currentSeries/);
  assert.match(detailClientSource, /getLocalePath/);
  assert.match(detailClientSource, /href=\{getHref\("\/projects"\)\}/);
  assert.match(detailClientSource, /href=\{getHref\("\/contact"\)\}/);

  assert.match(i18nSource, /seriesTitle/);
  assert.match(i18nSource, /articleCtaTitle/);
});
