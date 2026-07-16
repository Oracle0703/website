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
  assert.match(pageSource, /new Set\(featuredProjects\.map\(\(project\) => project\.slug\)\)/);
  assert.match(pageSource, /projects\.filter\(\(project\) => !featuredSlugs\.has\(project\.slug\)\)/);
  assert.match(pageSource, /archiveProjects=\{archiveProjects\}/);
  assert.match(pageSource, /<ProjectsClient/);
  assert.match(pageSource, /copy=\{pages\.projects\}/);
  assert.match(pageSource, /common=\{pages\.common\}/);

  assert.doesNotMatch(clientSource, /["']use client["']/);
  assert.doesNotMatch(clientSource, /\buse(?:State|Effect|Memo|Callback|Ref)\b|\bwindow\b|\bdocument\b/);
  assert.doesNotMatch(clientSource, /useI18n|getMessages\(/);
  assert.match(clientSource, /type ProjectsCopy = Messages\["pages"\]\["projects"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  assert.match(clientSource, /type ProjectsClientProps/);
  assert.match(clientSource, /archiveProjects:\s*ProjectView\[\]/);
  assert.match(clientSource, /featuredProjects:\s*ProjectView\[\]/);
  assert.doesNotMatch(clientSource, /projects:\s*ProjectView\[\]/);
});

test('English projects page also removes featured projects from its archive', () => {
  const pageSource = read('apps/website/app/en/projects/page.tsx');

  assert.match(pageSource, /getProjectViews\("en"\)/);
  assert.match(pageSource, /getFeaturedProjectViews\("en"\)/);
  assert.match(pageSource, /new Set\(featuredProjects\.map\(\(project\) => project\.slug\)\)/);
  assert.match(pageSource, /projects\.filter\(\(project\) => !featuredSlugs\.has\(project\.slug\)\)/);
  assert.match(pageSource, /archiveProjects=\{archiveProjects\}/);
});

test('static rendering document records projects as the next migrated page', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /\/projects/);
  assert.match(source, /ProjectsClient/);
  assert.match(source, /page-level server cookie/);
});
