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

test("D5 project detail renders evidence, architecture, trade-offs, roadmap, and related links", () => {
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /EvidenceSection/);
  assert.match(clientSource, /copy\.evidenceTitle/);
  assert.match(clientSource, /project\.evidence/);
  assert.match(clientSource, /copy\.architectureTitle/);
  assert.match(clientSource, /project\.architecture/);
  assert.match(clientSource, /copy\.tradeoffsTitle/);
  assert.match(clientSource, /project\.tradeoffs/);
  assert.match(clientSource, /copy\.roadmapTitle/);
  assert.match(clientSource, /project\.roadmap/);
  assert.match(clientSource, /copy\.relatedEntryTitle/);

  for (const key of [
    "evidenceTitle",
    "architectureTitle",
    "tradeoffsTitle",
    "roadmapTitle",
    "relatedEntryTitle"
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }
});

test("D6 project detail renders asset status, labels, and safe asset variants", () => {
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /function AssetSection/);
  assert.match(clientSource, /copy\.assetTitle/);
  assert.match(clientSource, /project\.asset/);
  assert.match(clientSource, /asset\.kind/);
  assert.match(clientSource, /copy\.assetKindLabel/);
  assert.match(clientSource, /copy\.assetUnavailableLabel/);
  assert.match(clientSource, /copy\.nextAssetStepLabel/);
  assert.match(clientSource, /aspect-\[16\/9\]/);
  assert.match(clientSource, /from "next\/image"/);
  assert.match(clientSource, /<Image/);
  assert.match(clientSource, /asset\.reason/);
  assert.match(clientSource, /asset\.nextAssetStep/);

  for (const key of [
    "assetTitle",
    "assetKindLabel",
    "assetUnavailableLabel",
    "nextAssetStepLabel",
    "assetKind"
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }
});

test("D5 blog detail names the article-to-project evidence bridge", () => {
  const clientSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /copy\.articleEvidenceTitle/);
  assert.match(clientSource, /copy\.articleEvidenceDescription/);
  assert.match(clientSource, /getHref\("\/projects"\)/);
  assert.match(clientSource, /getHref\("\/contact"\)/);
  assert.match(i18nSource, /articleEvidenceTitle/);
  assert.match(i18nSource, /articleEvidenceDescription/);
});

test("static rendering document records blog and project detail migration", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /Blog 详情页/);
  assert.match(source, /Project 详情页/);
  assert.match(source, /BlogDetailClient/);
  assert.match(source, /ProjectDetailClient/);
});
