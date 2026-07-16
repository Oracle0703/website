const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('labs page avoids page-level locale cookie reads', () => {
  const pageSource = read('apps/website/app/labs/page.tsx');
  const clientSource = read('apps/website/app/labs/labs-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<LabsClient locale=\{defaultLocale\} copy=\{pages\.labs\} common=\{pages\.common\} \/>/);

  assert.match(clientSource, /"use client"/);
  assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
  assert.match(clientSource, /copy: Messages\["pages"\]\["labs"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  assert.match(clientSource, /<TimestampTool \/>/);
  assert.match(clientSource, /getHref\("\/labs\/query"\)/);
  assert.match(clientSource, /copy\.queryTitle/);
});

test('timestamp tool reads locale from client i18n context', () => {
  const source = read('apps/website/app/labs/timestamp-tool.tsx');

  assert.match(source, /useI18n/);
  assert.match(source, /const \{ locale \} = useI18n\(\)/);
  assert.doesNotMatch(source, /export function TimestampTool\(\{\s*locale\s*\}/);
  assert.doesNotMatch(source, /import type \{ Locale \}/);
});

test('static rendering document records labs as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/labs/);
  assert.match(source, /LabsClient/);
  assert.match(source, /TimestampTool/);
});
