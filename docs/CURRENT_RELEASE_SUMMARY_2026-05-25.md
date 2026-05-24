# Current Release Summary - 2026-05-25

本文件用于收口当前工作树里的 website D4-D10 与 dashboard ingest/smoke 变更，方便后续 review、拆分提交和发布前核对。

## 1. Release 范围

| 模块 | 已完成内容 | 主要文件 |
|---|---|---|
| Website D4 English content | 英文入口、项目页、AI Page Analysis 页面英文内容审计与例外策略 | `apps/website/app/en/*`, `apps/website/lib/projects.ts`, `scripts/audit-website-english-content.mjs`, `tests/website-d4-english-content.test.js` |
| Website D5 visual conversion | 首页、项目详情、博客详情、联系页的信息结构与证据表达升级 | `apps/website/components/home/home-page-client.tsx`, `apps/website/app/projects/[slug]/project-detail-client.tsx`, `apps/website/app/blog/[slug]/blog-detail-client.tsx` |
| Website D6 trust assets/contact loop | 项目资产策略、公开 assets、联系路径与 AI V1 前置边界 | `apps/website/public/projects/*`, `apps/website/lib/projects.ts`, `docs/website/D6_*` |
| Website D7 contact form | 联系表单、API、输入质量校验、限流与重复提交保护 | `apps/website/app/api/contact/*`, `apps/website/lib/contact-form.ts`, `tests/website-contact-form.test.js` |
| Website D8 contact operations | 联系提交本地存储防护、清理脚本、运营文档 | `scripts/manage-website-contact-submissions.mjs`, `tests/website-contact-ops.test.js`, `docs/website/D8_*` |
| Website D9 AI analysis API | `/api/analyze` mock-safe pipeline、输入 schema、SSRF guard、rate limit | `apps/website/app/api/analyze/*`, `apps/website/lib/ai-page-analysis.ts`, `tests/website-ai-page-analysis-api.test.js` |
| Website D10 capture harness | DNS 复检、redirect guard、HTML size/auth/content/timeout 边界、capture title 接入 safe mock 输出 | `apps/website/lib/ai-page-analysis.ts`, `tests/website-ai-page-analysis-capture.test.js`, `docs/website/D10_*` |
| Dashboard ingest | `POST /ingest/event`、`GET /state`、`GET /events`、`Idempotency-Key` 去重、state 更新 | `apps/dashboard-api/src/app.ts`, `apps/dashboard-api/test/app.test.ts`, `docs/dashboard/JARVIS_TASK_INGEST_PLAN_V1.md` |
| Dashboard web smoke | Dashboard shell SSR smoke 与 API client mocked fetch smoke | `tests/dashboard-web-smoke.test.js`, `docs/dashboard/PLAN.md` |

## 2. 明确边界

| 模块 | 本轮不包含 |
|---|---|
| Website AI Page Analysis | 不接真实模型；不做截图；不保存历史；不做队列；不引入浏览器爬虫 |
| Contact form | 不接第三方邮件/CRM；不提供公开提交列表；本地存储路径仍需部署环境配置 |
| Dashboard ingest | 不直接暴露写入密钥；不在 dashboard-web 中写 ingest；OSS bucket 名仍需部署方确认 |
| Dashboard content module | 仅保留计划文档，未实现 `content-summary` 生成脚本、`GET /content/summary` 或 `/content` 页面 |
| Standalone `apps/ai-page-analysis` | 迁移为独立仓库仍是后续路线，不属于本轮 release |

## 3. 发布前验证清单

| 命令 | 覆盖范围 |
|---|---|
| `npm test` | 根级 website 与 dashboard-web smoke 测试 |
| `npm test -w apps/dashboard-api` | dashboard-api route、auth、logs、status、ingest、state/events 测试 |
| `npm run validate:website-content` | Website MDX/frontmatter/assets 内容完整性 |
| `npm run audit:website-english-content` | 英文路由渲染面 CJK 审计 |
| `npm run build:website` | Website production build |
| `npm run build:dashboard-api` | Dashboard API TypeScript build |
| `npm run build:dashboard-web` | Dashboard Web production build |
| `git diff --check` | whitespace 与补丁格式检查 |

## 4. 建议提交分组

| 分组 | 建议主题 | 包含内容 |
|---|---|---|
| Commit 1 | `website: refine public content and project proof` | D4-D6 的英文内容、视觉转化、项目资产、首页/项目/博客/联系页优化 |
| Commit 2 | `website: add contact intake operations` | D7-D8 联系表单、API、存储防护、清理脚本、测试与文档 |
| Commit 3 | `website: add safe ai page analysis pipeline` | D9-D10 AI analysis API、capture harness、安全边界、测试与验收文档 |
| Commit 4 | `dashboard: add ingest state and smoke coverage` | dashboard-api ingest/state/events、dashboard-web smoke、dashboard 总计划同步 |

## 5. 剩余外部事项

| 事项 | 状态 | 处理方式 |
|---|---|---|
| Dashboard OSS bucket | `docs/dashboard/PLAN.md` 仍写 `Bucket: TBD` | 由部署方确认 bucket 后更新文档与 `.env` |
| Agent output index | `docs/agent-output/INDEX.md` 仍是占位 | 有实际 agent output 文档后再填充 |
| `apps/ai-page-analysis` 独立仓库迁移 | 仍是未来路线 | 单独开迁移计划，不混入本轮 release |

