const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('blog detail page emits BlogPosting JSON-LD from the post data', () => {
  const source = read('apps/website/app/blog/[slug]/page.tsx');

  assert.match(source, /const jsonLd\s*=\s*\{/);
  assert.match(source, /"@context":\s*"https:\/\/schema\.org"/);
  assert.match(source, /"@type":\s*"BlogPosting"/);
  assert.match(source, /headline:\s*post\.title/);
  assert.match(source, /description:\s*description/);
  assert.match(source, /datePublished:\s*post\.date/);
  assert.match(source, /dateModified:\s*post\.updatedAt/);
  assert.match(source, /author:\s*\{\s*"@type":\s*"Person",\s*name:\s*post\.author\s*\}/s);
  assert.match(source, /url:\s*toAbsoluteUrl\(canonicalPath\)/);
  assert.match(source, /image:\s*getStructuredDataImageUrl\(cover\)/);
  assert.match(source, /function getStructuredDataImageUrl\(src: string\)/);
  assert.match(source, /return src\.startsWith\("http:\/\/"\) \|\| src\.startsWith\("https:\/\/"\)/);
  assert.match(source, /type="application\/ld\+json"/);
  assert.match(source, /dangerouslySetInnerHTML=\{\{\s*__html:\s*JSON\.stringify\(jsonLd\)\s*\}\}/);
});

test('project detail page emits SoftwareApplication JSON-LD from locale-aware project view data', () => {
  const source = read('apps/website/app/projects/[slug]/page.tsx');

  assert.match(source, /const jsonLd\s*=\s*\{/);
  assert.match(source, /"@context":\s*"https:\/\/schema\.org"/);
  assert.match(source, /"@type":\s*"SoftwareApplication"/);
  assert.match(source, /const projectView\s*=\s*getProjectView\(project,\s*defaultLocale\)/);
  assert.match(source, /name:\s*projectView\.title/);
  assert.match(source, /description:\s*projectView\.summary/);
  assert.match(source, /url:\s*toAbsoluteUrl\(canonicalPath\)/);
  assert.match(source, /dateModified:\s*project\.updatedAt/);
  assert.match(source, /applicationCategory:\s*project\.type/);
  assert.match(source, /image:\s*toAbsoluteUrl\("\/og\.png"\)/);
  assert.match(source, /type="application\/ld\+json"/);
  assert.match(source, /dangerouslySetInnerHTML=\{\{\s*__html:\s*JSON\.stringify\(jsonLd\)\s*\}\}/);
});
