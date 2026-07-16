const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('home page avoids page-level locale cookie reads', () => {
  const pageSource = read('apps/website/app/page.tsx');
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /getJsonLdLanguage\(defaultLocale\)/);
  assert.match(pageSource, /<HomePageClient/);
  assert.match(pageSource, /locale=\{defaultLocale\}/);
  assert.match(pageSource, /copy=\{home\}/);

  assert.doesNotMatch(clientSource, /["']use client["']/);
  assert.doesNotMatch(clientSource, /\buse(?:State|Effect|Memo|Callback|Ref)\b|\bwindow\b|\bdocument\b/);
  assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
  assert.match(clientSource, /copy: Messages\["home"\]/);
  assert.match(clientSource, /projectStatusLabels: Messages\["pages"\]\["projects"\]\["status"\]/);
});

test('home server passes project status keys instead of localized labels', () => {
  const pageSource = read('apps/website/app/page.tsx');
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.match(pageSource, /status:\s*project\.status/);
  assert.doesNotMatch(pageSource, /pages\.projects\.status\[project\.status\]/);
  assert.match(clientSource, /status:\s*ProjectStatus/);
  assert.match(clientSource, /projectStatusLabels\[project\.status\]/);
});

test('static rendering document records home as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /首页/);
  assert.match(source, /HomePageClient/);
  assert.match(source, /ProjectStatus/);
});
