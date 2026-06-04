const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

test('website projects system has the planned files and first project set', () => {
  assert.ok(exists('apps/website/lib/projects.ts'), 'projects data model should exist');
  assert.ok(exists('apps/website/app/projects/page.tsx'), 'projects list route should exist');
  assert.ok(
    exists('apps/website/app/projects/[slug]/page.tsx'),
    'project detail route should exist'
  );

  const projectsSource = read('apps/website/lib/projects.ts');
  for (const slug of [
    'ai-page-analysis',
    'tracker',
    'knock',
    'dashboard-console',
    'timestamp-tool'
  ]) {
    assert.match(projectsSource, new RegExp(`slug:\\s*"${slug}"`));
  }

  assert.match(projectsSource, /export function getAllProjects\(/);
  assert.match(projectsSource, /export function getFeaturedProjects\(/);
  assert.match(projectsSource, /export function getProjectBySlug\(/);
});

test('website projects routes are discoverable from navigation and sitemap', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"作品"\s*\}/);
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"Projects"\s*\}/);

  const sitemapSource = read('apps/website/app/sitemap.ts');
  const publicRoutesSource = read('apps/website/lib/public-routes.mjs');
  assert.match(publicRoutesSource, /"\/projects"/);
  assert.match(sitemapSource, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(sitemapSource, /getAllProjects/);
  assert.match(sitemapSource, /\/projects\/\$\{encodeURIComponent\(project\.slug\)\}/);
});

test('website project links do not point at repository-only docs paths', () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.doesNotMatch(
    projectsSource,
    /href:\s*"\/docs\//,
    'project links should only point to public website routes or external URLs'
  );
});

