# Website D5 Visual and Conversion Acceptance Report

## 1. 报告结论

| 项目 | 结论 |
|---|---|
| 报告日期 | 2026-05-21 |
| D5 目标 | 在 D4 英文内容质量基础上，提升首页、Projects、Blog detail、Contact 和 AI 页面分析助手的视觉精致度、证据密度和转化路径 |
| 当前状态 | 已完成并通过自动化验收 |
| 任务数量 | 6 个任务全部完成 |
| 核心结果 | 视觉 token 收敛、首页证据链、ProjectView 证据模型、Contact 明确联系策略、AI 产品页 limitation/roadmap、浏览器截图基线均已闭环 |
| 核心边界 | 不引入 CMS、后端联系表单、真实 AI 模型调用、数据库或 `/zh/*` 路由 |
| 后续阶段 | D6 建议优先补真实可验证资产、项目截图策略、公开联系渠道或轻量联系表单设计 |

D5 的重点不是重做整站视觉，而是把 D2-D4 形成的静态化、双语路由和英文内容基础转成更可信的访问体验。当前页面已经能更快说明能力范围、展示项目证据、解释联系前置条件，并在 AI demo 中区分 mock pipeline 与 V1 roadmap。

## 2. 已完成任务

| 任务 | 完成内容 | 验收信号 |
|---|---|---|
| Task 1: 视觉基线与设计 token 审计 | 在 `globals.css` 新增 `btn-primary`、`btn-secondary`、`evidence-card`、`section-kicker`，并加固 CTA visited/hover 颜色 | `tests/website-home-refinement.test.js` |
| Task 2: 首页首屏与证据链精修 | 首页 hero 右侧从入口列表改为当前证据链，Featured Projects 展示技术栈摘要 | `website-desktop-en-en.png` 截图基线、首页源码护栏 |
| Task 3: Projects 和 Blog 证据密度增强 | `ProjectView` 扩展 `evidence`、`architecture`、`tradeoffs`、`roadmap`；列表展示摘要级证据，详情页展示完整证据结构 | `tests/website-projects.test.js`、`tests/website-detail-static-pages.test.js` |
| Task 4: Contact 转化路径 | Contact 不使用占位邮箱，新增站内联系路径和发起沟通前置说明 | Playwright Contact 占位联系方式断言 |
| Task 5: AI 页面分析助手产品页质感 | 新增 `Mock Pipeline limitation` 和 `V1 roadmap`，不伪装真实生产分析能力 | `tests/website-d4-english-content.test.js`、英文浏览器内容质量断言 |
| Task 6: 浏览器截图与发布验收 | 扩展 D5 Playwright 内容质量断言，更新 4 张截图基线，发布 checklist 纳入 D5 条件必跑 | `npm run verify:website-browser` 62/62 |

## 3. 行为矩阵

| 页面 | D5 行为 | 约束 |
|---|---|---|
| `/`、`/en` | 首屏左侧保留定位和主 CTA，右侧展示当前证据链 | 不扩大首屏装饰，不引入横向滚动 |
| `/projects`、`/en/projects` | 项目卡片展示状态、类型、技术栈、更新时间和摘要证据 | 不把详情页所有内容塞进卡片 |
| Project detail | 展示 Problem、Solution、Role、Stack、Highlights、Evidence、Architecture、Trade-offs、Roadmap、Limitations、Next steps | 空字段不渲染空 section，英文 ProjectView 主体无 CJK |
| Blog detail | 文章末尾 CTA 明确承接到项目证据和联系路径 | 不把未翻译内容塞入英文详情 |
| `/contact`、`/en/contact` | 展示合作方向、边界、站内联系路径和沟通所需信息 | 不使用 `hello@example.com`、`mailto:hello` 或假社交链接 |
| `/ai-page-analysis`、`/en/ai-page-analysis` | 明确 Mock Pipeline limitation 和 V1 roadmap | 不接真实模型，不暗示生产可用分析 |

## 4. 主要文件

