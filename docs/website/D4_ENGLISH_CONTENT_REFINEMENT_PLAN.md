# Website D4 English Content Refinement Plan

> **For agentic workers:** This plan starts after D3 locale routing has passed acceptance. D4 should improve English content quality without changing the asymmetric URL decision: Chinese remains on root paths and English remains on `/en/*`.

**Goal:** Make the English site feel intentionally written, not only technically routed. `/en/*` pages should have English metadata, English page chrome, English project content, clear blog language policy, and browser-verifiable content quality.

**Architecture:** Keep D3 route locale as the source of truth. Add locale-aware content view helpers around existing data models before changing page components. Avoid middleware redirects, database work, CMS work, or automatic machine translation.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, MDX, Node.js 22, npm workspaces, Playwright, current Node test suite.

---

## 1. D4 结论

| 项目 | 决策 |
|---|---|
| 推荐路线 | 先做英文内容模型和质量护栏，再精修页面文案 |
| 优先页面 | `/en`、`/en/projects`、`/en/projects/[slug]`、`/en/ai-page-analysis`、`/en/blog` |
| 主要问题 | 英文 URL 已存在，但项目数据、部分 Blog 正文、部分客户端产品文案仍可能显示中文 |
| 核心原则 | route locale 决定页面语言；没有英文内容时明确降级，不伪装成已翻译 |
| 完成标准 | 英文公开入口可被英文访问者理解，metadata 与页面正文一致，sitemap 不暴露未准备好的英文详情页 |

## 2. 目标与非目标

| 类型 | 内容 |
|---|---|
| 目标 | 精修英文首页定位、CTA、区块标题、SEO description |
| 目标 | 为 Projects 数据建立 locale-aware 内容视图 |
| 目标 | 让 `/en/projects/[slug]` 的主体内容使用英文 |
| 目标 | 明确 Blog 中文原创、英文原创、已翻译、未翻译文章的展示和索引规则 |
| 目标 | 本地化 AI 页面分析助手客户端文案和交互状态 |
| 目标 | 增加英文内容质量测试，防止 `/en/*` 关键区域泄漏中文主体文案 |
| 非目标 | 不引入 CMS、数据库或后台编辑器 |
| 非目标 | 不自动机器翻译并直接发布 |
| 非目标 | 不改 D3 URL 结构，不新增 `/zh/*` |
| 非目标 | 不为 tag、series 单独建立 SEO 页面 |

## 3. 当前内容盘点

| 区域 | 当前状态 | D4 风险 |
|---|---|---|
| `/en` 首页 | route 和 metadata 已英文，动态内容来自 Blog 和 Projects 数据 | Featured projects 可能仍是中文标题和简介 |
| `/en/projects` | 页面 chrome 已英文，项目数据来自 `apps/website/lib/projects.ts` | 项目主体字段为中文 |
| `/en/projects/[slug]` | URL、canonical、JSON-LD language 已英文 | JSON-LD `name`、`description` 和页面正文可能中文 |
| `/en/blog` | 页面 chrome 已英文，文章数据来自当前 MDX frontmatter | 中文文章会出现在英文列表中 |
| `/en/blog/[slug]` | 英文详情 URL 已生成 | 没有英文正文时，英文 route 可能输出中文正文 |
| `/en/ai-page-analysis` | metadata 已英文 | `AIPageAnalysisLandingClient` 内部文案仍需 locale-aware |
| `/en/tracker` | Tracker 客户端已有中英 copy | 需要检查 route locale 初始化和边界文案 |
| `/en/labs` | 页面 chrome 已英文 | 工具内部文案需要逐项审查 |
| `/en/about`、`/en/contact`、`/en/enter` | 静态信息页已有英文 copy 基线 | 可做语气和品牌表达精修 |

## 4. 英文质量标准

| 维度 | 标准 |
|---|---|
| 语言一致性 | `/en/*` 首屏、标题、CTA、状态、metadata 和 JSON-LD 应使用英文 |
| 内容真实性 | 未翻译的中文正文不能伪装成英文内容 |
| 语气 | 简洁、具体、偏工程和产品表达，避免空泛营销词 |
| SEO | title 和 description 与页面真实内容一致，不用中文关键词堆叠英文 metadata |
| 可维护性 | 页面组件不直接分叉大段中英文 JSX，优先通过 locale-aware view data 输入 |
| 降级 | 缺少英文内容时给出明确 fallback 规则，sitemap 和 canonical 不制造低质量英文索引 |
| 验收 | 自动化检查关键英文 route、metadata、JSON-LD、sitemap eligibility 和 CJK 泄漏风险 |

