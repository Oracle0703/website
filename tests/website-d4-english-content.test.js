const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

const cjkPattern = /[\u3400-\u9fff\uF900-\uFAFF]/;

function assertNoCjk(value, label) {
  assert.doesNotMatch(String(value), cjkPattern, `${label} should not contain CJK characters`);
}

function assertAssetNoCjk(asset, label) {
  if (["screenshot", "mock", "diagram"].includes(asset.kind)) {
    assertNoCjk(asset.alt, `${label} alt`);
    assertNoCjk(asset.caption, `${label} caption`);
    return;
  }

  if (asset.kind === "doc") {
    assertNoCjk(asset.label, `${label} label`);
    assertNoCjk(asset.description, `${label} description`);
    return;
  }

  assert.equal(asset.kind, "none");
  assertNoCjk(asset.reason, `${label} unavailable reason`);
  assertNoCjk(asset.nextAssetStep, `${label} next step`);
}

test("D4 plan records English content audit scope and Task 1 completion criteria", () => {
  const source = read("docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md");

  assert.match(source, /Task 1: 英文内容审计与护栏/);
  assert.match(source, /scripts\/audit-website-english-content\.mjs/);
  assert.match(source, /\/en\/projects\/ai-page-analysis/);
  assert.match(source, /允许中文例外/);
  assert.match(source, /技术名词、品牌名、文章原文标题可以例外/);
  assert.match(source, /项目主体字段、CTA、metadata、JSON-LD 不应例外/);
});

test("workspace exposes a D4 English content audit command", () => {
  const source = read("package.json");

  assert.match(source, /"audit:website-english-content"/);
  assert.match(source, /scripts\/audit-website-english-content\.mjs/);
});

test("English content audit covers critical D4 route surfaces and exception policy", () => {
  const source = read("scripts/audit-website-english-content.mjs");

  for (const expected of [
    "apps/website/app/en/page.tsx",
    "apps/website/app/en/projects/page.tsx",
    "apps/website/app/en/projects/[slug]/page.tsx",
    "apps/website/app/en/ai-page-analysis/page.tsx",
    "apps/website/lib/projects.ts",
    "apps/website/components/landing/ai-page-analysis-landing-client.tsx"
  ]) {
    assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(source, /allowedCjkExceptions/);
  assert.match(source, /maxCjkCharacters/);
  assert.match(source, /localized-source/);
  assert.match(source, /project-view/);
  assert.match(source, /blog-view/);
  assert.match(source, /route-surface/);
});

test("English content audit runs against the current D4 baseline", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/audit-website-english-content.mjs"],
    {
      cwd: root,
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Website English content audit/);
  assert.match(result.stdout, /\/en\/projects\/ai-page-analysis/);
  assert.match(result.stdout, /localized-source/);
  assert.match(result.stdout, /project-view \/en\/projects .*0\/0 CJK/);
  assert.match(result.stdout, /blog-view \/en\/blog .*0\/0 CJK/);
});

