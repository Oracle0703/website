const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { readPng } = require('./png-utils');

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
  assert.ok(exists('apps/website/app/(zh)/projects/page.tsx'), 'projects list route should exist');
  assert.ok(
    exists('apps/website/app/(zh)/projects/[slug]/page.tsx'),
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
  const i18nSource = read('apps/website/lib/i18n-shell.ts');
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"作品"\s*\}/);
  assert.match(i18nSource, /\{\s*href:\s*"\/projects",\s*label:\s*"Work"\s*\}/);

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

test('project model carries maintainable evidence, architecture, decisions, and roadmap fields', () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.match(projectsSource, /export type ProjectEvidence/);
  assert.match(projectsSource, /export type ProjectArchitectureStep/);
  assert.match(projectsSource, /export type ProjectDecision/);
  assert.match(projectsSource, /export type ProjectEntry/);
  assert.match(projectsSource, /evidence:\s*ProjectEvidence\[\]/);
  assert.match(projectsSource, /architecture:\s*string/);
  assert.match(projectsSource, /architectureSteps:\s*ProjectArchitectureStep\[\]/);
  assert.match(projectsSource, /decisions:\s*ProjectDecision\[\]/);
  assert.match(projectsSource, /tradeoffs:\s*string\[\]/);
  assert.match(projectsSource, /roadmap:\s*string\[\]/);
  assert.match(projectsSource, /evidence:\s*project\.evidence/);
  assert.match(projectsSource, /architectureSteps:\s*project\.architectureSteps/);
  assert.match(projectsSource, /decisions:\s*project\.decisions/);
  assert.match(projectsSource, /entry:\s*project\.entry/);

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
    assert.match(block, /architectureSteps:\s*\[/, `${slug} should define architecture steps`);
    assert.match(block, /decisions:\s*\[/, `${slug} should define key decisions`);
    assert.match(block, /tradeoffs:\s*\[/, `${slug} should define tradeoffs`);
    assert.match(block, /roadmap:\s*\[/, `${slug} should define roadmap`);
    assert.match(block, /entry:\s*\{/, `${slug} should define demo and source entries`);
  }
});

test('D6 project model carries an explicit public asset strategy for every project', async () => {
  const projectsSource = read('apps/website/lib/projects.ts');

  assert.match(projectsSource, /export type ProjectAsset/);
  assert.match(projectsSource, /kind:\s*"screenshot"\s*\|\s*"mock"\s*\|\s*"diagram"/);
  assert.match(projectsSource, /kind:\s*"doc"/);
  assert.match(projectsSource, /kind:\s*"none"/);
  assert.match(projectsSource, /asset:\s*ProjectAsset/);
  assert.match(projectsSource, /gallery:\s*ProjectAsset\[\]/);
  assert.match(projectsSource, /asset:\s*project\.asset/);
  assert.match(projectsSource, /gallery:\s*project\.gallery/);

  const { getAllProjects } = await importFresh('apps/website/lib/projects.ts');
  const projects = getAllProjects();

  assert.equal(projects.length, 5);

  const assertAsset = (asset, label) => {
    if (['screenshot', 'mock', 'diagram'].includes(asset.kind)) {
      assert.ok(asset.src, `${label} image asset should define src`);
      assert.ok(asset.alt, `${label} image asset should define alt`);
      assert.ok(asset.caption, `${label} image asset should define caption`);
      assert.match(asset.src, /^\//, `${label} asset src should be a public path`);
      assert.doesNotMatch(asset.src, /^\/docs\//, `${label} should not link repository-only docs`);
      return;
    }

    if (asset.kind === 'doc') {
      assert.ok(asset.label, `${label} doc asset should define label`);
      assert.ok(asset.href, `${label} doc asset should define href`);
      assert.ok(asset.description, `${label} doc asset should define description`);
      assert.doesNotMatch(asset.href, /^\/docs\//, `${label} should not expose private docs paths`);
      return;
    }

    assert.equal(asset.kind, 'none', `${label} should use a known asset kind`);
    assert.ok(asset.reason, `${label} none asset should explain why it is unavailable`);
    assert.ok(asset.nextAssetStep, `${label} none asset should define the next asset step`);
  };

  for (const project of projects) {
    assert.ok(project.asset, `${project.slug} should define an asset strategy`);
    assert.ok(Array.isArray(project.gallery), `${project.slug} should define an evidence gallery`);
    assert.ok(project.gallery.length > 0, `${project.slug} should expose at least one additional evidence item`);
    [project.asset, ...project.gallery].forEach((asset, index) => {
      assertAsset(asset, `${project.slug} asset ${index + 1}`);
    });

    assert.ok(project.architectureSteps.length >= 4, `${project.slug} should define a useful architecture flow`);
    for (const step of project.architectureSteps) {
      assert.ok(step.title, `${project.slug} architecture step should have a title`);
      assert.ok(step.description, `${project.slug} architecture step should have a description`);
    }

    assert.ok(project.decisions.length >= 3, `${project.slug} should define structured decisions`);
    for (const decision of project.decisions) {
      assert.ok(decision.decision, `${project.slug} decision should name the choice`);
      assert.ok(decision.rationale, `${project.slug} decision should explain its rationale`);
      assert.ok(decision.impact, `${project.slug} decision should state its impact`);
    }

    assert.match(project.entry.source.href, /^https:\/\/github\.com\/Oracle0703\/website\//);
    if (project.entry.demo.status === 'available') {
      assert.ok(project.entry.demo.href, `${project.slug} available demo should define href`);
    } else {
      assert.ok(project.entry.demo.reason, `${project.slug} unavailable demo should explain why`);
    }
  }
});

test('all five primary project assets are public, visual, and repository-backed', async () => {
  const { getAllProjects, getProjectView } = await importFresh('apps/website/lib/projects.ts');
  const projects = getAllProjects();

  assert.equal(projects.length, 5);

  for (const project of projects) {
    for (const [locale, asset] of [
      ['zh', project.asset],
      ['en', getProjectView(project, 'en').asset]
    ]) {
      assert.ok(
        ['screenshot', 'mock', 'diagram'].includes(asset.kind),
        `${project.slug} ${locale} primary asset should be visual`
      );
      assert.match(asset.src, /^\/projects\//, `${project.slug} ${locale} should use a project asset path`);
      assert.ok(
        exists(path.join('apps/website/public', asset.src.slice(1))),
        `${project.slug} ${locale} primary asset should exist in public/projects`
      );
    }
  }
});

test('Timestamp Tool publishes the reviewed browser capture and a 16:9 article cover', async () => {
  const screenshotPath = 'apps/website/public/projects/timestamp-tool-screenshot.png';
  const coverPath = 'apps/website/public/blog/timestamp-tool-evidence-cover.png';
  const screenshotMetadata = readPng(path.join(root, screenshotPath));
  const coverMetadata = readPng(path.join(root, coverPath));
  const article = read('content/blog/2026-02-11-timestamp-tool-retrospective-timezone-precision-ux.mdx');
  const { getAllProjects, getProjectView } = await importFresh('apps/website/lib/projects.ts');
  const project = getAllProjects().find(({ slug }) => slug === 'timestamp-tool');

  assert.ok(project, 'Timestamp Tool project should exist');
  assert.equal(project.asset.kind, 'screenshot');
  assert.equal(project.asset.src, '/projects/timestamp-tool-screenshot.png');
  assert.equal(getProjectView(project, 'en').asset.kind, 'screenshot');
  assert.equal(screenshotMetadata.format, 'png');
  assert.equal(screenshotMetadata.width, 1104);
  assert.equal(screenshotMetadata.height, 429);
  assert.ok(fs.statSync(path.join(root, screenshotPath)).size < 100_000);

  assert.equal(coverMetadata.format, 'png');
  assert.equal(coverMetadata.width, 1200);
  assert.equal(coverMetadata.height, 675);
  assert.match(article, /src: "\/blog\/timestamp-tool-evidence-cover\.png"/);
  assert.match(article, /width: 1200\s+height: 675/);
});

test('Knock and Dashboard publish accessible, privacy-safe current architecture diagrams', async () => {
  const diagrams = [
    {
      slug: 'knock',
      relPath: 'apps/website/public/projects/knock-architecture.svg',
      sourcePath: '/projects/knock-architecture.svg',
      implementedSignals: [/Incremental reader/, /SQLite WAL/, /Express API/, /Basic Auth when exposed/],
      roadmapSignals: [/ROADMAP · NOT IMPLEMENTED HERE/, /Dashboard summaries/, /alert signals/]
    },
    {
      slug: 'dashboard-console',
      relPath: 'apps/website/public/projects/dashboard-console-architecture.svg',
      sourcePath: '/projects/dashboard-console-architecture.svg',
      implementedSignals: [/bearer JWT/, /INGEST_TOKEN/, /OSS JSON objects/, /If-Match → 409/, /idempotency key/],
      roadmapSignals: [/ROADMAP · NOT IMPLEMENTED/, /Content editing/, /Deployment records/, /Knock summaries/]
    }
  ];

  const { getAllProjects, getProjectView } = await importFresh('apps/website/lib/projects.ts');
  const projectsBySlug = new Map(getAllProjects().map((project) => [project.slug, project]));

  for (const diagram of diagrams) {
    assert.ok(exists(diagram.relPath), `${diagram.slug} diagram should exist`);
    const source = read(diagram.relPath);

    assert.match(source, /<svg\b[^>]*\brole="img"/);
    const labelledBy = source.match(/<svg\b[^>]*\baria-labelledby="([^"]+)"/)?.[1];
    assert.ok(labelledBy, `${diagram.slug} diagram should connect its accessible name and description`);
    const labelledIds = labelledBy.split(/\s+/);
    assert.equal(labelledIds.length, 2, `${diagram.slug} diagram should reference title and desc ids`);
    assert.match(source, new RegExp(`<title id="${labelledIds[0]}">[^<]+<\\/title>`));
    assert.match(source, new RegExp(`<desc id="${labelledIds[1]}">[^<]{80,}<\\/desc>`));

    for (const signal of [...diagram.implementedSignals, ...diagram.roadmapSignals]) {
      assert.match(source, signal, `${diagram.slug} diagram should keep current and roadmap claims explicit`);
    }

    assert.doesNotMatch(source, /<script\b|<foreignObject\b/i);
    assert.doesNotMatch(source, /(?:href|src)=["']https?:/i);
    assert.doesNotMatch(source, /meaningful\.ink|localhost|(?:\d{1,3}\.){3}\d{1,3}|[A-Za-z]:\\/i);
    assert.doesNotMatch(source, /(?:password|secret|access[_-]?key)\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY/i);
    assert.doesNotMatch(source, /KNOCK_LOG_PATH\s*=|DASHBOARD_OSS_BUCKET\s*=/);

    const project = projectsBySlug.get(diagram.slug);
    assert.ok(project, `${diagram.slug} project should exist`);
    assert.equal(project.asset.kind, 'diagram');
    assert.equal(project.asset.src, diagram.sourcePath);
    assert.match(project.asset.caption, /当前已实现|roadmap/i);

    const englishView = getProjectView(project, 'en');
    assert.equal(englishView.asset.kind, 'diagram');
    assert.equal(englishView.asset.src, diagram.sourcePath);
    assert.match(englishView.asset.caption, /implemented/);
    assert.match(englishView.asset.caption, /roadmap/);
  }
});

test('AI project evidence matches the implemented safe capture and Safe Mock boundary', () => {
  const projectsSource = read('apps/website/lib/projects.ts');
  const mockSource = read('apps/website/public/projects/ai-page-analysis-product-mock.svg');
  const aiStart = projectsSource.indexOf('slug: "ai-page-analysis"');
  const trackerStart = projectsSource.indexOf('slug: "tracker"');
  const aiBlock = projectsSource.slice(aiStart, trackerStart);

  assert.match(aiBlock, /安全 URL 抓取|安全抓取/);
  assert.match(aiBlock, /Safe Mock/);
  assert.doesNotMatch(aiBlock, /后续 V1 会把抓取/);
  assert.match(mockSource, /URL capture is opt-in; Safe Mock output/);
  assert.match(mockSource, /no live model integration/);
  assert.doesNotMatch(mockSource, /live crawling and model integration are not enabled/);
});

test('projects list uses a flagship hierarchy, real assets, and a compact archive', () => {
  const clientSource = read('apps/website/app/projects/projects-client.tsx');

  assert.match(clientSource, /\[flagshipProject,\s*\.\.\.supportingFeaturedProjects\]/);
  assert.match(clientSource, /function FlagshipProject\(/);
  assert.match(clientSource, /function SupportingFeaturedProject\(/);
  assert.match(clientSource, /function ArchiveProjectRow\(/);
  assert.match(clientSource, /asset\.kind === "none"/);
  assert.match(clientSource, /asset\.kind === "doc"/);
  assert.match(clientSource, /src=\{asset\.src\}/);
  assert.match(clientSource, /alt=\{asset\.alt\}/);
  assert.match(clientSource, /\{asset\.caption\}/);
  assert.match(clientSource, /project\.evidence\[0\]/);
  assert.match(clientSource, /project\.stack\.slice\(0,\s*3\)/);
  assert.match(clientSource, /project\.updatedAt/);
  assert.match(clientSource, /copy\.updatedAtLabel/);
  assert.match(clientSource, /prefetch=\{false\}/);
  assert.match(clientSource, /divide-y divide-edge\/70 border-y/);
  assert.doesNotMatch(clientSource, /project\.evidence\.slice\(0,\s*2\)/);
});
