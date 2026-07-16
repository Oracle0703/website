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
  assert.match(pageSource, /<TrackerClient locale=\{defaultLocale\} copy=\{pages\.tracker\} common=\{pages\.common\} \/>/);

  assert.match(clientSource, /"use client"/);
  assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
  assert.match(clientSource, /copy: Messages\["pages"\]\["tracker"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  assert.match(clientSource, /trackerContent\[locale\]/);
  assert.match(clientSource, /<AnnouncementTicker/);
  assert.match(clientSource, /概念原型 · 示例数据/);
  assert.match(clientSource, /Concept prototype · Mock data/);
  assert.match(clientSource, /content\.prototypeNotice\.description/);
  assert.match(clientSource, /label=\{content\.ticker\.label\}/);
  assert.match(clientSource, /pauseLabel=\{content\.ticker\.pauseLabel\}/);
  assert.match(clientSource, /resumeLabel=\{content\.ticker\.resumeLabel\}/);
  assert.match(read("apps/website/components/announcement-ticker.tsx"), /aria-pressed=\{isPaused\}/);
  assert.match(clientSource, /getLocalePath\("\/enter", locale\)/);
  assert.match(clientSource, /getLocalePath\("\/", locale\)/);
});

test('static rendering document records tracker as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/tracker/);
  assert.match(source, /TrackerClient/);
  assert.match(source, /trackerContent/);
});