test("Projects expose locale-aware English view data without CJK body fields", async () => {
  const {
    getAllProjects,
    getFeaturedProjectViews,
    getProjectBySlug,
    getProjectView
  } = await importFresh("apps/website/lib/projects.ts");

  const project = getProjectBySlug("ai-page-analysis");
  assert.ok(project, "ai-page-analysis project should exist");

  const view = getProjectView(project, "en");
  assert.equal(view.slug, "ai-page-analysis");
  assert.equal(view.status, project.status);
  assert.equal(view.type, project.type);
  assert.equal(view.stack, project.stack);
  assert.match(view.title, /AI Page Analysis/);

  for (const field of [
    "title",
    "subtitle",
    "summary",
    "problem",
    "solution"
  ]) {
    assertNoCjk(view[field], `project view ${field}`);
  }

  for (const listField of ["role", "highlights", "limitations", "nextSteps"]) {
    for (const item of view[listField]) {
      assertNoCjk(item, `project view ${listField}`);
    }
  }

  for (const item of view.evidence) {
    assertNoCjk(item.label, "project view evidence label");
    assertNoCjk(item.value, "project view evidence value");
  }

  assertNoCjk(view.architecture, "project view architecture");

  for (const step of view.architectureSteps) {
    assertNoCjk(step.title, "project architecture step title");
    assertNoCjk(step.description, "project architecture step description");
  }

  for (const decision of view.decisions) {
    assertNoCjk(decision.decision, "project decision");
    assertNoCjk(decision.rationale, "project decision rationale");
    assertNoCjk(decision.impact, "project decision impact");
  }

  for (const listField of ["tradeoffs", "roadmap"]) {
    for (const item of view[listField]) {
      assertNoCjk(item, `project view ${listField}`);
    }
  }

  for (const link of view.links) {
    assertNoCjk(link.label, "project link label");
  }

  assertAssetNoCjk(view.asset, "project asset");
  for (const [index, asset] of view.gallery.entries()) {
    assertAssetNoCjk(asset, `project gallery asset ${index + 1}`);
  }

  if (view.entry.demo.status === "available") {
    assertNoCjk(view.entry.demo.label, "project demo label");
    assertNoCjk(view.entry.demo.description, "project demo description");
  } else {
    assertNoCjk(view.entry.demo.reason, "project unavailable demo reason");
  }
  assertNoCjk(view.entry.source.label, "project source label");
  assertNoCjk(view.entry.source.description, "project source description");

  assert.equal(getAllProjects().length, 5);
  assert.ok(getFeaturedProjectViews("en").length > 0);
});

test("all English project views localize structured evidence fields", async () => {
  const { getAllProjects, getProjectView } = await importFresh("apps/website/lib/projects.ts");

  for (const project of getAllProjects()) {
    const view = getProjectView(project, "en");
    assert.ok(view.gallery.length > 0, `${project.slug} should expose gallery evidence`);
    assert.ok(view.architectureSteps.length >= 4, `${project.slug} should expose architecture steps`);
    assert.ok(view.decisions.length >= 3, `${project.slug} should expose structured decisions`);

    for (const step of view.architectureSteps) {
      assertNoCjk(step.title, `${project.slug} architecture title`);
      assertNoCjk(step.description, `${project.slug} architecture description`);
    }
    for (const decision of view.decisions) {
      assertNoCjk(decision.decision, `${project.slug} decision`);
      assertNoCjk(decision.rationale, `${project.slug} rationale`);
      assertNoCjk(decision.impact, `${project.slug} impact`);
    }
    assertAssetNoCjk(view.asset, `${project.slug} primary asset`);
    view.gallery.forEach((asset, index) => {
      assertAssetNoCjk(asset, `${project.slug} gallery asset ${index + 1}`);
    });
    if (view.entry.demo.status === "available") {
      assertNoCjk(view.entry.demo.label, `${project.slug} demo label`);
      assertNoCjk(view.entry.demo.description, `${project.slug} demo description`);
    } else {
      assertNoCjk(view.entry.demo.reason, `${project.slug} unavailable demo reason`);
    }
    assertNoCjk(view.entry.source.label, `${project.slug} source label`);
    assertNoCjk(view.entry.source.description, `${project.slug} source description`);
  }
});

test("English project pages and home consume localized project views", () => {
  const enHome = read("apps/website/app/en/page.tsx");
  const enProjects = read("apps/website/app/en/projects/page.tsx");
  const enProjectDetail = read("apps/website/app/en/projects/[slug]/page.tsx");
  const zhProjectDetail = read("apps/website/app/(zh)/projects/[slug]/page.tsx");
  const projectClient = read("apps/website/app/projects/projects-client.tsx");
  const detailClient = read("apps/website/app/projects/[slug]/project-detail-client.tsx");

  assert.match(enHome, /getFeaturedProjectViews\("en"\)/);
  assert.match(enProjects, /getProjectViews\("en"\)/);
  assert.match(enProjects, /getFeaturedProjectViews\("en"\)/);
  assert.match(enProjectDetail, /getProjectView\(project,\s*locale\)/);
  assert.match(enProjectDetail, /name:\s*projectView\.title/);
  assert.match(enProjectDetail, /description:\s*projectView\.summary/);
  assert.match(zhProjectDetail, /getProjectView\(project,\s*defaultLocale\)/);
  assert.match(projectClient, /ProjectView/);
  assert.match(detailClient, /ProjectView/);
});

