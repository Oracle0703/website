const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("blog detail page avoids page-level locale cookie reads", () => {
  const pageSource = read("apps/website/app/(zh)/blog/[slug]/page.tsx");
  const clientSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<BlogDetailClient/);

  assert.doesNotMatch(clientSource, /["']use client["']/);
  assert.doesNotMatch(clientSource, /\buse(?:State|Effect|Memo|Callback|Ref)\b|\bwindow\b|\bdocument\b/);
  assert.doesNotMatch(clientSource, /useI18n/);
  assert.match(clientSource, /copy: Messages\["pages"\]\["blog"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  assert.match(clientSource, /formatDate\(post\.date,\s*locale\)/);
});

test("project detail page avoids page-level locale cookie reads", () => {
  const pageSource = read("apps/website/app/(zh)/projects/[slug]/page.tsx");
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");

  assert.doesNotMatch(pageSource, /i18n-server/);
  assert.doesNotMatch(pageSource, /getLocale\(/);
  assert.match(pageSource, /defaultLocale/);
  assert.match(pageSource, /getMessages\(defaultLocale\)/);
  assert.match(pageSource, /<ProjectDetailClient/);

  assert.doesNotMatch(clientSource, /["']use client["']/);
  assert.doesNotMatch(clientSource, /\buse(?:State|Effect|Memo|Callback|Ref)\b|\bwindow\b|\bdocument\b/);
  assert.doesNotMatch(clientSource, /useI18n/);
  assert.match(clientSource, /copy: Messages\["pages"\]\["projects"\]/);
  assert.match(clientSource, /common: Messages\["pages"\]\["common"\]/);
  assert.match(clientSource, /copy\.status\[project\.status\]/);
  assert.match(clientSource, /copy\.type\[project\.type\]/);
});

test("project detail renders evidence, architecture flow, decisions, roadmap, and related links", () => {
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /EvidenceSection/);
  assert.match(clientSource, /copy\.evidenceTitle/);
  assert.match(clientSource, /project\.evidence/);
  assert.match(clientSource, /copy\.architectureTitle/);
  assert.match(clientSource, /project\.architecture/);
  assert.match(clientSource, /ArchitectureDiagram/);
  assert.match(clientSource, /project\.architectureSteps/);
  assert.match(clientSource, /DecisionSection/);
  assert.match(clientSource, /project\.decisions/);
  assert.match(clientSource, /copy\.decisionsTitle/);
  assert.match(clientSource, /copy\.roadmapTitle/);
  assert.match(clientSource, /project\.roadmap/);
  assert.match(clientSource, /copy\.relatedEntryTitle/);

  for (const key of [
    "evidenceTitle",
    "architectureTitle",
    "architectureStepLabel",
    "decisionsTitle",
    "rationaleLabel",
    "impactLabel",
    "roadmapTitle",
    "relatedEntryTitle"
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }
});

test("project detail renders an evidence gallery with safe asset variants", () => {
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /function ProjectAssetCard/);
  assert.match(clientSource, /function ProjectAssetGallery/);
  assert.match(clientSource, /copy\.evidenceGalleryTitle/);
  assert.match(clientSource, /copy\.evidenceGalleryDescription/);
  assert.match(clientSource, /copy\.assetTitle/);
  assert.match(clientSource, /project\.asset/);
  assert.match(clientSource, /project\.gallery/);
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
    "evidenceGalleryTitle",
    "evidenceGalleryDescription",
    "assetKindLabel",
    "assetUnavailableLabel",
    "nextAssetStepLabel",
    "assetKind"
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }
});

test("project detail gives demo and source their own honest entry panel", () => {
  const clientSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /function ProjectEntryPanel/);
  assert.match(clientSource, /project\.entry/);
  assert.match(clientSource, /demo\.status === "available"/);
  assert.match(clientSource, /demo\.reason/);
  assert.match(clientSource, /getLocalePath\(demo\.href, locale\)/);
  assert.match(clientSource, /source\.href/);
  assert.match(clientSource, /target="_blank"/);
  assert.match(clientSource, /rel="noreferrer"/);

  for (const key of [
    "entryEyebrow",
    "entryTitle",
    "demoAvailableLabel",
    "demoUnavailableLabel",
    "sourceEntryLabel"
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

test("detail pages use editorial sections instead of nested generic panels", () => {
  const blogSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");
  const projectSource = read("apps/website/app/projects/[slug]/project-detail-client.tsx");

  assert.doesNotMatch(blogSource, /panel-surface|card-interactive/);
  assert.match(blogSource, /<article className=/);
  assert.match(blogSource, /<aside\s+className=/);
  assert.match(blogSource, /relatedPosts\.map[\s\S]*prefetch=\{false\}/);
  assert.match(blogSource, /currentSeries\.posts\.map[\s\S]*prefetch=\{false\}/);

  assert.doesNotMatch(projectSource, /panel-surface|card-interactive|evidence-card/);
  assert.match(projectSource, /<ProjectAssetGallery/);
  assert.match(projectSource, /sizes=/);
  assert.match(projectSource, /<ol className=/);
  assert.match(projectSource, /copy\.architectureTitle/);
  assert.match(projectSource, /copy\.decisionsTitle/);
  assert.match(projectSource, /copy\.roadmapTitle/);
});

test("static rendering document records blog and project detail migration", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /Blog 详情页/);
  assert.match(source, /Project 详情页/);
  assert.match(source, /BlogDetailClient/);
  assert.match(source, /ProjectDetailClient/);
});
