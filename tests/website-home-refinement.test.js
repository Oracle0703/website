const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function count(source, token) {
  return source.split(token).length - 1;
}

function readNavHrefs(source, locale) {
  const localeStart = source.indexOf(`  ${locale}: {`);
  const navStart = source.indexOf('nav:', localeStart);
  const itemsStart = source.indexOf('items: [', navStart);
  const itemsEnd = source.indexOf(']', itemsStart);

  assert.notEqual(localeStart, -1, `${locale} messages should exist`);
  assert.notEqual(navStart, -1, `${locale} navigation should exist`);
  assert.notEqual(itemsStart, -1, `${locale} navigation items should exist`);
  assert.notEqual(itemsEnd, -1, `${locale} navigation items should close`);

  return Array.from(
    source.slice(itemsStart, itemsEnd).matchAll(/href:\s*"([^"]+)"/g),
    (match) => match[1]
  );
}

function tagBlockContaining(source, marker, tagName) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `${marker} should exist`);

  const start = source.lastIndexOf(`<${tagName}`, markerIndex);
  const end = source.indexOf(`</${tagName}>`, markerIndex);
  assert.notEqual(start, -1, `${marker} should be inside <${tagName}>`);
  assert.notEqual(end, -1, `${marker} should be inside a closed <${tagName}>`);

  return source.slice(start, end + tagName.length + 3);
}

