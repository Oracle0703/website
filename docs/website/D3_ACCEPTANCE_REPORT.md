# Website D3 Locale Routing Acceptance Report

## 1. 报告结论

| 项目 | 结论 |
|---|---|
| 报告日期 | 2026-05-21 |
| D3 目标 | 在保留中文根路径的前提下，为英文页面提供 `/en/*` 独立 URL，并补齐 SEO、sitemap、语言切换和验收覆盖 |
| 当前状态 | 已完成并通过自动化验收 |
| 任务数量 | 6 个任务全部完成 |
| 中文 canonical | `/`、`/blog`、`/projects`、`/labs`、`/tracker`、`/about`、`/contact`、`/enter`、`/ai-page-analysis` |
| 英文 canonical | `/en`、`/en/blog`、`/en/projects`、`/en/labs`、`/en/tracker`、`/en/about`、`/en/contact`、`/en/enter`、`/en/ai-page-analysis` |
| 核心边界 | 不生成 `/zh/*`，不按 cookie、localStorage、Accept-Language 或 IP 自动跳转 |
| 后续阶段 | D4 应优先处理英文内容质量，而不是继续扩展路由结构 |

D3 的技术目标已经闭环：URL、metadata、sitemap、JSON-LD、语言切换、静态入口验证和浏览器验收均以 route locale 为准。中文继续保留现有根路径，英文获得可索引、可分享、可验收的 `/en/*` 路由。

## 2. 已完成任务

| 任务 | 完成内容 | 验收信号 |
|---|---|---|
| Task 1: Locale 路由工具 | 新增 locale path helper，扩展 `PUBLIC_WEBSITE_LOCALE_ROUTES` 和 `PUBLIC_WEBSITE_EN_ROUTES` | `tests/website-d3-locale-routing.test.js` |
| Task 2: 英文静态入口 | 新增 `/en/*` 公开入口 facade pages，保持公开页面静态输出 | `npm run build:website` 输出 `/en`、`/en/blog`、`/en/projects` 等静态路由 |
| Task 3: SEO 与 sitemap | canonical、hreflang、x-default、sitemap、JSON-LD language 按 route locale 输出 | SEO source tests 与 sitemap source tests |
| Task 4: 语言切换 | 语言切换从 `router.refresh()` 改为 `router.push(targetLocalePath)` | Playwright 语言切换 URL 测试 |
| Task 5: 详情页 locale 路由 | Blog 和 Project 详情页生成 `/en/blog/[slug]`、`/en/projects/[slug]` | `generateStaticParams` 覆盖英文详情页 |
| Task 6: 验收脚本扩展 | 静态入口脚本和浏览器验收覆盖中文根路径与英文 `/en/*` | `verify:website-static`、`verify:website-browser` |

## 3. 行为矩阵

| 场景 | D3 行为 | 原因 |
|---|---|---|
| 访问 `/blog` | 输出中文 route locale，canonical 指向 `/blog` | 保留旧中文链接和中文 SEO 权重 |
| 访问 `/en/blog` | 输出英文 route locale，canonical 指向 `/en/blog` | 英文内容拥有独立 URL |
| 访问 `/projects/ai-page-analysis` | 输出中文项目详情页 | slug 保持跨语言一致 |
| 访问 `/en/projects/ai-page-analysis` | 输出英文 route locale 的项目详情页 | sitemap 和浏览器验收覆盖英文详情 |
| 点击语言切换 | 在当前路径对应的中英 canonical 之间跳转 | URL 语义优先于客户端偏好 |
| `localStorage.locale=en` 后访问 `/blog` | 不自动跳转到 `/en/blog` | 防止客户端偏好覆盖 SEO URL |
| `LOCALE_COOKIE=en` 后访问 `/blog` | 不影响 server metadata 和 canonical | 保持静态输出和缓存可预测 |
| 访问 `/zh/blog` | 当前不生成页面 | D3 不做中文路径迁移 |
| 浏览器语言是英文 | 不自动跳转 | 避免 Accept-Language 造成缓存和索引不稳定 |

## 4. 主要文件

