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

test("RSS route uses published indexable posts and exposes feed discovery metadata", () => {
  const routeSource = read("apps/website/app/rss.xml/route.ts");
  const layoutSource = read("apps/website/app/layout.tsx");
  const seoSource = read("apps/website/lib/seo.ts");

  assert.match(routeSource, /getPublishedPosts\(\)\.filter\(\(post\) => !post\.seo\?\.noindex\)/);
  assert.match(routeSource, /toAbsoluteUrl\(`\/blog\/\$\{encodeURIComponent\(post\.slug\)\}`\)/);
  assert.match(routeSource, /renderRssFeed/);
  assert.match(routeSource, /categories:\s*post\.category\s*\?\s*\[post\.category\]/);
  assert.match(routeSource, /application\/rss\+xml; charset=utf-8/);
  assert.match(routeSource, /export const dynamic = "force-static"/);
  assert.match(layoutSource, /"application\/rss\+xml": `\$\{baseUrl\}\/rss\.xml`/);
  assert.match(seoSource, /"application\/rss\+xml": toAbsoluteUrl\("\/rss\.xml"\)/);
});
