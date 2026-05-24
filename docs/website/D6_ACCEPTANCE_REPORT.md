# Website D6 Trust Assets and Contact Loop Acceptance Report

## 1. 结论

| 项目 | 结果 |
|---|---|
| 完成时间 | 2026-05-21 |
| 范围 | D6 5 个任务全部完成 |
| 重点 | Project asset 模型、项目资产状态渲染、Contact 闭环决策、D7 表单规格、AI V1 技术规格、发布护栏 |
| 非目标 | 未新增 CMS、数据库、后端表单、真实 AI 模型调用、`/zh/*` 或 D3 URL 结构变更 |

## 2. 已完成内容

| 任务 | 交付 |
|---|---|
| Task 1 资产策略与数据模型 | 新增 `ProjectAsset`，覆盖 `screenshot`、`mock`、`diagram`、`doc`、`none`；每个项目都有资产策略 |
| Task 2 项目截图与 mock 策略 | AI 页面分析助手和 Tracker 使用明确标记的 product mock；Knock、Dashboard Console、Timestamp Tool 使用 none 状态解释边界 |
| Task 3 Contact 联系闭环决策 | Contact 页面明确 D6 继续站内联系路径，不写假邮箱、不上线后端表单；新增 D7 表单规格 |
| Task 4 AI V1 后端前置规格 | 新增 `AI_PAGE_ANALYSIS_V1_TECH_SPEC.md`，覆盖 SSRF、内网、cloud metadata、input schema、output schema、错误码和 D6 非实现边界 |
| Task 5 验收与发布护栏 | 扩展测试、browser 断言、英文审计阈值和 `RELEASE_CHECKLIST.md` 条件必跑项 |

## 3. 关键文件

| 文件 | 说明 |
|---|---|
| `apps/website/lib/projects.ts` | Project asset 数据模型与双语资产文案 |
| `apps/website/app/projects/[slug]/project-detail-client.tsx` | Project detail 资产状态渲染，图片使用 `next/image` |
| `apps/website/lib/i18n.ts` | Project asset labels、Contact 决策文案 |
| `apps/website/app/contact/contact-client.tsx` | Contact 决策和 D7 表单规格提示 |
| `apps/website/public/projects/*.svg` | 两个明确标记的 product mock 资产 |
| `docs/website/D7_CONTACT_FORM_SPEC.md` | D7 表单前置规格 |
| `docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md` | AI V1 后端安全和 schema 规格 |
| `docs/website/RELEASE_CHECKLIST.md` | D6 条件发布护栏 |

## 4. 验证记录

| 命令 | 结果 |
|---|---|
| `npm test` | 108/108 通过 |
| `npm run audit:website-english-content` | route-surface、ProjectView、BlogView 英文护栏通过 |
| `npm run validate:website-content` | 13 files checked，通过 |
| `npm run build:website` | Next.js production build 通过，48 个 static/SSG 页面 |
| `npm run verify:website-static` | 18 个静态入口通过 |
| `npm run verify:website-browser` | 62/62 通过 |
| `git diff --check` | 通过 |

## 5. 剩余边界

| 边界 | 后续建议 |
|---|---|
| 真实项目截图 | Timestamp Tool 可在人工查看实际页面后补真实截图，替换 none 状态 |
| 真实联系渠道 | 需要用户确认可公开邮箱或社交链接；否则保持站内联系路径 |
| 后端联系表单 | 按 D7 规格单独实施，先做反垃圾、隐私、失败状态和通知边界 |
| AI V1 后端 | 按技术规格单独实施 URL 抓取、SSRF guard、模型输出 schema 和错误码 |
