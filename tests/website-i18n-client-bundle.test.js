const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("language provider keeps full bilingual messages out of the shared client layout", () => {
  const providerSource = read("apps/website/components/language-provider.tsx");
  const routingSource = read("apps/website/lib/locale-routing.ts");
  const coreSource = read("apps/website/lib/i18n-core.ts");

  assert.match(providerSource, /from "\.\.\/lib\/i18n-core"/);
  assert.doesNotMatch(providerSource, /from "\.\.\/lib\/i18n"|getMessages|messages:/);
  assert.match(routingSource, /from "\.\/i18n-core"/);
  assert.doesNotMatch(routingSource, /from "\.\/i18n"/);
  assert.doesNotMatch(coreSource, /heroTitle|contactForm|featuredProjectsTitle|defaultTitle/);
});

test("shared shell copy is deliberately limited to navigation, theme, and footer", () => {
  const shellSource = read("apps/website/lib/i18n-shell.ts");

  assert.match(shellSource, /nav:/);
  assert.match(shellSource, /theme:/);
  assert.match(shellSource, /footer:/);
  assert.doesNotMatch(shellSource, /home:|pages:|seo:|contactForm/);
});

test("page clients receive locale-specific copy through typed static props", () => {
  const clientFiles = [
    "apps/website/components/home/home-page-client.tsx",
    "apps/website/app/about/about-client.tsx",
    "apps/website/app/contact/contact-client.tsx",
    "apps/website/app/blog/blog-client.tsx",
    "apps/website/app/blog/[slug]/blog-detail-client.tsx",
    "apps/website/app/projects/projects-client.tsx",
    "apps/website/app/projects/[slug]/project-detail-client.tsx",
    "apps/website/app/labs/labs-client.tsx",
    "apps/website/app/labs/query/free-query-client.tsx",
    "apps/website/app/tracker/tracker-client.tsx"
  ];

  for (const clientFile of clientFiles) {
    const source = read(clientFile);
    assert.match(source, /import type \{[^}]*Messages[^}]*\} from ["'][^"']*\/i18n["']/s);
    assert.doesNotMatch(source, /getMessages\(|useI18n\(|import \{[^}]*getMessages/);
  }
});

test("both static locale trees inject their own copy without request-time locale reads", () => {
  const routePairs = [
    ["apps/website/app/page.tsx", "apps/website/app/en/page.tsx"],
    ["apps/website/app/about/page.tsx", "apps/website/app/en/about/page.tsx"],
    ["apps/website/app/contact/page.tsx", "apps/website/app/en/contact/page.tsx"],
    ["apps/website/app/blog/page.tsx", "apps/website/app/en/blog/page.tsx"],
    ["apps/website/app/projects/page.tsx", "apps/website/app/en/projects/page.tsx"],
    ["apps/website/app/labs/page.tsx", "apps/website/app/en/labs/page.tsx"],
    ["apps/website/app/labs/query/page.tsx", "apps/website/app/en/labs/query/page.tsx"],
    ["apps/website/app/tracker/page.tsx", "apps/website/app/en/tracker/page.tsx"]
  ];

  for (const [zhRoute, enRoute] of routePairs) {
    const zhSource = read(zhRoute);
    const enSource = read(enRoute);

    assert.match(zhSource, /getMessages\(defaultLocale\)/);
    assert.match(enSource, /getMessages\(locale\)/);
    assert.doesNotMatch(zhSource, /i18n-server|getLocale\(/);
    assert.doesNotMatch(enSource, /i18n-server|getLocale\(/);
  }
});
