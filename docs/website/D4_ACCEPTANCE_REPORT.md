# Website D4 English Content Acceptance Report

## 1. 报告结论

| 项目 | 结论 |
|---|---|
| 报告日期 | 2026-05-21 |
| D4 目标 | 让 `/en/*` 不只是技术路由可用，而是真正具备英文内容质量 |
| 当前状态 | 已完成并通过自动化验收 |
| 任务数量 | 6 个任务全部完成 |
| 核心原则 | route locale 决定页面语言；缺少英文内容时不伪装成已翻译内容 |
| URL 结构 | 继续保持中文根路径、英文 `/en/*`，不新增 `/zh/*` |
| 英文关键入口 | `/en`、`/en/projects`、`/en/projects/[slug]`、`/en/ai-page-analysis`、`/en/blog` |
| 发布判断 | 可进入下一阶段视觉、内容深度和产品化精修 |

D4 已把 D3 的英文 URL 能力升级为可验收的英文内容能力：Projects、Blog、AI 页面分析助手、首页和信息页都按 route locale 输出主要内容，英文 sitemap 不再收录未准备好的中文正文，浏览器验收也覆盖了关键英文页面的 CJK 泄漏风险。

## 2. 已完成任务

| 任务 | 完成内容 | 验收信号 |
|---|---|---|
| Task 1: 英文内容审计与护栏 | 新增 `audit:website-english-content`，区分 route surface、localized source、ProjectView、BlogView | `tests/website-d4-english-content.test.js`、`scripts/audit-website-english-content.mjs` |
| Task 2: Projects locale-aware view | 新增 `getProjectView`、`getProjectViews`、`getFeaturedProjectViews`，5 个项目补齐英文 view | Project 页面、首页、详情页 metadata 与 JSON-LD 使用 `ProjectView` |
| Task 3: Blog locale availability | Blog frontmatter 支持 `locale`、`availableLocales` 等字段，英文列表和详情只展示英文可用内容 | `/en/blog`、`/en/blog/ci-agent-guardrails`、sitemap locale 过滤 |
| Task 4: AI 页面分析助手英文文案 | `AIPageAnalysisLandingClient` 接收 route locale，内部 copy、问题卡、流程、日志和示例结果本地化 | `/en/ai-page-analysis` 浏览器内容质量断言 |
| Task 5: 英文首页与信息页精修 | 英文首页定位补齐 AI tools、content systems、dashboards、product prototypes；About/Contact 有更完整的信息结构 | `tests/website-home-refinement.test.js` |
| Task 6: 浏览器与发布验收 | Playwright 覆盖关键英文入口，Release Checklist 纳入 D4 内容审计 | `npm run verify:website-browser`、`docs/website/RELEASE_CHECKLIST.md` |

## 3. 行为矩阵

| 场景 | D4 行为 | 原因 |
|---|---|---|
| 访问 `/en` | 首页 hero、当前构建、精选项目和 SEO description 使用英文表达 | 英文首页需要直接面向英文访问者 |
| 访问 `/en/projects` | Projects 列表使用英文项目标题、摘要、状态和 CTA | 避免英文路由展示中文项目主体 |
| 访问 `/en/projects/ai-page-analysis` | Project 详情正文、metadata、JSON-LD `name`/`description` 使用英文 ProjectView | 结构化数据必须与可见内容一致 |
| 访问 `/en/blog` | 只展示英文可用文章 | 未翻译中文原创不进入英文内容列表 |
| 访问 `/en/blog/ci-agent-guardrails` | 输出英文 override 内容和英文 related/series 上下文 | 当前作为英文 Blog 详情验收样本 |
| 访问未翻译文章英文详情 | 不生成英文静态参数，不进入英文 sitemap | 防止低质量英文索引 |
| 访问 `/en/ai-page-analysis` | 客户端产品页问题卡、步骤、结果和操作文案使用英文 | 产品页主体必须跟 route locale 一致 |
| 浏览器偏好与 URL locale 冲突 | 仍以 URL locale 为准 | 延续 D3 SEO 和缓存边界 |

## 4. 主要文件