## 5. 内容模型方案

| 方案 | 做法 | 优点 | 风险 | 结论 |
|---|---|---|---|---|
| A: 仅扩充 i18n 文案 | 只改 `i18n.ts` 页面 chrome | 成本最低 | Projects 和 Blog 主体仍中文 | 不足以完成 D4 |
| B: 为核心数据加 locale-aware view | Projects、产品页、Blog 列表通过 helper 输出当前 locale 可用内容 | 改动可控，兼容现有页面 | 需要补测试和 fallback | 推荐 |
| C: 全量内容目录分语言 | `content/blog/zh` 与 `content/blog/en` 分开维护 | 长期最清晰 | 当前迁移成本偏高 | D4 后续可评估 |

推荐采用 B：先围绕现有数据结构增加 view helper，不急于重构全部内容目录。

## 6. Blog 语言策略

| 内容状态 | 中文路由 | 英文路由 | sitemap | 说明 |
|---|---|---|---|---|
| 中文原创，未翻译 | `/blog/[slug]` 200 | `/en/blog/[slug]` 不生成或显示明确“Chinese original”入口后跳中文 canonical | 只收录中文 URL | 避免低质量英文索引 |
| 中文原创，已翻译 | `/blog/[slug]` 200 | `/en/blog/[slug]` 200 | 收录中英文 URL | 两边互设 hreflang |
| 英文原创 | 可在中文列表展示英文标题并标记原文语言 | `/en/blog/[slug]` 200 | 收录英文 URL；中文是否收录取决于是否有中文版本 | 避免强制复制内容 |
| 中英双语正文 | 两边都 200 | 两边都 200 | 收录中英文 URL | slug 可以保持一致 |

建议 frontmatter 增加或规范以下字段：

```yaml
locale: "zh"
availableLocales: ["zh"]
translationOf: null
translations:
  en: null
```

边界规则：

| 场景 | 处理 |
|---|---|
| `availableLocales` 缺失 | 兼容旧内容，默认 `["zh"]` |
| 英文 route 请求未翻译文章 | 进入 `notFound()`，或在 D4 第一阶段临时显示跳转到中文原文的说明页；两者必须二选一并测试 |
| 英文 Blog 列表 | 默认只展示英文可用文章；可在次级区块列出中文原创并链接到中文 canonical |
| relatedPosts 指向未翻译文章 | 英文详情页只展示英文可用 relatedPosts；中文详情页保持中文规则 |
| sitemap | 只输出 `availableLocales` 中声明可用的 locale URL |
| hreflang | 只为真实存在的语言版本输出 alternate |

## 7. Projects 语言策略

Projects 是 D4 的第一优先级，因为首页和作品页都依赖它。

建议新增结构：

```ts
type LocalizedProjectContent = {
  title: string;
  subtitle: string;
  summary: string;
  problem: string;
  solution: string;
  role: string[];
  highlights: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
};

type Project = {
  slug: string;
  updatedAt: string;
  status: ProjectStatus;
  type: ProjectType;
  stack: string[];
  featured?: boolean;
  content: Record<Locale, LocalizedProjectContent>;
};
```

迁移策略：

| 步骤 | 处理 |
|---|---|
| P1 | 保留现有 `Project` 消费方，先新增 `getProjectView(project, locale)` 适配层 |
| P2 | 将 5 个项目的中文字段迁入 `content.zh`，补齐 `content.en` |
| P3 | 首页、Projects 列表、Project 详情、JSON-LD 全部消费 view data |
| P4 | 测试 `/en/projects` 和 `/en/projects/[slug]` 不出现核心中文项目字段 |

字段边界：

| 字段 | 是否本地化 | 说明 |
|---|---|---|
| `slug` | 否 | D3 已决定中英文 slug 一致 |
| `status` | 否 | 使用 i18n status label 渲染 |
| `type` | 否 | 使用 i18n type label 渲染 |
| `stack` | 否 | 技术栈保持原文 |
| `updatedAt` | 否 | sitemap 和页面日期共用 |
| `links.label` | 是 | 中文和英文 CTA 文案不同 |
| `links.href` | 否或按 locale helper 转换 | 内链使用 `getLocalePath` |

