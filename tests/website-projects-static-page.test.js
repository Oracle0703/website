const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('projects list page avoids page-level locale cookie reads', () => {
  const pageSource = read('apps/website/app/projects/page.tsx');
  const clientSource = read('apps/website/app/projects/projects-client.tsx');

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /getProjectViews\(defaultLocale\)/);
  assert.match(pageSource, /getFeaturedProjectViews\(defaultLocale\)/);
  assert.match(pageSource, /<ProjectsClient/);

  assert.match(clientSource, /"use client"/);
  assert.match(clientSource, /useI18n/);
  assert.match(clientSource, /messages\.pages\.projects/);
  assert.match(clientSource, /messages\.pages\.common/);
  assert.match(clientSource, /type ProjectsClientProps/);
  assert.match(clientSource, /projects:\s*ProjectView\[\]/);
  assert.match(clientSource, /featuredProjects:\s*ProjectView\[\]/);
});

test('static rendering document records projects as the next migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/projects/);
  assert.match(source, /ProjectsClient/);
  assert.match(source, /page-level server cookie/);
});
