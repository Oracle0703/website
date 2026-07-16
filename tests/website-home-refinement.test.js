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
    'ctaContact',
    'heroEvidenceTitle',
    'heroEvidenceItems',
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
  assert.match(contactClient, /copy\.contactPathTitle/);
  assert.match(contactClient, /copy\.contactChannels\.map/);
  assert.match(i18nSource, /collaborationAreas/);
  assert.match(i18nSource, /boundaries/);
  assert.match(i18nSource, /contactPathTitle/);
  assert.match(i18nSource, /contactChannels/);
  assert.match(i18nSource, /Small product delivery/);
});

test('D5 UI tokens define shared actions and evidence cards', () => {
  const globalsSource = read('apps/website/app/globals.css');

  for (const className of ['btn-primary', 'btn-secondary', 'evidence-card', 'section-kicker']) {
    assert.match(globalsSource, new RegExp(`\\.${className}\\s*\\{`));
  }
});

test('home client renders D5 hero evidence without replacing server data loops', () => {
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.match(clientSource, /copy\.heroEvidenceTitle/);
  assert.match(clientSource, /copy\.heroEvidenceItems\.map/);
  assert.match(clientSource, /evidence-card/);
  assert.match(clientSource, /featuredProjects\.map/);
  assert.match(clientSource, /featuredSeriesSectionItems/);
});

test('contact copy avoids placeholder contact channels and exposes a clear contact strategy', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');

  assert.doesNotMatch(i18nSource, /hello@example\.com|mailto:hello|example\.com/);
  assert.match(i18nSource, /contactPathDescription/);
  assert.match(i18nSource, /responseExpectation/);
  assert.match(contactClient, /href=\{channel\.href\.startsWith\("http"\)/);
});

test('D6 contact copy exposes the contact-loop decision and D7 form specification path', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');
  const formSpec = read('docs/website/D7_CONTACT_FORM_SPEC.md');

  for (const key of [
    'contactDecisionTitle',
    'contactDecisionStatus',
    'contactDecisionDescription',
    'formSpecTitle',
    'formSpecAction'
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
    assert.match(contactClient, new RegExp(`copy\\.${key}`));
  }

  assert.doesNotMatch(i18nSource, /hello@example\.com|mailto:hello|example\.com/);
  assert.match(formSpec, /honeypot/);
  assert.match(formSpec, /rate limit/i);
  assert.match(formSpec, /minimum input quality/i);
  assert.match(formSpec, /privacy/i);
  assert.match(formSpec, /retention/i);
  assert.match(formSpec, /deletion/i);
  assert.match(formSpec, /submit failure/i);
  assert.match(formSpec, /duplicate submit/i);
  assert.match(formSpec, /notification failure/i);
  assert.match(formSpec, /D6 不实现|D6 does not implement/i);
});

test('D7 contact client renders a real intake form without placeholder channels', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');

  assert.match(contactClient, /<form/);
  assert.match(contactClient, /onSubmit=\{handleSubmit\}/);
  assert.match(contactClient, /name="name"/);
  assert.match(contactClient, /name="contact"/);
  assert.match(contactClient, /name="project_goal"/);
  assert.match(contactClient, /name="timeline"/);
  assert.match(contactClient, /name="budget_range"/);
  assert.match(contactClient, /name="links"/);
  assert.match(contactClient, /name="honeypot"/);
  assert.match(contactClient, /copy\.contactForm\.privacyNotice/);
  assert.match(contactClient, /copy\.contactForm\.retentionNotice/);
  assert.match(contactClient, /copy\.contactForm\.deletionNotice/);
  assert.match(i18nSource, /submitIdle/);
  assert.match(i18nSource, /submitBusy/);
  assert.match(i18nSource, /successTitle/);
  assert.match(i18nSource, /received_with_notification_failure/);
  assert.doesNotMatch(i18nSource, /hello@example\.com|mailto:hello|example\.com/);
});
