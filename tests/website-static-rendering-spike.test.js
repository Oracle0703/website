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

test('D4 acceptance report records completed English content scope and verification evidence', () => {
  const source = read('docs/website/D4_ACCEPTANCE_REPORT.md');
  const checklist = read('docs/website/RELEASE_CHECKLIST.md');

  assert.match(source, /# Website D4 English Content Acceptance Report/);
  assert.match(source, /2026-05-21/);
  assert.match(source, /6 个任务全部完成/);
  assert.match(source, /\/en\/projects\/\[slug\]/);
  assert.match(source, /ProjectView/);
  assert.match(source, /BlogView/);
  assert.match(source, /localized-source/);
  assert.match(source, /route-surface/);
  assert.match(source, /npm run audit:website-english-content/);
  assert.match(source, /npm test/);
  assert.match(source, /91\/91/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /48 个 static\/SSG 页面/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /56\/56/);
  assert.match(source, /D5/);
  assert.match(checklist, /D4_ACCEPTANCE_REPORT\.md/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D5 visual conversion refinement plan defines scope, tasks, boundaries, and verification', () => {
  const source = read('docs/website/D5_VISUAL_CONVERSION_REFINEMENT_PLAN.md');
  const d4Report = read('docs/website/D4_ACCEPTANCE_REPORT.md');

  assert.match(d4Report, /D5 建议优先做/);
  assert.match(source, /# Website D5 Visual and Conversion Refinement Plan/);
  assert.match(source, /视觉系统精修/);
  assert.match(source, /内容证据/);
  assert.match(source, /联系转化/);
  assert.match(source, /产品页成熟度/);
  assert.match(source, /移动端首屏/);
  assert.match(source, /Task 1: 视觉基线与设计 token 审计/);
  assert.match(source, /Task 2: 首页首屏与证据链精修/);
  assert.match(source, /Task 3: Projects 和 Blog 证据密度增强/);
  assert.match(source, /Task 4: Contact 转化路径/);
  assert.match(source, /Task 5: AI 页面分析助手产品页质感/);
  assert.match(source, /Task 6: 浏览器截图与发布验收/);
  assert.match(source, /npm test/);
  assert.match(source, /npm run build:website/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /不引入 CMS/);
  assert.match(source, /不改 D3 URL 结构/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D5 acceptance report records completed visual conversion scope and verification evidence', () => {
  const source = read('docs/website/D5_ACCEPTANCE_REPORT.md');
  const checklist = read('docs/website/RELEASE_CHECKLIST.md');

  assert.match(source, /# Website D5 Visual and Conversion Acceptance Report/);
  assert.match(source, /2026-05-21/);
  assert.match(source, /6 个任务全部完成/);
  assert.match(source, /btn-primary/);
  assert.match(source, /ProjectView/);
  assert.match(source, /evidence/);
  assert.match(source, /Contact/);
  assert.match(source, /Mock Pipeline limitation/);
  assert.match(source, /V1 roadmap/);
  assert.match(source, /npm test/);
  assert.match(source, /101\/101/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /62\/62/);
  assert.match(source, /4 张截图基线/);
  assert.match(source, /D6/);
  assert.match(checklist, /D5_ACCEPTANCE_REPORT\.md/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D6 trust assets and contact loop plan defines scope, risks, and verification', () => {
  const source = read('docs/website/D6_TRUST_ASSETS_AND_CONTACT_LOOP_PLAN.md');
  const d5Report = read('docs/website/D5_ACCEPTANCE_REPORT.md');

  assert.match(d5Report, /D6 建议优先补真实可验证资产/);
  assert.match(source, /# Website D6 Trust Assets and Contact Loop Plan/);
  assert.match(source, /真实可验证资产/);
  assert.match(source, /联系闭环/);
  assert.match(source, /项目截图/);
  assert.match(source, /反垃圾/);
  assert.match(source, /隐私边界/);
  assert.match(source, /不引入 CMS/);
  assert.match(source, /不改 D3 URL 结构/);
  assert.match(source, /Task 1: 资产策略与数据模型/);
  assert.match(source, /Task 2: 项目截图与 mock 策略/);
  assert.match(source, /Task 3: Contact 联系闭环决策/);
  assert.match(source, /Task 4: AI V1 后端前置规格/);
  assert.match(source, /Task 5: 验收与发布护栏/);
  assert.match(source, /npm test/);
  assert.match(source, /npm run verify:website-browser/);
  assert.match(source, /git diff --check/);
  assert.doesNotMatch(source, /TBD|TODO|implement later|fill in details/);
});

test('D6 acceptance guardrails document contact form and AI backend prerequisites', () => {
  const d6Plan = read('docs/website/D6_TRUST_ASSETS_AND_CONTACT_LOOP_PLAN.md');
  const contactSpec = read('docs/website/D7_CONTACT_FORM_SPEC.md');
  const aiTechSpec = read('docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md');
  const checklist = read('docs/website/RELEASE_CHECKLIST.md');

  assert.match(d6Plan, /D7_CONTACT_FORM_SPEC\.md/);
  assert.match(d6Plan, /AI_PAGE_ANALYSIS_V1_TECH_SPEC\.md/);

  for (const expected of [
    /honeypot/,
    /rate limit/i,
    /minimum input quality/i,
    /privacy/i,
    /retention/i,
    /deletion/i,
    /submit failure/i,
    /duplicate submit/i,
    /notification failure/i
  ]) {
    assert.match(contactSpec, expected);
  }

  for (const expected of [
    /SSRF/,
    /localhost/,
    /内网/,
    /cloud metadata|云元数据/i,
    /input schema/i,
    /output schema/i,
    /invalid_url/,
    /invalid_model_output/
  ]) {
    assert.match(aiTechSpec, expected);
  }

  assert.match(checklist, /D6 项目资产/);
  assert.match(checklist, /D6 Contact/);
  assert.match(checklist, /更新截图前必须看实际图/);
});

test('D7 contact form plan and acceptance report define implemented API guardrails', () => {
  const plan = read('docs/website/D7_CONTACT_FORM_IMPLEMENTATION_PLAN.md');
  const spec = read('docs/website/D7_CONTACT_FORM_SPEC.md');
  const report = read('docs/website/D7_ACCEPTANCE_REPORT.md');
  const checklist = read('docs/website/RELEASE_CHECKLIST.md');

  assert.match(plan, /# Website D7 Contact Form Implementation Plan/);
  assert.match(plan, /POST \/api\/contact/);
  assert.match(plan, /CONTACT_SUBMISSIONS_DIR/);
  assert.match(plan, /CONTACT_NOTIFICATION_WEBHOOK_URL/);
  assert.match(plan, /honeypot/);
  assert.match(plan, /duplicate submit/i);
  assert.match(plan, /rate limit/i);

  assert.match(spec, /D7 已实现|D7 implemented/i);
  assert.match(spec, /received_with_notification_failure/);
  assert.match(spec, /CONTACT_SUBMISSIONS_DIR/);

  assert.match(report, /# Website D7 Contact Form Acceptance Report/);
  assert.match(report, /POST \/api\/contact/);
  assert.match(report, /npm test/);
  assert.match(report, /npm run verify:website-browser/);
  assert.doesNotMatch(report, /TBD|TODO|implement later|fill in details/);

  assert.match(checklist, /D7 Contact API/);
  assert.match(checklist, /CONTACT_SUBMISSIONS_DIR/);
});
