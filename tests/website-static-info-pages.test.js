const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('about and contact pages avoid page-level server cookie reads', () => {
  for (const route of ['about', 'contact']) {
    const pageSource = read(`apps/website/app/${route}/page.tsx`);
    const clientSource = read(`apps/website/app/${route}/${route}-client.tsx`);

    assert.doesNotMatch(pageSource, /i18n-server/);
    assert.doesNotMatch(pageSource, /getLocale\(/);
    assert.match(pageSource, /defaultLocale/);
    assert.match(pageSource, /getMessages\(defaultLocale\)/);
    assert.match(pageSource, new RegExp(`${route[0].toUpperCase()}${route.slice(1)}Client`));
    assert.match(pageSource, new RegExp(`copy=\\{pages\\.${route}\\}`));
    assert.match(pageSource, /common=\{pages\.common\}/);

    assert.match(clientSource, /"use client"/);
    assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
    assert.match(clientSource, new RegExp(`copy: Messages\\["pages"\\]\\["${route}"\\]`));
    assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  }
});

test('static rendering plan records the D1.5 info page extraction', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /D1\.5 信息页静态化前置/);
  assert.match(source, /\/about/);
  assert.match(source, /\/contact/);
  assert.match(source, /page-level server cookie/i);
});
