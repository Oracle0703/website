const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('public identity has one reusable source for person, brand, GitHub, and positioning', () => {
  const source = read('apps/website/lib/site-identity.ts');

  assert.match(source, /personName: "Yuri"/);
  assert.match(source, /brandName: "Meaningful · Ink"/);
  assert.match(source, /githubHandle: "@Oracle0703"/);
  assert.match(source, /githubUrl: "https:\/\/github\.com\/Oracle0703"/);
  assert.match(source, /flagshipProjectPath: "\/projects\/ai-page-analysis"/);
  assert.match(source, /为小团队和独立产品构建 AI 原型、内容系统与轻量工程工具/);
  assert.match(source, /I build AI prototypes, content systems, and lightweight engineering tools/);
});

test('home and blog structured data identify Yuri as the person instead of the brand', () => {
  const identitySource = read('apps/website/lib/site-identity.ts');

  assert.match(identitySource, /export function getPersonStructuredData/);
  assert.match(identitySource, /name: identity\.personName/);
  assert.match(identitySource, /alternateName: identity\.githubHandle/);
  assert.match(identitySource, /sameAs: \[identity\.githubUrl\]/);

  for (const relPath of ['apps/website/app/(zh)/page.tsx', 'apps/website/app/en/page.tsx']) {
    const source = read(relPath);
    assert.match(source, /getPersonStructuredData\(/);
    assert.doesNotMatch(source, /"@type": "Person",\s*name: seo\.siteName/s);
  }

  for (const relPath of [
    'apps/website/app/(zh)/blog/[slug]/page.tsx',
    'apps/website/app/en/blog/[slug]/page.tsx'
  ]) {
    assert.match(read(relPath), /author: getAuthorStructuredData\(/);
  }
});

test('identity-aware copy stays aligned across shell, home, about, contact, and resume', () => {
  const i18nSource = read('apps/website/lib/i18n.ts');
  const shellSource = read('apps/website/lib/i18n-shell.ts');
  const resumeCopy = read('apps/website/lib/resume-now.ts');
  const resumePage = read('apps/website/app/resume/resume-page.tsx');

  assert.match(i18nSource, /heroEyebrow: `\$\{siteIdentity\.personName\}/);
  assert.match(i18nSource, /ctaProjects: "查看旗舰案例"/);
  assert.match(i18nSource, /ctaProjects: "View flagship case"/);
  assert.match(i18nSource, /title: `关于 \$\{siteIdentity\.personName\}`/);
  assert.match(i18nSource, /title: `Contact \$\{siteIdentity\.personName\}`/);
  assert.match(shellSource, /brand: siteIdentity\.brandName/);
  assert.match(resumeCopy, /role: siteIdentity\.byLocale\.zh\.role/);
  assert.match(resumeCopy, /role: siteIdentity\.byLocale\.en\.role/);
  assert.match(resumePage, /siteIdentity\.personName/);
  assert.match(resumePage, /href=\{siteIdentity\.githubUrl\}/);
});