## 8. 产品页与工具文案策略

| 页面 | D4 动作 | 边界 |
|---|---|---|
| AI 页面分析助手 | 将 `AIPageAnalysisLandingClient` 的问题卡、步骤、流水线、示例结果、日志文案抽成 locale copy | 不改 Mock Pipeline 行为 |
| Tracker | 审查所有中英文 copy，确保 route locale 初始化时无需依赖 localStorage 覆盖 | 不接真实账户或数据 |
| Labs | 梳理每个工具的输入、错误、复制反馈和空状态文案 | 不新增新工具 |
| Enter | 精修入口文案和动效提示 | 不改变交互结构 |
| About / Contact | 统一英文个人定位、可合作方向、联系方式说明 | 不引入表单后端 |

## 9. Task 拆解

### Task 1: 英文内容审计与护栏

**Files:**
- Create or modify: `tests/website-d4-english-content.test.js`
- Modify: `docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md`
- Optional create: `scripts/audit-website-english-content.mjs`

- [x] **Step 1: 增加文档和源码护栏**
  - 检查 D4 计划存在；
  - 检查 Projects、Blog、AI 页面分析被纳入范围；
  - 检查计划明确不改 `/zh/*` 和不自动跳转。

- [x] **Step 2: 增加英文 route 内容泄漏基线**
  - 至少覆盖 `/en`、`/en/projects`、`/en/projects/ai-page-analysis`、`/en/ai-page-analysis`；
  - 第一阶段可以只做 source-level 检查；
  - 第二阶段接入 Playwright HTML 检查。

- [x] **Step 3: 定义允许中文例外**
  - 技术名词、品牌名、文章原文标题可以例外；
  - 项目主体字段、CTA、metadata、JSON-LD 不应例外。

当前 Task 1 基线：

