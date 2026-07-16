const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("blog list is an article-first reading flow with lightweight discovery", () => {
  const source = read("apps/website/app/blog/blog-list-view.tsx");
  const articlesPosition = source.indexOf("latestPosts.map");
  const seriesPosition = source.indexOf("series.map");

  assert.ok(articlesPosition >= 0, "latest articles should render as a reading flow");
  assert.ok(seriesPosition > articlesPosition, "series should follow the articles");
  assert.match(source, /const \[featuredPost, \.\.\.latestPosts\] = filteredPosts/);
  assert.match(source, /<nav aria-label=\{copy\.topicFilterLabel\}/);
  assert.match(source, /BLOG_TOPICS\.map/);
  assert.doesNotMatch(source, /panel-surface|card-interactive/);
});

test("blog list avoids repeated social covers and eager dense-link prefetching", () => {
  const source = read("apps/website/app/blog/blog-list-view.tsx");

  assert.match(source, /sourcePath !== "\/og\.png"/);
  assert.match(source, /hasDistinctCover\(featuredPost\.cover\)/);
  assert.match(source, /latestPosts\.map[\s\S]*prefetch=\{false\}/);
  assert.match(source, /series\.map[\s\S]*prefetch=\{false\}/);
});
