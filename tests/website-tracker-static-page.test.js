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
  assert.doesNotMatch(clientSource, /AnnouncementTicker|概念原型|Concept prototype|林远|Lin Yuan/);
  assert.match(clientSource, /TRACKER_STORAGE_KEY/);
  assert.match(clientSource, /window\.localStorage\.getItem/);
  assert.match(clientSource, /window\.localStorage\.setItem/);
  assert.match(clientSource, /parseTrackerState/);
  assert.match(clientSource, /aria-live="polite"/);
  assert.match(clientSource, /aria-pressed=\{completedToday\}/);
  assert.match(clientSource, /motion-reduce:transition-none/);
  assert.match(clientSource, /你的习惯数据只留在这台设备/);
  assert.match(clientSource, /Your habit data stays on this device/);
  assert.match(clientSource, /Tracker 本身不会主动上传记录/);
  assert.match(clientSource, /Tracker itself does not upload them/);
  assert.match(clientSource, /原始内容未被覆盖/);
  assert.match(clientSource, /window\.confirm\(confirmation\)/);
  assert.match(clientSource, /"\{incoming\}"/);
  assert.match(clientSource, /getLocalePath\("\/enter", locale\)/);
  assert.match(clientSource, /getLocalePath\("\/", locale\)/);
});

test('static rendering document records tracker as a migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/tracker/);
  assert.match(source, /TrackerClient/);
  assert.match(source, /trackerContent/);
});