test('home pages provide recent posts and asset-backed featured projects without series data', () => {
  for (const relPath of ['apps/website/app/page.tsx', 'apps/website/app/en/page.tsx']) {
    const source = read(relPath);

    assert.match(source, /getPublishedPosts(?:ForLocale)?/);
    assert.match(source, /getFeaturedProjectViews\(/);
    assert.match(source, /latestBlogItems=\{latestBlogItems\}/);
    assert.match(source, /featuredProjects=\{featuredProjects\}/);
    assert.match(source, /project\.asset\.kind === "screenshot"/);
    assert.match(source, /project\.asset\.kind === "mock"/);
    assert.match(source, /project\.asset\.kind === "diagram"/);
    assert.match(source, /src:\s*project\.asset\.src/);
    assert.match(source, /alt:\s*project\.asset\.alt/);
    assert.match(source, /caption:\s*project\.asset\.caption/);
    assert.doesNotMatch(source, /getPublishedSeries|featuredSeries/);
  }
});

test('home client has four focused sections and no ParticleTime or series dependency', () => {
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.equal(count(clientSource, '<section'), 1, 'home should have one semantic hero section');
  assert.equal(
    count(clientSource, '<RevealSection'),
    3,
    'home should add projects, latest writing, and contact sections'
  );
  assert.match(clientSource, /supportingProjects\.map/);
  assert.match(clientSource, /latestBlogSectionItems\.map/);
  assert.match(clientSource, /copy\.contactTitle/);
  assert.doesNotMatch(clientSource, /ParticleTime|particle-time/);
  assert.doesNotMatch(clientSource, /HomeSeriesItem|featuredSeries/);
});

test('home flagship uses the first project and renders its real asset with Next Image', () => {
  const clientSource = read('apps/website/components/home/home-page-client.tsx');

  assert.match(clientSource, /import Image from "next\/image"/);
  assert.match(clientSource, /type HomeProjectAsset/);
  assert.match(clientSource, /asset\?: HomeProjectAsset/);
  assert.match(clientSource, /const flagshipProject = featuredProjects\[0\]/);
  assert.match(clientSource, /const supportingProjects = featuredProjects\.slice\(1, 3\)/);
  assert.match(clientSource, /flagshipProject\.asset \? \(/);
  assert.match(clientSource, /<Image[\s\S]*src=\{flagshipProject\.asset\.src\}/);
  assert.match(clientSource, /<Image[\s\S]*alt=\{flagshipProject\.asset\.alt\}/);
});

test('home latest-writing links disable eager prefetch for the dense article list', () => {
  const clientSource = read('apps/website/components/home/home-page-client.tsx');
  const loopStart = clientSource.indexOf('latestBlogSectionItems.map');
  const loopEnd = clientSource.indexOf('</RevealSection>', loopStart);

  assert.notEqual(loopStart, -1);
  assert.notEqual(loopEnd, -1);
  const latestWritingBlock = clientSource.slice(loopStart, loopEnd);
  assert.match(latestWritingBlock, /<Link[\s\S]*prefetch=\{false\}/);
});

test('home i18n copy supports the four-section information architecture', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');

  for (const key of [
    'ctaProjects',
    'ctaContact',
    'ctaBlog',
    'heroEvidenceTitle',
    'heroEvidenceItems',
    'currentFocusTitle',
    'featuredProjectsTitle',
    'latestFallbackTitle',
    'latestBlog',
    'contactTitle',
    'contactAction'
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

test('header and footer consume the focused navigation without exposing secondary demos', () => {
  const headerSource = read('apps/website/components/site-header.tsx');
  const footerSource = read('apps/website/components/site-footer.tsx');
  const i18nSource = read('apps/website/lib/i18n-shell.ts');
  const expectedPrimaryHrefs = ['/projects', '/blog', '/about', '/contact'];

  for (const locale of ['zh', 'en']) {
    assert.deepEqual(
      readNavHrefs(i18nSource, locale),
      expectedPrimaryHrefs,
      `${locale} primary navigation should stay focused`
    );
  }

  assert.match(headerSource, /messages\.nav\.items\.map/);
  assert.match(footerSource, /messages\.nav\.items\.map/);
  assert.doesNotMatch(headerSource, /getHref\("\/enter"\)|messages\.nav\.enter/);
  assert.match(footerSource, /https:\/\/github\.com\/Oracle0703/);
});

test('About client retains its narrative sections and principles', () => {
  const aboutClient = read('apps/website/app/about/about-client.tsx');

  assert.match(aboutClient, /copy\.sections\.map/);
  assert.match(aboutClient, /copy\.principles\.map/);
});

test('shared UI tokens keep the action and evidence primitives', () => {
  const globalsSource = read('apps/website/app/globals.css');

  for (const className of ['btn-primary', 'btn-secondary', 'evidence-card', 'section-kicker']) {
    assert.match(globalsSource, new RegExp(`\\.${className}\\s*\\{`));
  }
});

test('contact uses a two-column intake layout with collapsible boundaries and privacy details', () => {
  const contactClient = read('apps/website/app/contact/contact-client.tsx');
  const asideIndex = contactClient.indexOf('<aside');
  const formIndex = contactClient.indexOf('<form');
  const layoutStart = contactClient.lastIndexOf('<div className="grid', asideIndex);
  const layoutTagEnd = contactClient.indexOf('>', layoutStart);

  assert.notEqual(asideIndex, -1, 'contact guidance should be in an aside');
  assert.notEqual(formIndex, -1, 'contact form should be present');
  assert.ok(asideIndex < formIndex, 'guidance should precede the form in source order');
  assert.notEqual(layoutStart, -1, 'aside and form should share a grid layout');
  assert.match(contactClient.slice(layoutStart, layoutTagEnd + 1), /lg:grid-cols-/);

  const boundaryDetails = tagBlockContaining(contactClient, 'copy.boundariesTitle', 'details');
  assert.match(boundaryDetails, /<summary/);
  assert.match(boundaryDetails, /copy\.boundaries\.map/);

  const privacyDetails = tagBlockContaining(
    contactClient,
    'copy.contactForm.privacyNotice',
    'details'
  );
  assert.match(privacyDetails, /<summary/);
  assert.match(privacyDetails, /copy\.contactForm\.retentionNotice/);
  assert.match(privacyDetails, /copy\.contactForm\.deletionNotice/);
});

test('contact exposes one verified GitHub fallback instead of a channel-card matrix', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');

  assert.doesNotMatch(i18nSource, /hello@example\.com|mailto:hello|example\.com/);
  assert.match(i18nSource, /https:\/\/github\.com\/Oracle0703/);
  assert.match(contactClient, /copy\.contactChannels\.find/);
  assert.match(contactClient, /href=\{githubChannel\.href\}/);
  assert.match(contactClient, /target="_blank"/);
  assert.match(contactClient, /rel="noopener noreferrer"/);
  assert.doesNotMatch(contactClient, /copy\.contactChannels\.map/);
});

test('contact page presents the live form without rollout jargon', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');

  assert.match(i18nSource, /contactPathEyebrow/);
  assert.match(i18nSource, /填写下方表单/);
  assert.match(i18nSource, /Use the form below/);
  assert.match(contactClient, /copy\.contactPathEyebrow/);
  assert.doesNotMatch(
    i18nSource,
    /contactDecisionTitle|contactDecisionStatus|contactDecisionDescription|formSpecTitle|formSpecAction/
  );
  assert.doesNotMatch(
    i18nSource,
    /D6|D7|联系闭环决策|表单规格|Contact-loop decision|form spec/
  );
  assert.doesNotMatch(contactClient, /contactDecision|formSpec/);
});

test('contact client keeps the real intake fields and privacy contract', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const contactClient = read('apps/website/app/contact/contact-client.tsx');

  assert.match(contactClient, /<form/);
  assert.match(contactClient, /onSubmit=\{handleSubmit\}/);
  for (const field of [
    'name',
    'contact',
    'project_goal',
    'timeline',
    'budget_range',
    'links',
    'honeypot'
  ]) {
    assert.match(contactClient, new RegExp(`name="${field}"`));
  }
  assert.match(contactClient, /copy\.contactForm\.privacyNotice/);
  assert.match(contactClient, /copy\.contactForm\.retentionNotice/);
  assert.match(contactClient, /copy\.contactForm\.deletionNotice/);
  assert.match(i18nSource, /submitIdle/);
  assert.match(i18nSource, /submitBusy/);
  assert.match(i18nSource, /successTitle/);
  assert.match(i18nSource, /received_with_notification_failure/);
});