| 审计面 | 路由/文件 | 当前 CJK 基线 | 判定 |
|---|---|---:|---|
| route-surface | `/en` / `apps/website/app/en/page.tsx` | 0/0 | 已作为硬护栏 |
| route-surface | `/en/projects` / `apps/website/app/en/projects/page.tsx` | 0/0 | 已作为硬护栏 |
| route-surface | `/en/projects/ai-page-analysis` / `apps/website/app/en/projects/[slug]/page.tsx` | 0/0 | 已作为硬护栏 |
| route-surface | `/en/ai-page-analysis` / `apps/website/app/en/ai-page-analysis/page.tsx` | 0/0 | 已作为硬护栏 |
| localized-source | `apps/website/lib/projects.ts` | 1112/1200 | 源码保留中英内容；英文 ProjectView 另设 0 CJK 硬护栏 |
| localized-source | `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | 1465/1600 | 源码保留中英 copy；英文 route surface 另设 0 CJK 硬护栏 |
| project-view | `/en/projects` / `apps/website/lib/projects.ts` | 0/0 | 英文项目 view 已作为硬护栏 |
| blog-view | `/en/blog` / `apps/website/lib/blog.ts` | 0/0 | 英文 Blog override 已作为硬护栏 |

### Task 2: Projects locale-aware view

**Files:**
- Modify: `apps/website/lib/projects.ts`
- Modify: `apps/website/app/page.tsx`
- Modify: `apps/website/app/en/page.tsx`
- Modify: `apps/website/app/projects/page.tsx`
- Modify: `apps/website/app/en/projects/page.tsx`
- Modify: `apps/website/app/projects/[slug]/page.tsx`
- Modify: `apps/website/app/en/projects/[slug]/page.tsx`
- Modify: `tests/website-projects.test.js`
- Modify: `tests/website-d4-english-content.test.js`

- [x] **Step 1: 写失败测试**
  - `getProjectView(project, "en")` 返回英文 title、summary、problem、solution；
  - `/en/projects` 源码不直接消费中文项目字段；
  - Project JSON-LD 使用 locale-aware view data。

- [x] **Step 2: 新增 view helper**
  - 保留 slug、status、type、stack、updatedAt；
  - 本地化 title、subtitle、summary、problem、solution、role、highlights、limitations、nextSteps、links.label。

- [x] **Step 3: 迁移首批 5 个项目**
  - AI 页面分析助手；
  - Tracker；
  - Knock；
  - Dashboard Console；
  - Timestamp Tool。

- [x] **Step 4: 接入页面**
  - 首页 featured projects；
  - Projects 列表；
  - Project 详情；
  - sitemap 继续使用 slug 和 updatedAt；
  - JSON-LD 使用当前 locale 的 name 和 description。

### Task 3: Blog locale availability

**Files:**
- Modify: `apps/website/lib/blog.ts`
- Modify: `apps/website/app/blog/page.tsx`
- Modify: `apps/website/app/en/blog/page.tsx`
- Modify: `apps/website/app/blog/[slug]/page.tsx`
- Modify: `apps/website/app/en/blog/[slug]/page.tsx`
- Modify: `apps/website/app/sitemap.ts`
- Modify: `scripts/validate-website-content.mjs`
- Modify: `tests/website-content-validation.test.js`
- Modify: `tests/website-d3-locale-routing.test.js`
- Modify: `tests/website-d4-english-content.test.js`

- [x] **Step 1: 扩展 frontmatter 解析**
  - 支持 `locale`、`availableLocales`、`translationOf`、`translations`；
  - 旧文章缺失时默认 `locale: "zh"`、`availableLocales: ["zh"]`。

- [x] **Step 2: 增加查询 helper**
  - `getPublishedPostsForLocale(locale)`；
  - `getPostBySlugForLocale(slug, locale)`；
  - `hasPostLocale(post, locale)`。

- [x] **Step 3: 调整英文 Blog 行为**
  - 英文列表优先展示英文可用文章；
  - 未翻译中文原创不进入英文详情静态参数；
  - sitemap 只输出真实可用的英文文章 URL。

- [x] **Step 4: 调整测试预期**
  - D3 的“英文详情路由存在”改为“英文详情路由只为英文可用内容存在”；
  - 浏览器验收选择一个真实英文可用文章作为 `/en/blog/[slug]` 样本。

### Task 4: AI 页面分析助手英文客户端文案

**Files:**
- Modify: `apps/website/components/landing/ai-page-analysis-landing-client.tsx`
- Modify: `apps/website/app/ai-page-analysis/page.tsx`
- Modify: `apps/website/app/en/ai-page-analysis/page.tsx`
- Modify: `apps/website/lib/i18n.ts` or create a dedicated copy module
- Modify: `tests/website-d4-english-content.test.js`
- Modify: `tests/website-browser-static.spec.ts`

- [x] **Step 1: 抽离 copy**
  - problems；
  - steps；
  - pipeline stages；
  - sample issues；
  - logs；
  - empty、loading、retry、low-confidence 状态。

- [x] **Step 2: route locale 输入**
  - 中文页面传入 `locale="zh"`；
  - 英文页面传入 `locale="en"`；
  - 客户端不依赖 localStorage 覆盖 route locale。

- [x] **Step 3: 浏览器验收**
  - `/en/ai-page-analysis` 首屏、步骤卡、结果区不出现中文主体文案；
  - 中文页面保持现有表达。

### Task 5: 英文首页与信息页精修

**Files:**
- Modify: `apps/website/lib/i18n.ts`
- Modify: `tests/website-home-refinement.test.js`
- Modify: `tests/website-d4-english-content.test.js`

- [x] **Step 1: 精修首页定位**
  - 英文 hero 不只翻译“全栈开发者”，要说明 AI tools、content systems、dashboards、product prototypes；
  - CTA 与当前站点主线一致。

- [x] **Step 2: 精修信息页**
  - About 强化背景、工作方式、能力范围；
  - Contact 明确合作方向和边界；
  - Enter 保持简洁入口，不写使用说明式文案。

- [x] **Step 3: metadata 对齐**
  - 页面 title 和 description 与可见内容一致；
  - OG/Twitter fallback 保持 `/og.png`，后续再做专属图。

### Task 6: D4 浏览器与发布验收

**Files:**
- Modify: `tests/website-browser-static.spec.ts`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Modify: `docs/website/D4_ENGLISH_CONTENT_REFINEMENT_PLAN.md`

- [x] **Step 1: 扩展 Playwright route 样本**
  - `/en`；
  - `/en/projects`；
  - `/en/projects/ai-page-analysis`；
  - `/en/ai-page-analysis`；
  - 一个英文可用 Blog 详情页。

- [x] **Step 2: 增加内容质量断言**
  - 关键标题和 CTA 为英文；
  - Project detail 的 problem / solution 为英文；
  - JSON-LD name / description 为英文；
  - console error 继续为空。

- [x] **Step 3: 更新发布 checklist**
  - 触及 English content、Projects、Blog locale availability 时必须跑 D4 内容测试；
  - 触及可见文案时必须跑 browser verifier。

## 10. 边界条件

| 场景 | 处理 |
|---|---|
| 英文翻译缺失 | 不生成英文详情页，或显示明确跳转中文原文的降级页；不能同时含糊处理 |
| 英文 copy 缺字段 | build 或测试失败，不在页面显示中文 fallback |
| 技术栈为英文 | 不需要翻译，如 Next.js、TypeScript、Tailwind CSS |
| 项目链接是站内路径 | 渲染时按 route locale 转换到 `/en/*` |
| 项目链接是外链 | 保持原 URL，label 本地化 |
| 文章 slug 中文 | 中文路由继续支持；英文可用内容建议使用英文 slug |
| sitemap | 只输出真实可用的 locale URL |
| hreflang | 只输出真实存在的语言版本 |
| 浏览器偏好为英文但访问中文 URL | 不自动跳转，仍以 URL locale 为准 |
| 浏览器偏好为中文但访问 `/en/*` | 不覆盖英文 route locale |

## 11. 验收命令

| 场景 | 命令 | 通过标准 |
|---|---|---|
| 文档和源码测试 | `npm test` | D4 文档、Projects view、Blog locale、SEO 护栏通过 |
| 内容校验 | `npm run validate:website-content` | locale frontmatter、cover alt、series、relatedPosts 合法 |
| 构建 | `npm run build:website` | 中英文公开入口和可用详情页成功静态生成 |
| 静态入口 | `npm run verify:website-static` | locale route matrix 与实际 HTML 入口一致 |
| 浏览器验收 | `npm run verify:website-browser` | 英文关键页面无 console error，语言切换和内容质量断言通过 |
| whitespace | `git diff --check` | 无 whitespace error |

## 12. 完成定义

| 编号 | 标准 |
|---|---|
| D4.1 | 英文内容质量测试存在，并覆盖 Projects、Blog、AI 页面分析助手 |
| D4.2 | Projects 数据通过 locale-aware view 输出，中英文页面主体内容一致符合 route locale |
| D4.3 | `/en/projects` 和 `/en/projects/[slug]` 的 visible content、metadata、JSON-LD 使用英文项目内容 |
| D4.4 | Blog 有明确 locale availability 规则，未翻译文章不会被 sitemap 当作英文内容收录 |
| D4.5 | `/en/ai-page-analysis` 客户端主体文案为英文 |
| D4.6 | 英文首页和信息页文案完成一次人工级精修，并有源码测试护栏 |
| D4.7 | `npm test`、`npm run validate:website-content`、`npm run build:website`、`npm run verify:website-static`、`npm run verify:website-browser`、`git diff --check` 全部通过 |

## 13. 推荐实施顺序

| 顺序 | 任务 | 原因 |
|---:|---|---|
| 1 | Task 1 英文内容审计与护栏 | 先建立边界，避免继续扩大中英混合内容 |
| 2 | Task 2 Projects locale-aware view | 首页、Projects、Project 详情、JSON-LD 都依赖项目数据，收益最高 |
| 3 | Task 4 AI 页面分析助手英文客户端文案 | 这是最重要的产品化页面，应避免英文 route 展示中文 Demo |
| 4 | Task 5 英文首页与信息页精修 | 在项目数据英文可用后，首页表达才完整 |
| 5 | Task 3 Blog locale availability | 影响 sitemap、详情页静态参数和浏览器样本，改动最大，单独执行更稳 |
| 6 | Task 6 D4 浏览器与发布验收 | 最后把内容质量纳入 release checklist |

## 14. D4 不做事项

| 不做 | 原因 |
|---|---|
| 不自动机器翻译并发布 | 私人网站代表个人表达，自动翻译质量不可控 |
| 不新增 CMS | 当前内容规模适合 git-based workflow |
| 不新增 `/zh/*` | D3 已明确中文根路径是 canonical |
| 不做基于地区或浏览器语言的自动跳转 | 会破坏缓存、SEO 和用户预期 |
| 不同时重构视觉系统 | D4 聚焦语言和内容质量，视觉精修可作为 D5 |
| 不新增商业化功能 | 英文内容可信度比新功能更优先 |
