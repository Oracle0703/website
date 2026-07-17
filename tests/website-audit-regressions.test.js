const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("P0 footer links to the confirmed GitHub profile without platform-home placeholders", () => {
  const source = read("apps/website/components/site-footer.tsx");
  const identitySource = read("apps/website/lib/site-identity.ts");

  assert.match(source, /siteIdentity\.githubUrl/);
  assert.match(identitySource, /githubUrl: "https:\/\/github\.com\/Oracle0703"/);
  assert.doesNotMatch(source, /href:\s*"https:\/\/github\.com"/);
  assert.doesNotMatch(source, /href:\s*"https:\/\/x\.com"/);
  assert.doesNotMatch(source, /href:\s*"https:\/\/www\.linkedin\.com"/);
});

test("P0 home, reveal sections, and enter page are visible before hydration", () => {
  const homeSource = read("apps/website/components/home/home-page-client.tsx");
  const revealSource = read("apps/website/components/reveal-section.tsx");
  const enterSource = read("apps/website/app/enter/enter-client.tsx");

  assert.doesNotMatch(homeSource, /isMounted|opacity-0 translate-y-2/);
  assert.doesNotMatch(revealSource, /IntersectionObserver|isVisible|opacity-0/);
  assert.doesNotMatch(enterSource, /isMounted/);
  assert.match(enterSource, /isExiting\s*\?\s*"opacity-0 scale-95"\s*:\s*"opacity-100 scale-100"/);
});

test("P0 social preview is a branded, non-uniform 1200 by 630 image", async () => {
  const imagePath = path.join(root, "apps/website/public/og.png");
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const stats = await image.stats();

  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.ok(
    stats.channels.slice(0, 3).some((channel) => channel.stdev > 5),
    "og.png must contain visible contrast instead of a single flat color"
  );
  assert.ok(stats.entropy > 1, "og.png must contain enough visual information for a branded preview");
});

test("P0 homepage positioning states a specific outcome and exposes three direct actions", () => {
  const i18nSource = read("apps/website/lib/i18n.ts");
  const homeSource = read("apps/website/components/home/home-page-client.tsx");

  assert.match(i18nSource, /把复杂想法，做成清晰、可用的产品。/);
  assert.match(i18nSource, /Turning complex ideas into clear, useful products\./);
  assert.match(i18nSource, /ctaContact:/);
  assert.match(homeSource, /getHref\(flagshipProjectHref\)/);
  assert.match(homeSource, /getHref\("\/blog"\)/);
  assert.match(homeSource, /getHref\("\/contact"\)/);
});

test("P1 article alternates and sitemap respect locale and indexability boundaries", () => {
  const seoSource = read("apps/website/lib/seo.ts");
  const zhArticleSource = read("apps/website/app/(zh)/blog/[slug]/page.tsx");
  const enArticleSource = read("apps/website/app/en/blog/[slug]/page.tsx");
  const sitemapSource = read("apps/website/app/sitemap.ts");

  assert.match(seoSource, /availableLocales:\s*readonly Locale\[\]/);
  assert.match(zhArticleSource, /post\.availableLocales/);
  assert.match(enArticleSource, /post\.availableLocales/);
  assert.match(sitemapSource, /!post\.seo\?\.noindex/);
  assert.match(sitemapSource, /NON_INDEXABLE_ROUTES/);
});

test("GitHub CI uses the supported runtime and a portable public lockfile", () => {
  const workflowSource = read(".github/workflows/website-ci.yml");
  const giteeCiSource = read(".gitee/workflows/website-ci.yml");
  const giteeCdSource = read(".gitee/workflows/website-cd.yml");
  const lockfileSource = read("package-lock.json");

  assert.match(workflowSource, /node-version:\s*22\.22\.0/);
  assert.match(workflowSource, /run:\s*npm test/);
  assert.match(workflowSource, /run:\s*npm run build:website/);
  assert.match(workflowSource, /run:\s*npm run verify:website-static/);
  assert.match(workflowSource, /playwright install --with-deps chromium/);
  assert.match(workflowSource, /run:\s*npm run verify:website-browser/);
  assert.match(giteeCiSource, /node-version:\s*"22\.22\.0"/);
  assert.match(giteeCdSource, /node-version:\s*"22\.22\.0"/);
  assert.doesNotMatch(lockfileSource, /192\.168\.5\.16|http:\/\/[^"\s]+\.tgz/);
});