| 文件 | 责任 |
|---|---|
| `apps/website/lib/locale-routing.ts` | 路径归一化、locale 判断、中英文路径转换 |
| `apps/website/lib/public-routes.mjs` | 中文公开入口、英文入口、locale-aware route matrix |
| `apps/website/lib/public-routes.ts` | TypeScript route matrix 类型导出 |
| `apps/website/lib/seo.ts` | canonical、language alternates、JSON-LD language helper |
| `apps/website/app/en/**/page.tsx` | 英文公开入口和详情页 |
| `apps/website/app/sitemap.ts` | 中英文公开入口、Blog 详情、Project 详情 sitemap |
| `apps/website/components/language-provider.tsx` | route-aware 语言切换 |
| `scripts/verify-website-static-entrypoints.mjs` | 中英文公开静态入口 HTML 验收 |
| `tests/website-browser-static.spec.ts` | 桌面和移动浏览器验收 |
| `tests/website-d3-locale-routing.test.js` | D3 路由、SEO、详情页和语言切换源码护栏 |

## 5. 验收证据

| 命令 | 结果 | 覆盖范围 |
|---|---|---|
| `npm test` | 78/78 通过 | 根测试套件，含 D3 路由、SEO、sitemap、静态化护栏和文档约束 |
| `npm run validate:website-content` | 通过，13 个内容文件检查完成 | published MDX frontmatter、图片 alt、series、relatedPosts |
| `npm run build:website` | 通过，生成 57 个 static/SSG 页面 | Next.js 生产构建、中英文公开入口和详情页 |
| `npm run verify:website-static` | 通过，18 个静态入口 | 中文根路径和英文 `/en/*` HTML、静态脚本、hydration warning 签名 |
| `npm run verify:website-browser` | 46/46 通过 | 桌面和移动覆盖公开入口、详情页、语言切换、console error、截图基线 |
| `git diff --check` | 通过 | whitespace 检查 |

> 验证命令运行时显式使用 Node 22：`$env:Path='F:\an\nvm\v22.22.0;' + $env:Path`。

## 6. 已知边界

| 边界 | 当前状态 | 后续处理 |
|---|---|---|
| 英文内容质量 | `/en/*` 技术路由已就绪，但部分项目数据、文章正文和产品页客户端文案仍可能是中文或中英混合 | D4 建立英文内容精修计划 |
| Blog 正文翻译 | D3 复用现有 MDX 内容，不区分文章正文可用语言 | D4 定义 `availableLocales` 或翻译内容模型 |
| Project 数据 | 项目模型当前以中文字段为主 | D4 引入 locale-aware project view |
| AI 页面分析客户端文案 | 英文 route metadata 已有，但客户端 Demo 文案仍需系统性本地化 | D4 统一 landing 和交互文案 |
| `/zh/*` | 不生成页面，不进入 sitemap | 后续若需要，可加显式 redirect 到中文根路径 |
| 自动跳转 | 不做 | 保持 SEO、缓存和用户预期稳定 |

## 7. 发布判断

| 判断项 | 结论 |
|---|---|
| 技术可发布性 | 通过。D3 验收命令均已通过 |
| SEO 可发布性 | 通过。canonical、hreflang、sitemap 和 JSON-LD language 已按 route locale 输出 |
| 用户行为可发布性 | 通过。语言切换进入对应 URL，不依赖刷新或 cookie 覆盖 |
| 内容成熟度 | 可发布但需要 D4 精修。英文 URL 已可用，英文内容质量仍需进入下一阶段 |
| 合并前注意 | 工作树存在大量未提交变更，提交时应按 D3/D4 范围分组 stage，避免混入无关 dashboard-api、knock 或历史变更 |

## 8. D4 交接

| 方向 | 目标 |
|---|---|
| 英文文案 | 让 `/en/*` 不只是路由存在，而是页面表达自然、可信、可面向英文访问者 |
| 项目内容 | Projects 列表和详情页支持中英文项目内容，不让英文路由展示中文项目主体 |
| Blog 策略 | 明确中文原创、英文原创、已翻译、未翻译文章在 `/en/blog` 的展示和索引规则 |
| 产品页 | AI 页面分析助手、Tracker、Labs 的客户端交互文案按 route locale 输出 |
| 验收 | 增加英文内容质量护栏，至少覆盖 CJK 泄漏、metadata 一致性、sitemap eligibility 和浏览器路径 |

具体执行拆解见 `docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md`。
