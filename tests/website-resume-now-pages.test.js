const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

const routes = [
  {
    route: '/resume',
    page: 'apps/website/app/(zh)/resume/page.tsx',
    component: 'ResumePage',
    locale: 'defaultLocale'
  },
  {
    route: '/en/resume',
    page: 'apps/website/app/en/resume/page.tsx',
    component: 'ResumePage',
    locale: 'locale'
  },
  {
    route: '/now',
    page: 'apps/website/app/(zh)/now/page.tsx',
    component: 'NowPage',
    locale: 'defaultLocale'
  },
  {
    route: '/en/now',
    page: 'apps/website/app/en/now/page.tsx',
    component: 'NowPage',
    locale: 'locale'
  }
];

test('resume and now expose bilingual static entry pages with locale-aware metadata', () => {
  for (const entry of routes) {
    const source = read(entry.page);

    assert.match(source, /export const generateMetadata/);
    assert.match(source, new RegExp(`getLanguageAlternates\\("${entry.route}"\\)`));
    assert.match(source, new RegExp(`<${entry.component} locale=\\{${entry.locale}\\} \\/>`));
    assert.doesNotMatch(source, /"use client"|cookies\(|headers\(|fetch\(|dynamic\s*=|revalidate\s*=/);
  }

  assert.match(
    read('apps/website/app/en/resume/page.tsx'),
    /canonical:\s*toAbsoluteUrl\("\/en\/resume"\)/
  );
  assert.match(
    read('apps/website/app/en/now/page.tsx'),
    /canonical:\s*toAbsoluteUrl\("\/en\/now"\)/
  );
});

test('capability resume is evidence-based and offers native browser printing', () => {
  const source = read('apps/website/app/resume/resume-page.tsx');
  const buttonSource = read('apps/website/app/resume/print-resume-button.tsx');
  const dataSource = read('apps/website/lib/resume-now.ts');

  assert.match(source, /getProjectViews\(locale\)/);
  assert.match(source, /resumeProjectSlugs/);
  assert.match(source, /project\.evidence\[0\]/);
  assert.match(source, /\/projects\/\$\{encodeURIComponent\(project\.slug\)\}/);
  assert.match(source, /href=\{siteIdentity\.githubUrl\}/);
  assert.match(source, /@media print/);
  assert.match(source, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(source, /<style>\{/);
  assert.match(source, /@page \{ size: A4/);
  assert.match(source, /meaningful\.ink\/contact/);
  assert.match(source, /github\.com\/Oracle0703/);
  assert.match(source, /resume-print-contact \{ display: block !important; \}/);
  assert.match(buttonSource, /"use client"/);
  assert.match(buttonSource, /window\.print\(\)/);
  assert.match(dataSource, /不推断任职公司、教育经历、从业年限、客户或商业成绩/);
  assert.match(dataSource, /does not infer employers, education, years of experience, clients, or commercial results/);
});

test('now page is a dated manual snapshot with the four promised sections', () => {
  const source = read('apps/website/app/now/now-page.tsx');
  const dataSource = read('apps/website/lib/resume-now.ts');

  assert.match(dataSource, /profileUpdatedAt = "2026-07-16"/);
  assert.match(source, /dateTime=\{profileUpdatedAt\}/);
  assert.match(source, /copy\.currentTitle/);
  assert.match(source, /copy\.shippedTitle/);
  assert.match(source, /copy\.learningTitle/);
  assert.match(source, /copy\.nextTitle/);
  assert.match(dataSource, /人工维护的阶段快照，不是实时活动记录/);
  assert.match(dataSource, /manually maintained snapshot, not a real-time activity feed/);
  assert.doesNotMatch(source, /"use client"|fetch\(|window\.|document\.|localStorage/);
});
