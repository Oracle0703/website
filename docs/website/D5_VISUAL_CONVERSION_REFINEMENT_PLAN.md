# Website D5 Visual and Conversion Refinement Plan

> **For agentic workers:** D5 starts after D4 English content acceptance. Keep D3 route structure and D4 language quality guards intact. D5 should improve perceived craft, proof density, and contact conversion without broad architecture churn.

**Goal:** Make the personal website feel more polished, credible, and conversion-ready across Chinese and English routes.

**Architecture:** Keep existing Next.js App Router pages, static rendering boundaries, locale routing helpers, i18n copy, ProjectView, Blog locale availability, and browser verification. Add small, reusable visual patterns only when they reduce repeated page-level styling or make evidence sections easier to maintain.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Tailwind CSS v4, MDX, Node.js 22, Playwright, current Node test suite.

---

## 1. D5 结论

| 项目 | 决策 |
|---|---|
| 推荐路线 | 先做视觉系统和转化路径的设计约束，再逐页小步精修 |
| 优先页面 | `/`、`/en`、`/projects`、`/en/projects`、Project detail、Blog detail、`/contact`、`/en/contact`、`/ai-page-analysis`、`/en/ai-page-analysis` |
| 核心问题 | D2-D4 已解决静态化、路由和英文内容，但页面质感、内容证据、项目详情深度和联系转化仍偏基础 |
| 核心原则 | 精修必须提升可理解性和可信度，不做纯装饰；移动端首屏和截图验收必须同步考虑 |
| 完成标准 | 访问者能更快理解能力范围、看到可验证证据、找到明确联系路径，且自动化验收持续通过 |

## 2. 目标与非目标

| 类型 | 内容 |
|---|---|
| 目标 | 建立更明确的视觉系统精修规则：间距、卡片、按钮、链接、section 节奏、移动端首屏 |
| 目标 | 首页首屏强化定位、当前项目、精选证据和双语一致性 |
| 目标 | Projects 和 Blog 增强内容证据：截图、架构、trade-offs、roadmap、相关内容 |
| 目标 | Contact 补齐联系转化路径，避免只有站内导流 |
| 目标 | 提升产品页成熟度，让 AI 页面分析助手清晰表达 demo 能力、限制和 V1 演进路径 |
| 目标 | AI 页面分析助手产品页提升产品感和 V1 演进路径表达 |
| 目标 | 浏览器截图和发布 checklist 覆盖 D5 视觉变化 |
| 非目标 | 不引入 CMS、数据库或后台编辑器 |
| 非目标 | 不改 D3 URL 结构，不新增 `/zh/*` |
| 非目标 | 不重写整个设计系统或替换 Tailwind |
| 非目标 | 不引入复杂动画、3D 场景或纯装饰背景 |
| 非目标 | 不在 D5 直接实现真实 AI 抓取、模型调用或支付 |

## 3. 当前基线

| 区域 | 当前状态 | D5 风险 |
|---|---|---|
| 首页 | 已有 hero、当前构建、精选项目、系列、实验和联系入口 | 首屏视觉重点不够集中，证据链仍偏文字 |
| Projects 列表 | 已接入 locale-aware ProjectView | 卡片信息密度可提升，但不能压迫移动端阅读 |
| Project detail | 有 Problem、Solution、Role、Highlights、Limitations、Next steps | 缺少截图、架构、trade-offs 的统一证据结构 |
| Blog detail | 有封面、目录、系列、相关阅读和 CTA | 文章和项目之间的转化路径可更明确 |
| Contact | 已有合作方向和边界 | 缺少真实联系方式或明确联系策略 |
| AI 页面分析助手 | 中英文 copy 已本地化 | 产品页质感、V1 roadmap 和样例结果层级仍可增强 |
| 视觉 token | `globals.css` 提供主题变量、panel、card、link | 色彩偏单一，按钮和 panel 样式散落在页面里 |
| 浏览器验收 | Playwright 已覆盖截图、console、英文内容质量 | D5 改视觉必须主动更新并解释截图基线 |

## 4. 视觉系统精修标准

| 维度 | 标准 |
|---|---|
| 版式密度 | 首页和详情页应有清晰主次：首屏 1 个主任务、2 个以内 CTA、后续 section 承接证据 |
| 移动端首屏 | 390px 宽度下标题、CTA、导航、首段内容不挤压、不遮挡、不出现横向滚动 |
| 卡片 | 卡片服务信息分组，不做页面 section 外框堆叠；重复卡片保持同一 radius、border、hover 规则 |
| CTA | 主行动与次行动视觉区分明确；Contact CTA 不使用占位邮箱 |
| 色彩 | 保持深浅主题，但减少单一蓝紫渐变依赖，避免页面读成单色主题 |
| 图像 | 网站和产品页需要真实截图、生成 bitmap 或可检查资产；不以抽象 SVG 装饰代替产品证据 |
| 文案 | 不用说明书式文案解释功能，不在页面中描述快捷键或视觉元素本身 |
| 可维护性 | 可复用样式抽到局部组件或明确 class，不让每个页面复制大段按钮/卡片 class |

