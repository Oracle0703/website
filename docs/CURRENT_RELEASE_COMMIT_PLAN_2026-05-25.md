# Current Release Commit Plan - 2026-05-25

本文件用于把当前 `pr` 分支的大工作树拆成可 review 的提交组。当前建议先按组审查和 staged，再提交；不要把所有文件一次性塞进一个提交。

## 1. 建议提交顺序

| 顺序 | Commit 主题 | 目标 |
|---:|---|---|
| 1 | `website: refine public content and project proof` | 收口 D4-D6 的公开内容、英文质量、视觉转化、项目证据和资产策略 |
| 2 | `website: add contact intake operations` | 收口 D7-D8 的联系表单、API、存储护栏和运维脚本 |
| 3 | `website: add safe ai page analysis pipeline` | 收口 D9-D10 的 AI Page Analysis API、抓取 harness 和安全边界 |
| 4 | `dashboard: add ingest state and smoke coverage` | 收口 dashboard ingest/state/events 与 dashboard-web smoke coverage |
| 5 | `docs: summarize current release` | 单独提交当前 release 收口与拆分计划文档 |

## 2. Commit 1 - website public content/proof

| 文件 | 原因 |
|---|---|
| `apps/website/app/blog/[slug]/blog-detail-client.tsx` | Blog detail 增加文章到项目证据路径 |
| `apps/website/app/contact/contact-client.tsx` | Contact 页面转化路径、联系策略与 intake UI 容器 |
| `apps/website/app/en/page.tsx` | 英文首页入口补齐 |
| `apps/website/app/globals.css` | D5/D6 UI token 与页面样式支撑 |
| `apps/website/app/page.tsx` | 首页 server data 注入 |
| `apps/website/app/projects/[slug]/project-detail-client.tsx` | 项目详情 evidence/asset/architecture/tradeoffs/roadmap 展示 |
| `apps/website/app/projects/projects-client.tsx` | 项目列表证据摘要 |
| `apps/website/components/home/home-page-client.tsx` | 首页证据链与内容/项目闭环 |
| `apps/website/lib/i18n.ts` | D4-D6 中英文 copy 与 project/contact labels |
| `apps/website/lib/projects.ts` | ProjectEvidence、ProjectAsset、architecture、tradeoffs、roadmap 数据模型 |
| `apps/website/public/projects/ai-page-analysis-product-mock.svg` | AI Page Analysis public mock asset |
| `apps/website/public/projects/tracker-product-mock.svg` | Tracker public mock asset |
| `docs/website/D4_ACCEPTANCE_REPORT.md` | D4 验收 |
| `docs/website/D5_ACCEPTANCE_REPORT.md` | D5 验收 |
| `docs/website/D5_VISUAL_CONVERSION_REFINEMENT_PLAN.md` | D5 计划 |
| `docs/website/D6_ACCEPTANCE_REPORT.md` | D6 验收 |
| `docs/website/D6_TRUST_ASSETS_AND_CONTACT_LOOP_PLAN.md` | D6 计划 |
| `scripts/audit-website-english-content.mjs` | D4 英文审计阈值更新 |
| `tests/__screenshots__/website-browser-static.spec.ts/**` | D5/D6 浏览器截图基线 |
| `tests/website-browser-static.spec.ts` | D5/D6 浏览器验收扩展 |
| `tests/website-d4-english-content.test.js` | D4 英文质量测试 |
| `tests/website-detail-static-pages.test.js` | D5/D6 detail 静态测试 |
| `tests/website-home-refinement.test.js` | D5 首页测试 |
| `tests/website-projects.test.js` | D5/D6 project model/list 测试 |
| `tests/website-static-rendering-spike.test.js` | D4-D6 文档验收测试扩展 |

推荐验证：`npm test`、`npm run validate:website-content`、`npm run audit:website-english-content`、`npm run build:website`。

## 3. Commit 2 - contact intake/ops

