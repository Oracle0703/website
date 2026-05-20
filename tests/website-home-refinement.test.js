const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('home page receives featured projects and blog series from server data', () => {
  const homePageSource = read('apps/website/app/page.tsx');

  assert.match(homePageSource, /getFeaturedProjectViews\(defaultLocale\)/);
  assert.match(homePageSource, /getPublishedSeries/);
  assert.match(homePageSource, /featuredProjects/);
  assert.match(homePageSource, /featuredSeries/);
  assert.match(homePageSource, /<HomePageClient[\s\S]*featuredProjects=\{featuredProjects\}/);
  assert.match(homePageSource, /<HomePageClient[\s\S]*featuredSeries=\{featuredSeries\}/);
});

test('home client has content-project loop sections and typed props', () => {
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.match(clientSource, /type HomeProjectItem/);
  assert.match(clientSource, /type HomeSeriesItem/);
  assert.match(clientSource, /featuredProjects\?: HomeProjectItem\[\]/);
  assert.match(clientSource, /featuredSeries\?: HomeSeriesItem\[\]/);
  assert.match(clientSource, /currentFocusTitle/);
  assert.match(clientSource, /featuredProjectsTitle/);
  assert.match(clientSource, /featuredSeriesTitle/);
  assert.match(clientSource, /featuredSeriesSectionItems/);
  assert.match(clientSource, /latestBlogSectionItems/);
});

test('home i18n copy supports the refined information architecture', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');

  for (const key of [
    'ctaProjects',
    'currentFocusTitle',
    'featuredProjectsTitle',
    'featuredSeriesTitle',
    'latestFallbackTitle',
    'labsTrackerTitle',
    'contactTitle'
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }
});

test('English home copy names the actual product surfaces', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');

  assert.match(i18nSource, /AI tools/);
  assert.match(i18nSource, /content systems/);
  assert.match(i18nSource, /dashboards/);
  assert.match(i18nSource, /product prototypes/);
});

test('About and contact clients render refined information sections', () => {
  const aboutClient = read('apps/website/app/about/about-client.tsx');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');
  const i18nSource = read('apps/website/lib/i18n.ts');

  assert.match(aboutClient, /copy\.sections\.map/);
  assert.match(aboutClient, /copy\.principles\.map/);
  assert.match(contactClient, /copy\.collaborationAreas\.map/);
  assert.match(contactClient, /copy\.boundaries\.map/);
  assert.match(i18nSource, /collaborationAreas/);
  assert.match(i18nSource, /boundaries/);
  assert.match(i18nSource, /Small product delivery/);
});