## 5. Contact 转化策略

| 场景 | 处理 |
|---|---|
| 已有真实邮箱或社交链接 | Contact 主 CTA 指向真实联系方式，secondary CTA 指向 Projects 或 Blog |
| 暂无公开邮箱 | 明确“先通过 GitHub / LinkedIn / X 了解与联系”，不使用 `hello@example.com` 等占位地址 |
| 用户想接项目合作 | 页面先说明适合沟通的项目类型、边界、交付物和时间线 |
| 用户只是浏览 | 提供 Projects、Blog、AI 页面分析助手三个继续路径 |
| 英文访问者 | `/en/contact` 的 CTA、边界、合作方向必须全英文 |
| 联系表单 | D5 不引入后端表单；若要做，作为 D6 独立任务并包含反垃圾和隐私边界 |

## 6. 内容证据策略

| 页面 | 证据类型 | 边界 |
|---|---|---|
| 首页 | 当前项目状态、精选项目、推荐系列、能力标签 | 不堆过多指标，优先可点击案例 |
| Projects 列表 | 状态、类型、摘要、技术栈、更新日期 | 不把详情页所有内容塞进卡片 |
| Project detail | 截图、架构图、trade-offs、roadmap、相关入口 | 没有真实截图时使用明确标记的 product mock，不伪装线上数据 |
| Blog detail | 系列位置、相关阅读、相关项目、文章末尾 CTA | 未翻译内容不出现在英文详情页 |
| AI 页面分析助手 | Demo 流程、样例输出、V1 roadmap、限制说明 | 不宣称真实模型能力，mock 和真实能力必须区分 |

## 7. Task 拆解

### Task 1: 视觉基线与设计 token 审计

**Files:**
- Modify: `docs/website/D5_VISUAL_CONVERSION_REFINEMENT_PLAN.md`
- Modify: `tests/website-static-rendering-spike.test.js`
- Optional modify: `apps/website/app/globals.css`
- Optional create: `apps/website/components/ui/action-link.tsx`

- [x] **Step 1: 写失败测试**
  - 检查 D5 计划存在；
  - 检查视觉系统精修、内容证据、联系转化、移动端首屏、D5 非目标和验收命令；
  - 检查不改 D3 URL 结构、不引入 CMS。

- [x] **Step 2: 盘点重复样式**
  - 搜索页面里的主 CTA、次 CTA、panel、card class；
  - 只提取重复且稳定的样式；
  - 不为一次性布局引入抽象。

- [x] **Step 3: 定义 D5 UI 边界**
  - 主按钮、次按钮、文字链接、证据卡片、section heading 的使用场景；
  - 深浅主题下 contrast 不降低；
  - 移动端不使用会压缩正文的过宽两列布局。

**完成记录：** `globals.css` 已新增 `btn-primary`、`btn-secondary`、`evidence-card`、`section-kicker`；页面继续使用现有 `panel-surface` 和 `card-interactive`，未新增跨页面复杂抽象。

### Task 2: 首页首屏与证据链精修

**Files:**
- Modify: `apps/website/components/home/home-page-client.tsx`
- Modify: `apps/website/lib/i18n.ts`
- Modify: `tests/website-home-refinement.test.js`
- Modify: `tests/website-browser-static.spec.ts`

- [x] **Step 1: 写失败测试**
  - 首页 hero 包含清晰定位、当前构建、Projects CTA、Blog CTA；
  - 英文首页不泄漏中文主体；
  - 首页仍消费 server 传入的 Projects 和 Blog series 数据。

- [x] **Step 2: 精修首屏层级**
  - hero 左侧保持定位和 CTA；
  - 右侧从纯入口卡片升级为当前能力/项目证据；
  - 移动端先展示定位和 CTA，再展示证据卡片。

- [x] **Step 3: 强化证据链**
  - Featured Projects 展示状态、类型或技术栈；
  - Recommended series 和 latest posts 保持 fallback；
  - Contact section 指向真实联系策略或明确站内路径。

**完成记录：** 首页 hero 已加入 `heroEvidenceItems`，Featured Projects 继续消费 server project view，并展示项目技术栈摘要；CTA 使用共享按钮 token。

### Task 3: Projects 和 Blog 证据密度增强

