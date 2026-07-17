const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

async function loadRssModule() {
  const url = pathToFileURL(path.join(root, "apps/website/lib/rss.mjs"));
  return import(`${url.href}?t=${Date.now()}`);
}

test("RSS renderer emits absolute URLs, escaped XML, and deterministic dates", async () => {
  const { renderRssFeed } = await loadRssModule();
  const xml = renderRssFeed({
    title: "Meaningful & <Ink>",
    description: "AI products \u0001 with clear evidence",
    siteUrl: "https://www.meaningful.ink/",
    feedUrl: "https://www.meaningful.ink/rss.xml?source=site&format=rss",
    language: "zh-CN",
    items: [
      {
        title: 'Build <things> & ship "evidence"',
        url: "https://www.meaningful.ink/blog/build?from=rss&lang=zh",
        summary: "A prototype's practical <notes>",
        publishedAt: "2026-02-11",
        updatedAt: "2026-02-12",
        categories: ["AI & Product"]
      }
    ]
  });

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2\.0" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom">/);
  assert.match(xml, /<title>Meaningful &amp; &lt;Ink&gt;<\/title>/);
  assert.match(xml, /href="https:\/\/www\.meaningful\.ink\/rss\.xml\?source=site&amp;format=rss"/);
  assert.match(xml, /<link>https:\/\/www\.meaningful\.ink\/blog\/build\?from=rss&amp;lang=zh<\/link>/);
  assert.match(xml, /Build &lt;things&gt; &amp; ship &quot;evidence&quot;/);
  assert.match(xml, /A prototype&apos;s practical &lt;notes&gt;/);
  assert.match(xml, /<category>AI &amp; Product<\/category>/);
  assert.match(xml, /<pubDate>Wed, 11 Feb 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<lastBuildDate>Thu, 12 Feb 2026 00:00:00 GMT<\/lastBuildDate>/);
  assert.doesNotMatch(xml, /\u0001/);
});

test("RSS renderer rejects relative item URLs", async () => {
  const { renderRssFeed } = await loadRssModule();

  assert.throws(
    () =>
      renderRssFeed({
        title: "Feed",
        description: "Description",
        siteUrl: "https://www.meaningful.ink/",
        feedUrl: "https://www.meaningful.ink/rss.xml",
        items: [
          {
            title: "Relative URL",
            url: "/blog/relative",
            summary: "Summary",
            publishedAt: "2026-02-11"
          }
        ]
      }),
    /items\[0\]\.url must be an absolute URL/
  );
});

test("Chinese and English RSS routes filter posts and item URLs by locale", () => {
  const routeSource = read("apps/website/app/rss.xml/route.ts");
  const englishRouteSource = read("apps/website/app/en/rss.xml/route.ts");

  assert.match(routeSource, /getPublishedPostsForLocale\(defaultLocale\)\.filter\(/);
  assert.doesNotMatch(routeSource, /getPublishedPosts\(\)/);
  assert.match(routeSource, /toAbsoluteUrl\(`\/blog\/\$\{encodeURIComponent\(post\.slug\)\}`\)/);
  assert.match(routeSource, /renderRssFeed/);
  assert.match(routeSource, /categories:\s*post\.category\s*\?\s*\[post\.category\]/);
  assert.match(routeSource, /application\/rss\+xml; charset=utf-8/);
  assert.match(routeSource, /export const dynamic = "force-static"/);

  assert.match(englishRouteSource, /const locale: Locale = "en"/);
  assert.match(englishRouteSource, /getPublishedPostsForLocale\(locale\)\.filter\(/);
  assert.doesNotMatch(englishRouteSource, /getPublishedPosts\(\)/);
  assert.match(englishRouteSource, /siteUrl: toAbsoluteUrl\("\/en"\)/);
  assert.match(englishRouteSource, /feedUrl: toAbsoluteUrl\("\/en\/rss\.xml"\)/);
  assert.match(englishRouteSource, /language: "en"/);
  assert.match(
    englishRouteSource,
    /toAbsoluteUrl\(`\/en\/blog\/\$\{encodeURIComponent\(post\.slug\)\}`\)/
  );
  assert.match(englishRouteSource, /application\/rss\+xml; charset=utf-8/);
  assert.match(englishRouteSource, /export const dynamic = "force-static"/);
});

test("metadata, footer, and article engagement discover the matching locale feed", () => {
  const rootMetadataSource = read("apps/website/lib/root-metadata.ts");
  const seoSource = read("apps/website/lib/seo.ts");
  const shellSource = read("apps/website/lib/i18n-shell.ts");
  const footerSource = read("apps/website/components/site-footer.tsx");
  const engagementSource = read("apps/website/components/blog-engagement.tsx");

  assert.match(
    rootMetadataSource,
    /"application\/rss\+xml": `\$\{baseUrl\}\$\{getLocalePath\("\/rss\.xml", locale\)\}`/
  );
  assert.match(seoSource, /getLocalePath\("\/rss\.xml", getRouteLocale\(pathname\)\)/);
  assert.match(shellSource, /href: "\/rss\.xml", label: "RSS", localized: false/);
  assert.match(shellSource, /href: "\/en\/rss\.xml", label: "RSS", localized: false/);
  assert.match(footerSource, /type=\{item\.href\.endsWith\("\.xml"\)/);
  assert.match(engagementSource, /href=\{getLocalePath\("\/rss\.xml", locale\)\}/);
});

test("Chinese RSS cannot include native English-only article URLs", () => {
  const routeSource = read("apps/website/app/rss.xml/route.ts");
  const contentModelPost = read(
    "content/blog/2026-02-11-blog-content-model-state-machine.mdx"
  );
  const timestampPost = read(
    "content/blog/2026-02-11-timestamp-tool-retrospective-timezone-precision-ux.mdx"
  );

  assert.match(routeSource, /getPublishedPostsForLocale\(defaultLocale\)/);
  assert.match(routeSource, /toAbsoluteUrl\(`\/blog\//);
  assert.doesNotMatch(routeSource, /toAbsoluteUrl\(`\/en\/blog\//);

  for (const source of [contentModelPost, timestampPost]) {
    assert.match(source, /^locale: "en"$/m);
    assert.match(source, /^availableLocales: \["en"\]$/m);
  }
});
