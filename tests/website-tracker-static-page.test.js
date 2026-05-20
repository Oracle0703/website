const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('tracker page avoids page-level locale cookie reads', () => {
  const pageSource = read('apps/website/app/tracker/page.tsx');
  const clientSource = read('apps/website/app/tracker/tracker-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.doesNotMatch(pageSource, /type Locale/);
  assert.doesNotMatch(pageSource, /trackerContent/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<TrackerClient \/>/);

  assert.match(clientSource, /"use client"/);
  assert.match(clientSource, /useI18n/);
  assert.match(clientSource, /messages\.pages\.tracker/);
  assert.match(clientSource, /messages\.pages\.common/);
  assert.match(clientSource, /trackerContent\[locale\]/);
  assert.match(clientSource, /<AnnouncementTicker/);
});

test('static rendering document records tracker as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/tracker/);
  assert.match(source, /TrackerClient/);
  assert.match(source, /trackerContent/);
});
