const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('blog cover images use a shared next/image component', () => {
  const componentSource = read('apps/website/components/blog-cover-image.tsx');
  const blogListSource = read('apps/website/app/blog/blog-list-view.tsx');
  const blogDetailSource = read('apps/website/app/blog/[slug]/blog-detail-client.tsx');

  assert.match(componentSource, /from "next\/image"/);
  assert.match(componentSource, /export function BlogCoverImage/);
  assert.match(componentSource, /fill/);
  assert.match(componentSource, /sizes=/);
  assert.match(componentSource, /priority/);

  assert.match(blogListSource, /BlogCoverImage/);
  assert.doesNotMatch(blogListSource, /<img\s/);

  assert.match(blogDetailSource, /BlogCoverImage/);
  assert.doesNotMatch(blogDetailSource, /<img\s/);
});
