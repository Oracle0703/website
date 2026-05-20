const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("blog detail page avoids page-level locale cookie reads", () => {
  const pageSource = read("apps/website/app/blog/[slug]/page.tsx");
  const clientSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<BlogDetailClient/);

  assert.match(clientSource, /"use client"/);
  assert.match(clientSource, /useI18n/);
  assert.match(clientSource, /messages\.pages\.blog/);
  assert.match(clientSource, /messages\.pages\.common/);
  assert.match(clientSource, /formatDate\(post\.date,\s*locale\)/);
});

test("project detail page avoids page-level locale cookie reads", () => {
  const pageSource = read("apps/website/app/projects/[slug]/page.tsx");
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<ProjectDetailClient/);

  assert.match(clientSource, /"use client"/);
  assert.match(clientSource, /useI18n/);
  assert.match(clientSource, /messages\.pages\.projects/);
  assert.match(clientSource, /messages\.pages\.common/);
  assert.match(clientSource, /copy\.status\[project\.status\]/);
  assert.match(clientSource, /copy\.type\[project\.type\]/);
});

test("static rendering document records blog and project detail migration", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /Blog 详情页/);
  assert.match(source, /Project 详情页/);
  assert.match(source, /BlogDetailClient/);
  assert.match(source, /ProjectDetailClient/);
});