**Files:**
- Modify: `apps/website/lib/projects.ts`
- Modify: `apps/website/app/projects/projects-client.tsx`
- Modify: `apps/website/app/projects/[slug]/project-detail-client.tsx`
- Modify: `apps/website/app/blog/[slug]/blog-detail-client.tsx`
- Modify: `tests/website-projects.test.js`
- Modify: `tests/website-detail-static-pages.test.js`

- [x] **Step 1: 写失败测试**
  - ProjectView 支持 `evidence` 或等价字段；
  - Project detail 渲染 trade-offs / roadmap / related entry；
  - Blog detail CTA 能链接到 Projects 或 Contact。

- [x] **Step 2: 扩展项目证据字段**
  - 为 5 个项目补充截图占位策略、架构说明、trade-offs、roadmap；
  - 英文 view 字段必须无 CJK；
  - 中文字段保持自然中文表达。

- [x] **Step 3: 接入列表与详情页**
  - 列表只展示摘要级证据；
  - 详情页展示完整证据；
  - 空字段不渲染空 section。

**完成记录：** `ProjectView` 已扩展 `evidence`、`architecture`、`tradeoffs`、`roadmap`；Projects 列表展示摘要级 evidence 和 stack，详情页展示完整证据、架构、取舍、roadmap 和相关入口。

### Task 4: Contact 转化路径

**Files:**
- Modify: `apps/website/app/contact/contact-client.tsx`
- Modify: `apps/website/lib/i18n.ts`
- Modify: `tests/website-home-refinement.test.js`
- Modify: `tests/website-browser-static.spec.ts`

- [x] **Step 1: 写失败测试**
  - Contact 不包含 `example.com`、`mailto:hello` 等占位联系方式；
  - Contact 至少提供一个真实或明确策略的联系路径；
  - `/en/contact` 主体无 CJK。

- [x] **Step 2: 明确联系策略**
  - 若补真实链接：主 CTA 指向真实渠道；
  - 若不公开邮箱：主 CTA 指向 GitHub/LinkedIn/X 或站内 Projects，并说明边界；
  - 不新增后端表单。

- [x] **Step 3: 优化转化区块**
  - 合作方向、合作边界、下一步信息分组；
  - 移动端 CTA 不换行到难以点击；
  - 深浅主题下可读。

**完成记录：** 仓库未发现真实公开邮箱或个人社交 handle，D5 采用明确站内联系策略：先从 Projects、AI demo、Blog 对齐目标和边界，不使用占位邮箱，也不新增表单。

### Task 5: AI 页面分析助手产品页质感

**Files:**
- Modify: `apps/website/components/landing/ai-page-analysis-landing-client.tsx`
- Modify: `tests/website-d4-english-content.test.js`
- Modify: `tests/website-browser-static.spec.ts`
- Optional modify: `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md`

- [x] **Step 1: 写失败测试**
  - `/en/ai-page-analysis` 包含 V1 roadmap 或 limitation；
  - 英文页面无中文主体；
  - mock 能力不被文案伪装成真实生产分析。

- [x] **Step 2: 精修产品页层级**
  - 首屏说明输入、输出、价值；
  - Demo path、sample output、limitations 分层展示；
  - CTA 保持清晰，不新增真实模型行为。

- [x] **Step 3: 对齐产品 spec**
  - 页面 roadmap 与 `AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` 一致；
  - 不把 D5 页面精修扩展成 V1 后端实现。

**完成记录：** AI 页面分析助手新增 `Mock Pipeline limitation` / `V1 roadmap` 区块，明确没有 live model integration、不保存历史、不作为生产分析结论；roadmap 与 V1 spec 的 URL 抓取、Brief 校验、模型 schema 对齐。

### Task 6: 浏览器截图与发布验收

**Files:**
- Modify: `tests/website-browser-static.spec.ts`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Modify: `docs/website/D5_VISUAL_CONVERSION_REFINEMENT_PLAN.md`
- Update: `tests/__screenshots__/website-browser-static.spec.ts/**` only when visual changes are reviewed

- [x] **Step 1: 扩展截图验收说明**
  - D5 触及首页、Projects、Blog detail、Contact、AI 页面分析助手时必须跑 browser verifier；
  - 截图变化必须先人工检查实际图，再更新基线。

- [x] **Step 2: 增加内容质量断言**
  - Contact 无占位联系方式；
  - D5 关键英文页面仍通过 `expectNoCjk`；
  - Project detail 证据 section 可见。

- [x] **Step 3: 更新发布 checklist**
  - D5 视觉和转化改动纳入条件必跑；
  - 保持 D4 英文内容审计为每次必跑。