test("Blog posts define locale availability helpers and English route filters", () => {
  const blogSource = read("apps/website/lib/blog.ts");
  const enBlogList = read("apps/website/app/en/blog/page.tsx");
  const enBlogDetail = read("apps/website/app/en/blog/[slug]/page.tsx");
  const sitemapSource = read("apps/website/app/sitemap.ts");
  const validatorSource = read("scripts/validate-website-content.mjs");

  assert.match(blogSource, /availableLocales\?:\s*Locale\[\]/);
  assert.match(blogSource, /getPublishedPostsForLocale/);
  assert.match(blogSource, /getPostBySlugForLocale/);
  assert.match(blogSource, /hasPostLocale/);
  assert.match(enBlogList, /getPublishedPostsForLocale\(locale\)/);
  assert.match(enBlogDetail, /getPostBySlugForLocale\(params\.slug,\s*locale\)/);
  assert.match(enBlogDetail, /getPublishedPostsForLocale\(locale\)/);
  assert.match(sitemapSource, /hasPostLocale\(post,\s*locale\)/);
  assert.match(validatorSource, /availableLocales/);
});

test("AI page analysis client receives route locale and English copy", () => {
  const zhPage = read("apps/website/app/(zh)/ai-page-analysis/page.tsx");
  const enPage = read("apps/website/app/en/ai-page-analysis/page.tsx");
  const client = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");

  assert.match(zhPage, /<AIPageAnalysisLandingClient locale="zh" \/>/);
  assert.match(enPage, /<AIPageAnalysisLandingClient locale="en" \/>/);
  assert.match(client, /locale:\s*Locale/);
  assert.match(client, /aiPageAnalysisCopy/);
  assert.match(client, /AI Page Analysis and Redesign Assistant/);
  assert.match(client, /Generate redesign demo/);
});

test("AI page analysis product page states mock limitations and V1 roadmap in English", () => {
  const client = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");

  assert.match(client, /roadmapTitle/);
  assert.match(client, /roadmapItems/);
  assert.match(client, /limitationsTitle/);
  assert.match(client, /limitationsItems/);
  assert.match(client, /V1 roadmap/);
  assert.match(client, /Mock Pipeline limitation/);
  assert.match(client, /No live model integration/);
  assert.doesNotMatch(client, /production-ready AI analysis/);
});

test("D6 AI page analysis V1 tech spec defines backend safety and schema gates", () => {
  const techSpec = read("docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md");
  const productSpec = read("docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md");
  const client = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");

  for (const expected of [
    /SSRF/,
    /localhost/,
    /内网/,
    /cloud metadata|云元数据/i,
    /169\.254\.169\.254/,
    /input schema/i,
    /output schema/i,
    /invalid_url/,
    /url_unreachable/,
    /auth_required_page/,
    /capture_timeout/,
    /analysis_timeout/,
    /invalid_model_output/,
    /needs_review/,
    /D6 不实现|D6 only defines/i
  ]) {
    assert.match(techSpec, expected);
  }

  assert.match(productSpec, /AI_PAGE_ANALYSIS_V1_TECH_SPEC\.md/);
  assert.match(client, /Mock Pipeline limitation/);
  assert.match(client, /No live model integration/);
  assert.doesNotMatch(client, /production-ready AI analysis/);
});

test("D4 browser verification and release checklist cover English content quality", () => {
  const browserSpec = read("tests/website-browser-static.spec.ts");
  const checklist = read("docs/website/RELEASE_CHECKLIST.md");
  const plan = read("docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md");

  assert.match(browserSpec, /English content quality/);
  assert.match(browserSpec, /AI Page Analysis and Redesign Assistant/);
  assert.match(browserSpec, /Project cases/);
  assert.match(browserSpec, /expectNoCjk/);
  assert.match(checklist, /audit:website-english-content/);
  assert.match(checklist, /D4/);
  assert.match(plan, /- \[x\] \*\*Step 1: 写失败测试\*\*/);
  assert.match(plan, /- \[x\] \*\*Step 3: 更新发布 checklist\*\*/);
});
