const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("website config applies the low-risk security header baseline", async () => {
  const nextConfig = require(path.join(root, "apps/website/next.config.js"));
  const rules = await nextConfig.headers();

  assert.equal(nextConfig.poweredByHeader, false);
  assert.equal(nextConfig.images.unoptimized, true);

  const globalRule = rules.find((rule) => rule.source === "/:path*");
  assert.ok(globalRule);

  const headers = new Map(globalRule.headers.map(({ key, value }) => [key, value]));

  assert.equal(
    headers.get("Strict-Transport-Security"),
    "max-age=31536000; includeSubDomains"
  );
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.match(headers.get("Permissions-Policy"), /camera=\(\)/);
  assert.match(headers.get("Permissions-Policy"), /microphone=\(\)/);
  assert.match(headers.get("Permissions-Policy"), /geolocation=\(\)/);
  assert.equal(headers.has("Content-Security-Policy"), false);

  const apiRule = rules.find((rule) => rule.source === "/api/:path*");
  assert.ok(apiRule);
  const apiHeaders = new Map(apiRule.headers.map(({ key, value }) => [key, value]));
  assert.equal(apiHeaders.get("Cache-Control"), "private, no-store");
  assert.equal(apiHeaders.get("X-Robots-Tag"), "noindex, nofollow");

  const robotsSource = read("apps/website/app/robots.ts");
  assert.match(robotsSource, /disallow:\s*["']\/api\/["']/);
});

test("layout exposes a keyboard skip link without nesting a second main landmark", () => {
  const layoutSource = read("apps/website/components/layout-shell.tsx");

  assert.match(layoutSource, /href="#main-content"/);
  assert.match(layoutSource, /className="skip-link"/);
  assert.match(layoutSource, /<div id="main-content" tabIndex=\{-1\}>/);
  assert.doesNotMatch(layoutSource, /<main[\s>]/);
  assert.match(layoutSource, /Skip to main content/);
  assert.match(layoutSource, /跳到主要内容/);
});

test("all public page surfaces retain one main landmark", () => {
  const mainSurfaces = [
    "apps/website/components/home/home-page-client.tsx",
    "apps/website/app/blog/blog-list-view.tsx",
    "apps/website/app/blog/[slug]/blog-detail-client.tsx",
    "apps/website/app/projects/projects-client.tsx",
    "apps/website/app/projects/[slug]/project-detail-client.tsx",
    "apps/website/app/labs/labs-client.tsx",
    "apps/website/app/labs/query/free-query-page.tsx",
    "apps/website/app/labs/tools/developer-tools-page.tsx",
    "apps/website/app/tracker/tracker-client.tsx",
    "apps/website/app/explore/explore-page.tsx",
    "apps/website/app/resume/resume-page.tsx",
    "apps/website/app/now/now-page.tsx",
    "apps/website/app/about/about-client.tsx",
    "apps/website/app/contact/contact-client.tsx",
    "apps/website/app/enter/enter-client.tsx",
    "apps/website/components/landing/ai-page-analysis-landing-client.tsx"
  ];

  for (const relPath of mainSurfaces) {
    const source = read(relPath);
    const mainOpenings = source.match(/<main[\s>]/g) ?? [];

    assert.equal(mainOpenings.length, 1, `${relPath} should render exactly one main landmark`);
  }
});

test("global styles expose the skip link and keyboard focus indicator", () => {
  const styles = read("apps/website/app/globals.css");

  assert.match(styles, /:where\([^)]*\[tabindex\][^)]*\):focus-visible/);
  assert.match(styles, /outline:\s*3px solid/);
  assert.match(styles, /\.skip-link\s*\{/);
  assert.match(styles, /\.skip-link:focus-visible\s*\{[\s\S]*?transform:\s*translateY\(0\)/);
  assert.match(styles, /#main-content:focus\s*\{[\s\S]*?outline:\s*none/);
});