**完成记录：** Playwright browser spec 已增加 D5 Contact 占位联系方式、英文 Contact、AI roadmap/limitation、Project detail evidence/trade-offs/roadmap 断言；发布 checklist 已加入 D5 视觉/转化条件必跑。

## 8. 边界条件

| 场景 | 处理 |
|---|---|
| 没有真实联系方式 | 不写假邮箱，使用站内导流或真实公开社交链接 |
| 项目没有截图 | 使用明确标记的 product mock 或暂不渲染截图 section |
| 英文 copy 缺字段 | 测试失败，不回退中文 |
| 移动端首屏内容太长 | 降低装饰和次级证据优先级，不缩小字体到不可读 |
| 视觉截图失败 | 先检查实际图和 error context，确认是合理变化后再 update snapshots |
| 深浅主题差异 | 两个主题都应保持可读，不能只为 dark theme 调整 |
| Blog 英文内容不足 | 不强行展示中文文章，继续沿用 D4 locale availability |
| AI 页面分析真实能力未接入 | 文案明确 demo / mock / roadmap，不暗示生产可用能力 |

## 9. 验收命令

| 场景 | 命令 | 通过标准 |
|---|---|---|
| 文档和源码测试 | `npm test` | D5 计划、D4 护栏、Projects/Blog/Contact 测试通过 |
| 英文内容审计 | `npm run audit:website-english-content` | D4 route surface、ProjectView、BlogView 不回退 |
| 内容校验 | `npm run validate:website-content` | 内容 frontmatter 与 locale availability 合法 |
| 构建 | `npm run build:website` | Next.js production build exit 0 |
| 静态入口 | `npm run verify:website-static` | 中英文公开入口静态验收通过 |
| 浏览器验收 | `npm run verify:website-browser` | 桌面/移动截图、console、语言切换、英文内容质量通过 |
| 截图更新 | `npm run verify:website-browser -- --update-snapshots` | 仅在确认视觉变化合理后运行，并再跑普通 browser verifier |
| whitespace | `git diff --check` | 无 whitespace error |

## 10. 完成定义

| 编号 | 标准 |
|---|---|
| D5.1 | D5 计划和文档护栏存在，覆盖视觉、证据、转化、产品页和验收 |
| D5.2 | 首页首屏层级更清晰，移动端首屏无拥挤、遮挡或横向滚动 |
| D5.3 | Projects 和 Blog detail 增加可维护的证据结构，不破坏 D4 英文内容质量 |
| D5.4 | Contact 不包含占位联系方式，并提供真实或明确策略的联系路径 |
| D5.5 | AI 页面分析助手产品页表达 demo 能力、限制和 V1 roadmap，不夸大真实能力 |
| D5.6 | Playwright 截图基线经过检查后更新，普通浏览器验收通过 |
| D5.7 | `npm test`、`npm run validate:website-content`、`npm run audit:website-english-content`、`npm run build:website`、`npm run verify:website-static`、`npm run verify:website-browser`、`git diff --check` 全部通过 |

## 11. 推荐实施顺序

| 顺序 | 任务 | 原因 |
|---:|---|---|
| 1 | Task 1 视觉基线与设计 token 审计 | 先收敛可复用样式和边界，避免页面各自发散 |
| 2 | Task 4 Contact 转化路径 | 当前 Contact 仍是最大转化短板，改动范围小、收益高 |
| 3 | Task 2 首页首屏与证据链精修 | 首页承接 Contact 和 Projects，需要在转化策略明确后做 |
| 4 | Task 3 Projects 和 Blog 证据密度增强 | 证据结构影响内容模型和详情页，适合单独执行 |
| 5 | Task 5 AI 页面分析助手产品页质感 | 产品页改动较大，需与 V1 spec 对齐 |
| 6 | Task 6 浏览器截图与发布验收 | 最后统一更新截图基线和 checklist |

## 12. D5 不做事项

| 不做 | 原因 |
|---|---|
| 不引入 CMS | 当前内容规模和发布方式仍适合 git-based workflow |
| 不改 D3 URL 结构 | 中文根路径和英文 `/en/*` 已完成 SEO 验收 |
| 不新增 `/zh/*` | 避免破坏 D3 canonical 决策 |
| 不做完整视觉重写 | D5 是精修，不是重新设计整个站点 |
| 不新增后端联系表单 | 表单需要反垃圾、隐私和告警边界，作为单独阶段更稳 |
| 不实现 AI Page Analysis V1 后端 | D5 只提升产品页表达和路线，不接真实模型或抓取 |
| 不用纯装饰资产替代证据 | 产品截图、架构、trade-offs 比抽象装饰更有价值 |