| 文件 | 责任 |
|---|---|
| `apps/website/app/globals.css` | D5 共享按钮、证据卡片和 section kicker token |
| `apps/website/lib/i18n.ts` | 首页证据链、Contact 路径、Projects 新 section、Blog evidence bridge 双语 copy |
| `apps/website/lib/projects.ts` | ProjectView 证据模型和中英文项目证据内容 |
| `apps/website/components/home/home-page-client.tsx` | 首页首屏证据链和 Featured Projects 技术栈摘要 |
| `apps/website/app/projects/projects-client.tsx` | Projects 列表摘要级证据展示 |
| `apps/website/app/projects/[slug]/project-detail-client.tsx` | Project detail 完整证据、架构、取舍、roadmap |
| `apps/website/app/blog/[slug]/blog-detail-client.tsx` | Blog detail 文章到项目证据的 CTA 语义 |
| `apps/website/app/contact/contact-client.tsx` | Contact 联系路径与转化区块 |
| `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | AI demo limitations 和 V1 roadmap |
| `tests/website-browser-static.spec.ts` | D5 browser 内容质量断言和截图基线 |
| `scripts/audit-website-english-content.mjs` | D5 双语源文件 CJK localized-source 阈值，ProjectView/BlogView 仍保持 0 CJK |

## 5. 截图基线

| 截图 | 更新原因 |
|---|---|
| `website-desktop-en-en.png` | 首页首屏右侧新增当前证据链，CTA token 变化 |
| `website-mobile-zh-contact.png` | Contact 新增联系路径和站内转化区块 |
| `website-mobile-en-en-contact.png` | 英文 Contact 新增联系路径，主体仍无 CJK |
| `website-mobile-en-en-projects.png` | Projects 卡片新增技术栈、更新时间和摘要级 evidence |

截图更新前已检查实际图：布局无横向滚动、无明显遮挡，变化来自 D5 设计和内容结构调整。更新后普通 `npm run verify:website-browser` 已重新通过。

## 6. 验收证据

| 命令 | 结果 | 覆盖范围 |
|---|---|---|
| `npm test` | 101/101 通过 | D5 文档、Projects/Blog/Contact/AI 护栏、D4 英文内容护栏和既有静态化测试 |
| `npm run audit:website-english-content` | 通过 | route-surface 0 CJK，ProjectView 0/0 CJK，BlogView 0/0 CJK |
| `npm run validate:website-content` | 通过，13 个内容文件检查完成 | published MDX frontmatter、图片 alt、series、relatedPosts |
| `npm run build:website` | 通过，48 个 static/SSG 页面 | Next.js production build、类型检查和静态生成 |
| `npm run verify:website-static` | 通过，18 个静态入口 | 中文根路径和英文 `/en/*` HTML、静态脚本、hydration warning 签名 |
| `npm run verify:website-browser -- --update-snapshots` | 62/62 通过 | D5 合理视觉变化截图基线更新 |
| `npm run verify:website-browser` | 62/62 通过 | 桌面和移动截图、console error、语言切换、英文内容质量、D5 Contact/Project detail 断言 |
| `git diff --check` | 通过 | whitespace 检查 |

> 验证命令运行时显式使用 Node 22：`$env:Path='F:\an\nvm\v22.22.0;' + $env:Path`。

## 7. 已知边界

| 边界 | 当前状态 | 后续处理 |
|---|---|---|
| 真实联系方式 | 当前未发现真实公开邮箱或个人社交 handle，因此 D5 采用站内联系策略 | D6 可补真实公开联系渠道，或设计带反垃圾和隐私边界的表单 |
| 项目截图 | D5 先用结构化 evidence、architecture、tradeoffs 和 roadmap 增强可信度 | D6 可为项目补真实截图、明确 product mock 或图片缺省策略 |
| AI 页面分析能力 | D5 只强化 demo 表达，不接真实模型和抓取 | V1 后端应作为独立阶段处理安全、模型、schema 和错误边界 |
| visual token 范围 | 仅提取稳定重复样式，不建立完整设计系统 | 后续可在页面规模继续增长时再拆组件 |
| 英文 localized-source 阈值 | 因项目和 AI 页面中英 copy 同文件保存，阈值随 D5 内容增加 | ProjectView、BlogView 和 route-surface 仍保持严格 0 CJK |

## 8. D6 交接

| 方向 | 目标 |
|---|---|
| 真实资产 | 为重点项目补截图、product mock 或可检查的图像策略 |
| 联系闭环 | 决定是否公开真实邮箱/社交链接，或实现带反垃圾、隐私和边界说明的轻量表单 |
| 项目案例 | 把 `evidence` 从文字证明进一步升级为图片、结构图、结果截图和文档链接 |
| AI V1 | 若继续产品化，先做 URL 抓取安全设计、输入 schema、错误码和模型输出验收 |
| 发布质量 | 增加截图审查说明、视觉变化记录和可选人工检查清单 |

D6 不建议继续做纯视觉微调；优先补“访问者能验证”的资产和真实沟通路径。
