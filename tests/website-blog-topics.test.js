const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("blog discovery uses a stable five-topic taxonomy instead of a long tag cloud", () => {
  const topicSource = read("apps/website/lib/blog-topics.ts");
  const clientSource = read("apps/website/app/blog/blog-client.tsx");
  const listSource = read("apps/website/app/blog/blog-list-view.tsx");
  const topicIds = [...topicSource.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(topicIds, ["engineering", "product", "security", "seo", "labs"]);
  assert.match(clientSource, /searchParams\.get\("topic"\)/);
  assert.doesNotMatch(clientSource, /searchParams\.get\("tag"\)/);
  assert.match(listSource, /BLOG_TOPICS\.map/);
  assert.match(listSource, /\?topic=/);
  assert.doesNotMatch(listSource, /post\.tags\.map|sortedTags/);
  assert.doesNotMatch(listSource, /tags\?:\s*string\[\]/);
});

test("every repository article belongs to one of the stable topics", () => {
  const allowedTopics = new Set(["engineering", "product", "security", "seo", "labs"]);
  const contentDir = path.join(root, "content", "blog");
  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".mdx"));

  for (const file of files) {
    const source = fs.readFileSync(path.join(contentDir, file), "utf8");
    const category = source.match(/^category:\s*"([^"]+)"/m)?.[1];
    assert.ok(category, `${file} must declare a category`);
    assert.ok(allowedTopics.has(category), `${file} uses unsupported category: ${category}`);
  }
});