test('D5 project model carries maintainable evidence, tradeoffs, and roadmap fields', () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.match(projectsSource, /export type ProjectEvidence/);
  assert.match(projectsSource, /evidence:\s*ProjectEvidence\[\]/);
  assert.match(projectsSource, /architecture:\s*string/);
  assert.match(projectsSource, /tradeoffs:\s*string\[\]/);
  assert.match(projectsSource, /roadmap:\s*string\[\]/);
  assert.match(projectsSource, /evidence:\s*project\.evidence/);

  for (const slug of [
    'ai-page-analysis',
    'tracker',
    'knock',
    'dashboard-console',
    'timestamp-tool'
  ]) {
    const start = projectsSource.indexOf(`slug: "${slug}"`);
    assert.notEqual(start, -1, `${slug} should exist`);
    const nextProject = projectsSource.indexOf('\n  {', start + 1);
    const block = projectsSource.slice(start, nextProject === -1 ? projectsSource.length : nextProject);

    assert.match(block, /evidence:\s*\[/, `${slug} should define evidence`);
    assert.match(block, /architecture:/, `${slug} should define architecture`);
    assert.match(block, /tradeoffs:\s*\[/, `${slug} should define tradeoffs`);
    assert.match(block, /roadmap:\s*\[/, `${slug} should define roadmap`);
  }
});

test('D6 project model carries an explicit public asset strategy for every project', async () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.match(projectsSource, /export type ProjectAsset/);
  assert.match(projectsSource, /kind:\s*"screenshot"\s*\|\s*"mock"\s*\|\s*"diagram"/);
  assert.match(projectsSource, /kind:\s*"doc"/);
  assert.match(projectsSource, /kind:\s*"none"/);
  assert.match(projectsSource, /asset:\s*ProjectAsset/);
  assert.match(projectsSource, /asset:\s*project\.asset/);

  const { getAllProjects } = await importFresh('apps/website/lib/projects.ts');
  const projects = getAllProjects();

  assert.equal(projects.length, 5);

  for (const project of projects) {
    assert.ok(project.asset, `${project.slug} should define an asset strategy`);

    if (['screenshot', 'mock', 'diagram'].includes(project.asset.kind)) {
      assert.ok(project.asset.src, `${project.slug} image asset should define src`);
      assert.ok(project.asset.alt, `${project.slug} image asset should define alt`);
      assert.ok(project.asset.caption, `${project.slug} image asset should define caption`);
      assert.match(project.asset.src, /^\//, `${project.slug} asset src should be a public path`);
      assert.doesNotMatch(project.asset.src, /^\/docs\//, `${project.slug} should not link repository-only docs`);
      continue;
    }

    if (project.asset.kind === 'doc') {
      assert.ok(project.asset.label, `${project.slug} doc asset should define label`);
      assert.ok(project.asset.href, `${project.slug} doc asset should define href`);
      assert.ok(project.asset.description, `${project.slug} doc asset should define description`);
      assert.doesNotMatch(project.asset.href, /^\/docs\//, `${project.slug} should not expose private docs paths`);
      continue;
    }

    assert.equal(project.asset.kind, 'none', `${project.slug} should use a known asset kind`);
    assert.ok(project.asset.reason, `${project.slug} none asset should explain why it is unavailable`);
    assert.ok(project.asset.nextAssetStep, `${project.slug} none asset should define the next asset step`);
  }
});

test('P3B project model carries complete case study structure with redacted proof boundaries', async () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.match(projectsSource, /export type ProjectCaseStudy/);
  assert.match(projectsSource, /caseStudy:\s*ProjectCaseStudy/);
  assert.match(projectsSource, /caseStudy:\s*project\.caseStudy/);

  const { getAllProjects, getProjectView } = await importFresh('apps/website/lib/projects.ts');
  const projects = getAllProjects();

  assert.equal(projects.length, 5);

  for (const project of projects) {
    assert.ok(project.caseStudy, `${project.slug} should define a case study`);
    assert.equal(typeof project.caseStudy.problem, 'string', `${project.slug} should define a case study problem`);
    assert.ok(
      project.caseStudy.problem.trim().length >= 24,
      `${project.slug} case study problem should be specific`
    );

    for (const field of ['constraints', 'decisions', 'implementation', 'result', 'next']) {
      assert.ok(Array.isArray(project.caseStudy[field]), `${project.slug} ${field} should be a list`);
      assert.ok(project.caseStudy[field].length >= 2, `${project.slug} ${field} should include at least two items`);

      for (const item of project.caseStudy[field]) {
        assert.equal(typeof item, 'string', `${project.slug} ${field} item should be text`);
        assert.ok(item.trim().length >= 12, `${project.slug} ${field} item should be meaningful`);
      }
    }

    const zhView = getProjectView(project, 'zh');
    assert.equal(zhView.caseStudy, project.caseStudy, `${project.slug} zh view should expose the project case study`);
  }

  for (const slug of ['knock', 'dashboard-console']) {
    const project = projects.find((item) => item.slug === slug);
    assert.ok(project, `${slug} should exist`);

    const publicText = JSON.stringify(project.caseStudy);
    assert.doesNotMatch(publicText, /\b(?:\d{1,3}\.){3}\d{1,3}\b/, `${slug} should not expose raw IP addresses`);
    assert.doesNotMatch(publicText, /[A-Z]:\\\\/i, `${slug} should not expose Windows paths`);
    assert.doesNotMatch(publicText, /\/var\/log/i, `${slug} should not expose server log paths`);
    assert.doesNotMatch(publicText, /oss:\/\//i, `${slug} should not expose OSS object paths`);
    assert.doesNotMatch(publicText, /CONTACT_SUBMISSIONS_DIR|SECRET|TOKEN|PASSWORD/i, `${slug} should not expose private config keys`);
  }
});

test('projects list exposes summary-level evidence without turning cards into detail pages', () => {
  const clientSource = read('apps/website/app/projects/projects-client.tsx');

  assert.match(clientSource, /project\.evidence\.slice\(0,\s*2\)/);
  assert.match(clientSource, /project\.stack\.slice\(0,\s*3\)/);
  assert.match(clientSource, /project\.updatedAt/);
  assert.match(clientSource, /copy\.updatedAtLabel/);
});
