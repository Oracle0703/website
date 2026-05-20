const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('enter page avoids page-level locale cookie reads', () => {
  const pageSource = read('apps/website/app/enter/page.tsx');
  const clientSource = read('apps/website/app/enter/enter-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<EnterClient \/>/);

  assert.match(clientSource, /"use client"/);
  assert.match(clientSource, /useI18n/);
  assert.match(clientSource, /messages\.enter/);
  assert.match(clientSource, /messages\.pages\.common/);
});

test('static rendering document records enter as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/enter/);
  assert.match(source, /EnterClient/);
  assert.match(source, /defaultLocale/);
});
