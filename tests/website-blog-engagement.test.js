const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("blog detail pages expose article-scoped reading progress", () => {
  const detailSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");
  const progressSource = read("apps/website/components/blog-reading-progress.tsx");

  assert.match(detailSource, /<BlogReadingProgress/);
  assert.match(detailSource, /id=\{ARTICLE_BODY_ID\}/);
  assert.match(progressSource, /^"use client";/);
  assert.match(progressSource, /document\.getElementById\(targetId\)/);
  assert.match(progressSource, /addEventListener\("scroll", scheduleMeasure, \{ passive: true \}\)/);
  assert.match(progressSource, /role="progressbar"/);
  assert.match(progressSource, /aria-valuenow=\{progress\}/);
});

test("blog engagement provides RSS, native sharing, and a reliable copy fallback", () => {
  const source = read("apps/website/components/blog-engagement.tsx");

  assert.match(source, /^"use client";/);
  assert.match(source, /href="\/rss\.xml"/);
  assert.match(source, /typeof navigator\.share === "function"/);
  assert.match(source, /navigator\.clipboard\?\.writeText/);
  assert.match(source, /document\.execCommand\("copy"\)/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /copy\[locale\]/);
});

test("Giscus is article-controlled, configuration-safe, and loaded only after consent", () => {
  const detailSource = read("apps/website/app/blog/[slug]/blog-detail-client.tsx");
  const engagementSource = read("apps/website/components/blog-engagement.tsx");

  assert.match(detailSource, /commentsEnabled=\{Boolean\(post\.comments\?\.enabled\)\}/);
  assert.match(detailSource, /process\.env\.GISCUS_REPO/);
  assert.match(detailSource, /process\.env\.GISCUS_CATEGORY_ID/);
  assert.match(engagementSource, /hasValidDiscussionConfig/);
  assert.match(engagementSource, /if \(!commentsEnabled \|\| !configIsValid \|\| !commentsRequested\) return/);
  assert.doesNotMatch(engagementSource, /IntersectionObserver|window\.scrollY/);
  assert.match(engagementSource, /onClick=\{\(\) => setCommentsRequested\(true\)\}/);
  assert.match(engagementSource, /script\.src = "https:\/\/giscus\.app\/client\.js"/);
  assert.match(engagementSource, /script\.dataset\.loading = "lazy"/);
  assert.match(engagementSource, /No third-party comment script has been injected/);
  assert.match(engagementSource, /https:\/\/github\.com\/features\/discussions/);
  assert.doesNotMatch(engagementSource, /R_kgDO[A-Za-z0-9_-]+|DIC_kwDO[A-Za-z0-9_-]+/);
});

test("Giscus follows the site theme without reloading the provider script", () => {
  const source = read("apps/website/components/blog-engagement.tsx");

  assert.match(source, /useTheme\(\)/);
  assert.match(source, /frame\?\.contentWindow\?\.postMessage/);
  assert.match(source, /\{ giscus: \{ setConfig: \{ theme \} \} \}/);
  assert.match(source, /"https:\/\/giscus\.app"/);
  assert.match(source, /locale === "zh" \? "zh-CN" : "en"/);
});
