const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('static rendering spike documents root cause, options, and recommendation', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /# Website Static Rendering Spike/);
  assert.match(source, /cookies\(\)/);
  assert.match(source, /getLocale/);
  assert.match(source, /getTheme/);
  assert.match(source, /D1/);
  assert.match(source, /D2/);
  assert.match(source, /D3/);
  assert.match(source, /推荐路线/);
  assert.match(source, /D1\.5/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /hydration/i);
});

test('static rendering spike is referenced from the performance plan', () => {
  const source = read('docs/website/PERFORMANCE_SEO_PLAN.md');

  assert.match(source, /STATIC_RENDERING_SPIKE\.md/);
  assert.match(source, /M6\.6/);
  assert.match(source, /静态化方案/);
});

test('D2 acceptance report records scope, verification, risks, and next-stage options', () => {
  const source = read('docs/website/D2_ACCEPTANCE_REPORT.md');

  assert.match(source, /# Website D2 Acceptance Report/);
  assert.match(source, /2026-05-20/);
  assert.match(source, /PUBLIC_WEBSITE_ROUTES/);
  assert.match(source, /npm run verify:website-static/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /npm run validate:website-content/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /4321/);
  assert.match(source, /4323/);
  assert.match(source, /NEXT_STATIC_VERIFY_PORT/);
  assert.match(source, /WEBSITE_BROWSER_VERIFY_PORT/);
  assert.match(source, /剩余风险/);
  assert.match(source, /D3/);
  assert.match(source, /locale/i);
  assert.match(source, /hydration/i);
});

test('website release checklist turns D2 acceptance into an executable workflow', () => {
  const source = read('docs/website/RELEASE_CHECKLIST.md');
  const report = read('docs/website/D2_ACCEPTANCE_REPORT.md');

  assert.match(report, /RELEASE_CHECKLIST\.md/);
  assert.match(source, /# Website Release Checklist/);
  assert.match(source, /每次必跑/);
  assert.match(source, /条件必跑/);
  assert.match(source, /失败定位/);
  assert.match(source, /截图基线/);
  assert.match(source, /npm test/);
  assert.match(source, /npm run validate:website-content/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /npm run verify:website-static/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /NEXT_STATIC_VERIFY_BASE_URL/);
  assert.match(source, /NEXT_STATIC_VERIFY_PORT/);
  assert.match(source, /WEBSITE_BROWSER_VERIFY_PORT/);
  assert.match(source, /EADDRINUSE/);
  assert.match(source, /PUBLIC_WEBSITE_ROUTES/);
});

test('D3 locale routing design records asymmetric locale URLs and SEO boundaries', () => {
  const source = read('docs/website/D3_LOCALE_ROUTING_DESIGN.md');
  const report = read('docs/website/D2_ACCEPTANCE_REPORT.md');

  assert.match(report, /D3_LOCALE_ROUTING_DESIGN\.md/);
  assert.match(source, /# Website D3 Locale Routing Design/);
  assert.match(source, /2026-05-21/);
  assert.match(source, /\/en\/\*/);
  assert.match(source, /中文保留根路径/);
  assert.match(source, /URL 矩阵/);
  assert.match(source, /canonical/);
  assert.match(source, /hreflang/);
  assert.match(source, /sitemap/);
  assert.match(source, /PUBLIC_WEBSITE_ROUTES/);
  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /旧链接/);
  assert.match(source, /301/);
  assert.match(source, /localStorage/);
  assert.match(source, /LOCALE_COOKIE/);
  assert.match(source, /router\.refresh/);
  assert.match(source, /generateStaticParams/);
  assert.match(source, /verify:website-static/);
  assert.match(source, /verify:website-browser/);
  assert.match(source, /本阶段不做/);
});

test('D3 locale routing implementation plan breaks the design into executable tasks', () => {
  const source = read('docs/website/D3_LOCALE_ROUTING_IMPLEMENTATION_PLAN.md');

  assert.match(source, /# Website D3 Locale Routing Implementation Plan/);
  assert.match(source, /REQUIRED SUB-SKILL/);
  assert.match(source, /Goal:/);
  assert.match(source, /Architecture:/);
  assert.match(source, /Tech Stack:/);
  assert.match(source, /Task 1: Locale 路由工具/);
  assert.match(source, /Task 2: 英文静态入口/);
  assert.match(source, /Task 3: SEO 与 sitemap/);
  assert.match(source, /Task 4: 语言切换/);
  assert.match(source, /Task 5: 详情页 locale 路由/);
  assert.match(source, /Task 6: 验收脚本扩展/);
  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /getLocalePath/);
  assert.match(source, /getAlternateLocalePath/);
  assert.match(source, /hreflang/);
  assert.match(source, /generateStaticParams/);
  assert.match(source, /npm test/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /npm run verify:website-static/);
  assert.match(source, /npm run verify:website-browser/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D3 acceptance report records completed locale routing scope and verification evidence', () => {
  const source = read('docs/website/D3_ACCEPTANCE_REPORT.md');

  assert.match(source, /# Website D3 Locale Routing Acceptance Report/);
  assert.match(source, /2026-05-21/);
  assert.match(source, /6 个任务全部完成/);
  assert.match(source, /\/en\/\*/);
  assert.match(source, /PUBLIC_WEBSITE_LOCALE_ROUTES/);
  assert.match(source, /router\.push/);
  assert.match(source, /router\.refresh/);
  assert.match(source, /npm test/);
  assert.match(source, /78\/78/);
  assert.match(source, /npm run validate:website-content/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /57 个 static\/SSG 页面/);
  assert.match(source, /npm run verify:website-static/);
  assert.match(source, /18 个静态入口/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /46\/46/);
  assert.match(source, /不生成 `\/zh\/\*`/);
  assert.match(source, /D4_ENGLISH_CONTENT_REFINEMENT_PLAN\.md/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D4 English content refinement plan defines scope, content model, edge cases, and verification', () => {
  const source = read('docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md');

  assert.match(source, /# Website D4 English Content Refinement Plan/);
  assert.match(source, /\/en\/\*/);
  assert.match(source, /Projects locale-aware view/);
  assert.match(source, /Blog locale availability/);
  assert.match(source, /AI 页面分析助手英文客户端文案/);
  assert.match(source, /getProjectView/);
  assert.match(source, /availableLocales/);
  assert.match(source, /sitemap/);
  assert.match(source, /hreflang/);
  assert.match(source, /JSON-LD/);
  assert.match(source, /不新增 `\/zh\/\*`/);
  assert.match(source, /不自动机器翻译/);
  assert.match(source, /npm test/);
  assert.match(source, /npm run validate:website-content/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /npm run verify:website-static/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /git diff --check/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});
