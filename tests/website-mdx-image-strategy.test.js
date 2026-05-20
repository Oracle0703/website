const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('mdx image component uses next image with stable dimensions', () => {
  const source = read('apps/website/components/mdx-components.tsx');

  assert.match(source, /from "next\/image"/);
  assert.match(source, /DEFAULT_MDX_IMAGE_WIDTH\s*=\s*1200/);
  assert.match(source, /DEFAULT_MDX_IMAGE_HEIGHT\s*=\s*630/);
  assert.match(source, /Number\(width\)/);
  assert.match(source, /Number\(height\)/);
  assert.match(source, /sizes=/);
  assert.doesNotMatch(source, /<img\s/);
});

test('content validator checks mdx image alt text in published posts', () => {
  const source = read('scripts/validate-website-content.mjs');

  assert.match(source, /validateMdxImages/);
  assert.match(source, /mdx image alt is required/);
  assert.match(source, /<Image\b/);
  assert.match(source, /markdownImagePattern/);
});