| 文件 | 责任 |
|---|---|
| `scripts/audit-website-english-content.mjs` | D4 英文内容审计脚本 |
| `tests/website-d4-english-content.test.js` | D4 文档、Projects view、Blog locale、AI copy、浏览器验收源码护栏 |
| `tests/website-browser-static.spec.ts` | 英文关键页面可见内容和 CJK 泄漏浏览器断言 |
| `apps/website/lib/projects.ts` | Projects 原始数据、英文内容映射和 locale-aware view helpers |
| `apps/website/lib/blog.ts` | Blog locale availability、英文 override、locale-aware 查询 helper |
| `apps/website/lib/blog-series.ts` | locale-aware series 查询 |
| `apps/website/app/en/**/page.tsx` | 英文公开入口、Blog/Project 详情入口 |
| `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | AI 页面分析助手中英文客户端 copy |
| `apps/website/lib/i18n.ts` | 首页、信息页、Projects、Blog、SEO 中英文页面 chrome |
| `docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md` | D4 计划、边界和完成勾选 |
| `docs/website/RELEASE_CHECKLIST.md` | 发布前 D4 审计和浏览器验收要求 |

## 5. 验收证据

| 命令 | 结果 | 覆盖范围 |
|---|---|---|
| `node --test tests\website-d4-english-content.test.js` | 9/9 通过 | D4 计划、审计脚本、Projects view、Blog locale、AI copy、release checklist |
| `node --test tests\website-home-refinement.test.js` | 5/5 通过 | 首页和信息页英文精修护栏 |
| `npm run audit:website-english-content` | 通过 | route-surface 0/0 CJK、ProjectView 0/0 CJK、BlogView 0/0 CJK |
| `npm test` | 91/91 通过 | 根测试套件，含 D4 与既有 D2/D3/SEO/内容/静态化护栏 |
| `npm run validate:website-content` | 通过，13 个内容文件检查完成 | frontmatter、locale availability、cover alt、series、relatedPosts |
| `npm run build:website` | 通过，生成 48 个 static/SSG 页面 | Next.js 生产构建和中英文可用详情页 |
| `npm run verify:website-static` | 通过，18 个静态入口 | 中文根路径和英文 `/en/*` 静态入口 |
| `npm run verify:website-browser` | 56/56 通过 | 桌面/移动、语言切换、console error、截图和英文内容质量 |
| `git diff --check` | 通过 | whitespace 检查 |

> 验证命令运行时显式使用 Node 22：`$env:Path='F:\an\nvm\v22.22.0;' + $env:Path`。

## 6. 英文内容审计基线

| 审计面 | 路由/文件 | D4 基线 | 判定 |
|---|---|---:|---|
| route-surface | `/en` / `apps/website/app/en/page.tsx` | 0/0 CJK | 硬护栏 |
| route-surface | `/en/projects` / `apps/website/app/en/projects/page.tsx` | 0/0 CJK | 硬护栏 |
| route-surface | `/en/projects/ai-page-analysis` / `apps/website/app/en/projects/[slug]/page.tsx` | 0/0 CJK | 硬护栏 |
| route-surface | `/en/ai-page-analysis` / `apps/website/app/en/ai-page-analysis/page.tsx` | 0/0 CJK | 硬护栏 |
| localized-source | `apps/website/lib/projects.ts` | 1112/1200 CJK | 源码允许中英共存，英文 ProjectView 另测 |
| localized-source | `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | 1465/1600 CJK | 源码允许中英共存，英文 route surface 另测 |
| project-view | `/en/projects` / `apps/website/lib/projects.ts` | 0/0 CJK | 硬护栏 |
| blog-view | `/en/blog` / `apps/website/lib/blog.ts` | 0/0 CJK | 硬护栏 |

## 7. 已知边界

| 边界 | 当前状态 | 后续处理 |
|---|---|---|
| Blog 英文内容数量 | 当前只有 `ci-agent-guardrails` 有英文详情内容 | 后续可逐篇翻译，或建立 `content/blog/en` 目录 |
| Projects 内容模型 | 通过 view helper 实现英文内容，没有全量迁移到 `content: Record<Locale, ...>` 嵌套结构 | D5/D6 可评估是否重构数据结构 |
| localized source CJK | Projects 和 AI 页面分析客户端源码仍保留中英 copy | 当前用英文 view 和 route surface 硬护栏控制输出风险 |
| Labs/Tracker 深层工具文案 | D4 重点覆盖关键英文入口，工具内部深层状态仍建议继续逐项审查 | D5 可纳入产品体验精修 |
| 专属 OG 图片 | 继续使用 `/og.png` fallback | 后续视觉精修阶段可为 Blog/Project/Product 页生成专属图 |
| 邮件/社交真实联系方式 | Contact 暂时使用站内作品和文章入口，不暴露占位邮箱 | 上线前应补真实联系方式或明确联系方式策略 |

## 8. 发布判断

| 判断项 | 结论 |
|---|---|
| 技术可发布性 | 通过。构建、静态入口、浏览器验收全部通过 |
| 英文内容可发布性 | 通过。关键英文入口不再展示中文主体内容 |
| SEO 可发布性 | 通过。英文 Blog sitemap 只收录真实英文可用文章，Project JSON-LD 使用英文 view |
| 可维护性 | 通过。新增审计脚本、源码测试和发布 checklist 防止回退 |
| 合并前注意 | 工作树存在大量历史未提交变更，提交时应按 D2/D3/D4、dashboard-api、knock 等范围分组 stage |

## 9. D5 交接

| 方向 | 目标 |
|---|---|
| 视觉系统精修 | 统一首页、Projects、Blog、信息页和产品页的版式密度、组件节奏和移动端首屏质量 |
| 内容深度 | 增加英文 Blog 数量，为 Projects 补截图、架构图、trade-offs 和 roadmap |
| 联系转化 | 补真实联系方式或表单策略，避免 Contact 只有站内导流 |
| 产品页成熟度 | 将 AI 页面分析助手从 mock demo 推进到 V1 输入、抓取、分析和导出路径 |
| 运营闭环 | 继续推进 Dashboard Content/Deployments/Logs，把内容和发布状态纳入后台 |

D5 建议优先做“视觉与转化精修”，因为 D2-D4 已经完成静态化、locale 路由和英文内容质量基线，下一阶段最能提升访问者感知的是页面质感、内容证据和联系转化。