| 文件 | 原因 |
|---|---|
| `apps/website/app/api/contact/healthz/route.ts` | Contact API health check |
| `apps/website/app/api/contact/route.ts` | Contact intake endpoint |
| `apps/website/lib/contact-form.ts` | Contact 表单校验、存储、限流、重复提交与错误码 |
| `apps/website/app/contact/contact-client.tsx` | 表单 UI 与错误/成功状态 |
| `apps/website/lib/i18n.ts` | 表单中英文文案和错误文案 |
| `docs/website/D7_ACCEPTANCE_REPORT.md` | D7 验收 |
| `docs/website/D7_CONTACT_FORM_IMPLEMENTATION_PLAN.md` | D7 计划 |
| `docs/website/D7_CONTACT_FORM_SPEC.md` | Contact 表单规格 |
| `docs/website/D8_ACCEPTANCE_REPORT.md` | D8 验收 |
| `docs/website/D8_CONTACT_OPERATIONS_PLAN.md` | D8 运维计划 |
| `docs/website/RELEASE_CHECKLIST.md` | Contact API/ops release gate |
| `package.json` | 新增 `contact:ops` 脚本 |
| `scripts/manage-website-contact-submissions.mjs` | Contact JSONL 运维/清理脚本 |
| `tests/website-contact-form.test.js` | Contact API/form 测试 |
| `tests/website-contact-ops.test.js` | Contact ops 测试 |

交叉注意：`apps/website/app/contact/contact-client.tsx` 与 `apps/website/lib/i18n.ts` 同时包含 Commit 1 和 Commit 2 内容。若要严格拆分，需要使用 `git add -p` 分块 stage。

推荐验证：`npm test`、`npm run validate:website-content`、`npm run audit:website-english-content`、`npm run build:website`、`npm run contact:ops -- --check-storage`、`npm run contact:ops -- --cleanup --dry-run`。

## 4. Commit 3 - AI Page Analysis API/capture

| 文件 | 原因 |
|---|---|
| `apps/website/app/api/analyze/healthz/route.ts` | AI analyze health check |
| `apps/website/app/api/analyze/route.ts` | AI analyze API route |
| `apps/website/lib/ai-page-analysis.ts` | 输入 schema、SSRF guard、rate limit、safe mock、capture harness |
| `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | 前端接入 Safe Mock API、D9/D10 copy 与状态 |
| `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` | 产品规格同步 |
| `docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md` | V1 技术规格 |
| `docs/website/D9_ACCEPTANCE_REPORT.md` | D9 验收 |
| `docs/website/D9_AI_PAGE_ANALYSIS_API_PLAN.md` | D9 计划 |
| `docs/website/D10_ACCEPTANCE_REPORT.md` | D10 验收 |
| `docs/website/D10_AI_PAGE_ANALYSIS_CAPTURE_PLAN.md` | D10 计划 |
| `docs/website/RELEASE_CHECKLIST.md` | D9/D10 release gate |
| `tests/website-ai-page-analysis-api.test.js` | D9 API 测试 |
| `tests/website-ai-page-analysis-capture.test.js` | D10 capture 测试 |

推荐验证：`npm test`、`npm run audit:website-english-content`、`npm run build:website`、`git diff --check`。

## 5. Commit 4 - dashboard ingest/smoke

| 文件 | 原因 |
|---|---|
| `apps/dashboard-api/.env.example` | 新增 `INGEST_TOKEN` |
| `apps/dashboard-api/src/app.ts` | `/ingest/event`、`/state`、`/events`、CORS `Idempotency-Key` |
| `apps/dashboard-api/test/app.test.ts` | dashboard-api ingest/state/events/status 回归测试 |
| `docs/dashboard/JARVIS_TASK_INGEST_PLAN_V1.md` | ingest 验收清单勾选 |
| `docs/dashboard/PLAN.md` | dashboard MR #2/#3 状态同步 |
| `tests/dashboard-web-smoke.test.js` | dashboard-web SSR smoke 与 mocked API client smoke |

推荐验证：`npm test -w apps/dashboard-api`、`npm run build:dashboard-api`、`npm run build:dashboard-web`、`node --test tests/dashboard-web-smoke.test.js`。

## 6. Commit 5 - release docs

| 文件 | 原因 |
|---|---|
| `docs/CURRENT_RELEASE_SUMMARY_2026-05-25.md` | 当前 release 范围、边界、验证与建议提交分组 |
| `docs/CURRENT_RELEASE_COMMIT_PLAN_2026-05-25.md` | 本文件 |

推荐验证：`git diff --check`。

## 7. 总验证

拆分提交前后建议最终再跑：

| 命令 | 期望 |
|---|---|
| `npm test` | 134/134 pass |
| `npm test -w apps/dashboard-api` | 10/10 pass |
| `npm run validate:website-content` | passed |
| `npm run audit:website-english-content` | passed |
| `npm run build:website` | passed |
| `npm run build:dashboard-api` | passed |
| `npm run build:dashboard-web` | passed |
| `git diff --check` | no output |

