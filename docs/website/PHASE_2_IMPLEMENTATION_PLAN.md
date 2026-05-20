# Website Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将私人网站升级为“内容 + 作品 + 工程可信度”闭环的个人产品系统，第一阶段优先完成 Projects、Blog Series、首页重构。

**Architecture:** Phase 2 先在 `apps/website` 内完成静态数据模型、页面结构和内容组织，不引入数据库。Projects 与 Blog Series 使用独立 `lib` 数据模型，页面通过 App Router server components 读取，交互组件保持局部 client 化。

**Tech Stack:** Next.js 14 App Router、TypeScript、Tailwind CSS v4、MDX frontmatter、Node.js 22、npm workspaces。

---

## 0. 文件结构

| 文件 | 类型 | 责任 |
|---|---|---|
| `apps/website/lib/projects.ts` | 新增 | 定义 Project 模型、项目数据、查询函数 |
| `apps/website/app/projects/page.tsx` | 新增 | Projects 列表页 |
| `apps/website/app/projects/[slug]/page.tsx` | 新增 | Project 详情页 |
| `apps/website/lib/blog-series.ts` | 新增 | 定义 Series 模型、从 blog posts 聚合系列 |
| `apps/website/lib/blog.ts` | 修改 | frontmatter 增加可选 `series` 字段 |
| `apps/website/app/blog/page.tsx` | 修改 | 增加系列入口、分类/标签更清晰的发现结构 |
| `apps/website/app/blog/[slug]/page.tsx` | 修改 | 增加系列导航和文章末尾 CTA |
| `apps/website/app/page.tsx` | 修改 | 向首页传入精选项目和系列数据 |
| `apps/website/components/home/home-page-client.tsx` | 修改 | 首页结构改为“定位 + 精选作品 + 推荐内容” |
| `apps/website/lib/i18n.ts` | 修改 | 导航新增 Projects 文案，首页文案调整 |
| `apps/website/app/sitemap.ts` | 修改 | 增加 Projects 路由 |
| `tests/website-projects.test.js` | 新增 | 约束 Projects 首批数据、路由入口、导航和 sitemap |
| `tests/website-blog-series.test.js` | 新增 | 约束 Blog Series 元数据、聚合、页面入口和 CTA |
| `tests/website-home-refinement.test.js` | 新增 | 约束首页接入 Projects、Series 与内容作品闭环 |
| `content/blog/*.mdx` | 修改 | 为适合的文章补 `series` 元数据 |
| `docs/website/PHASE_2_REFINEMENT_STRATEGY.md` | 已新增 | 高层策略 |
| `docs/website/PHASE_2_IMPLEMENTATION_PLAN.md` | 当前文件 | 实施计划 |
| `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` | 新增 | AI 页面分析助手 V1 产品规格 |
| `docs/dashboard/CONTENT_MODULE_PLAN.md` | 新增 | Dashboard Content 只读模块设计 |
| `docs/website/PERFORMANCE_SEO_PLAN.md` | 新增 | 性能、图片、静态化、SEO 和内容校验后续计划 |

## 1. 里程碑

| 里程碑 | 产出 | 是否阻塞后续 |
|---|---|---|
| M1 Projects 基础系统 | `/projects` 与 `/projects/[slug]` 可访问，5 个项目统一展示 | 是 |
| M2 Blog Series | 博客支持系列发现和文章内系列导航 | 是 |
| M3 首页重构 | 首页串联定位、作品、内容、当前构建中 | 是 |
| M4 AI V1 设计 | 输出 AI 页面分析助手 V1 详细设计，不立即实现真实模型 | 否 |
| M5 Dashboard Content 设计 | 输出后台内容模块设计，不立即改 API | 否 |
| M6 性能与 SEO 优化 | 图片、静态化、内容校验计划 | 否 |

## 2. 当前实施状态

| 日期 | 范围 | 状态 | 验证 |
|---|---|---|---|
| 2026-05-18 | M1 Projects 基础系统 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M2 Blog Series | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M3 首页重构 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M4 AI 页面分析助手 V1 设计 | 已完成 | `git diff --check` |
| 2026-05-18 | M5 Dashboard Content 设计 | 已完成 | `git diff --check` |
| 2026-05-18 | M6 性能与 SEO 后续计划 | 已完成 | `git diff --check` |
| 2026-05-18 | M6.1 内容校验脚本 | 已完成 | `npm run validate:website-content`、`npm test` |
| 2026-05-18 | M6.2 博客封面图片优化 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M6.3 MDX 图片策略 | 已完成 | `npm run validate:website-content`、`npm test`、`npm run build:website` |
| 2026-05-18 | M6.4 sitemap lastModified 稳定化 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M6.5 canonical 覆盖测试 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M6.6 静态化方案 spike | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | M6.7 详情页 JSON-LD | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | D1.5 信息页静态化前置 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | D2 最小偏好恢复 spike | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | D2 Projects 列表页静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-18 | D2 Labs 页面静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-19 | D2 Blog 列表页静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-19 | D2 Enter 页面静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-19 | D2 Tracker 页面静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-19 | D2 首页静态化迁移 | 已完成 | `npm test`、`npm run build:website` |
| 2026-05-19 | D2 静态入口验收脚本 | 已完成 | `npm test`、`npm run verify:website-static`、`npm run build:website` |
| 2026-05-19 | D2 Playwright 浏览器验收 | 已完成 | `npm test`、`npm run verify:website-browser`、`npm run build:website` |
| 2026-05-20 | D2 Blog / Project 详情页静态化迁移 | 已完成 | `npm test`、`npm run build:website` |

---

## Task 1: Projects 数据模型

**Files:**
- Create: `apps/website/lib/projects.ts`
- Test: `npm run build:website`

- [x] **Step 1: 创建项目类型与数据**

在 `apps/website/lib/projects.ts` 中定义：

```ts
export type ProjectStatus = "concept" | "prototype" | "mvp" | "live";

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  status: ProjectStatus;
  type: "ai-tool" | "dashboard" | "infra" | "frontend-tool" | "product-system";
  summary: string;
  problem: string;
  solution: string;
  role: string[];
  stack: string[];
  highlights: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
  featured?: boolean;
};
```

首批 `projects`：

| slug | title | status | type |
|---|---|---|---|
| `ai-page-analysis` | AI 页面分析与改版方案助手 | prototype | ai-tool |
| `tracker` | 修行打卡系统 | prototype | product-system |
| `knock` | Knock 访问日志监控 | mvp | infra |
| `dashboard-console` | Dashboard Console | mvp | dashboard |
| `timestamp-tool` | 时间戳转换工具 | live | frontend-tool |

- [x] **Step 2: 增加查询函数**

在同一文件增加：

```ts
export function getAllProjects() {
  return projects;
}

export function getFeaturedProjects() {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === decodeURIComponent(slug)) ?? null;
}
```

- [x] **Step 3: 验证类型**

Run: `npm run build:website`

Expected:

```text
✓ Compiled successfully
```

允许保留当前 `<img>` warning。

---

## Task 2: Projects 列表页

**Files:**
- Create: `apps/website/app/projects/page.tsx`
- Modify: `apps/website/lib/i18n.ts`
- Modify: `apps/website/app/sitemap.ts`
- Test: `npm run build:website`

- [x] **Step 1: 在导航文案中增加 Projects**

修改 `apps/website/lib/i18n.ts`：

中文导航在 Blog 后增加：

```ts
{ href: "/projects", label: "作品" }
```

英文导航在 Blog 后增加：

```ts
{ href: "/projects", label: "Projects" }
```

- [x] **Step 2: 创建 `/projects` 页面**

页面要求：

| 区块 | 内容 |
|---|---|
| Header | eyebrow、title、description |
| Featured | featured projects 优先展示 |
| All Projects | 按状态和类型展示所有项目 |
| Back Links | 回首页、博客、实验室 |

实现约束：

| 项 | 约束 |
|---|---|
| Server component | 默认 server component，不加 `"use client"` |
| 卡片 | 使用现有 `panel-surface`、`card-interactive` 风格 |
| 状态 | concept/prototype/mvp/live 要有清晰标签 |
| 空状态 | 如果 `getAllProjects()` 为空，显示“暂无作品” |

- [x] **Step 3: sitemap 增加 `/projects`**

修改 `apps/website/app/sitemap.ts` 的 static pages：

```ts
const staticPages = ["/", "/blog", "/projects", "/labs", "/tracker", "/about", "/contact", "/enter", "/ai-page-analysis"];
```

- [x] **Step 4: 验证**

Run: `npm run build:website`

Expected:

```text
Route (app)
...
ƒ /projects
```

---

## Task 3: Project 详情页

**Files:**
- Create: `apps/website/app/projects/[slug]/page.tsx`
- Test: `npm run build:website`

- [x] **Step 1: 创建动态路由**

必须包含：

```ts
export const generateStaticParams = () => {
  return getAllProjects().map((project) => ({ slug: project.slug }));
};
```

- [x] **Step 2: 详情页结构**

详情页按以下区块渲染：

| 区块 | 字段 |
|---|---|
| Hero | title、subtitle、status、type、summary |
| Problem | problem |
| Solution | solution |
| Role | role[] |
| Stack | stack[] |
| Highlights | highlights[] |
| Limitations | limitations[] |
| Next Steps | nextSteps[] |
| Links | links[] |

边界：

| 场景 | 处理 |
|---|---|
| slug 不存在 | `notFound()` |
| links 为空 | 不展示 Links 区块 |
| limitations 为空 | 不展示 Limitations 区块 |

- [x] **Step 3: SEO metadata**

`generateMetadata` 使用 project title / summary，并设置 canonical：

```ts
canonical: toAbsoluteUrl(`/projects/${encodeURIComponent(project.slug)}`)
```

- [x] **Step 4: 验证**

Run: `npm run build:website`

Expected: 所有 project slug 在 build 输出中生成。

---

## Task 4: Blog Series 数据模型

**Files:**
- Modify: `apps/website/lib/blog.ts`
- Create: `apps/website/lib/blog-series.ts`
- Modify: selected `content/blog/*.mdx`
- Test: `npm run build:website`

- [x] **Step 1: 扩展 frontmatter 类型**

在 `BlogPostFrontmatter` 增加：

```ts
series?: {
  id: string;
  title: string;
  order: number;
};
```

校验规则：

| 字段 | 规则 |
|---|---|
| `series.id` | 非空字符串 |
| `series.title` | 非空字符串 |
| `series.order` | finite number |

无 `series` 时不影响旧文章。

- [x] **Step 2: 新建 `blog-series.ts`**

导出：

```ts
export type BlogSeries = {
  id: string;
  title: string;
  posts: BlogPost[];
};
```

函数：

```ts
export function getPublishedSeries() {
  const groups = new Map<string, BlogSeries>();
  for (const post of getPublishedPosts()) {
    if (!post.series) continue;
    const existing = groups.get(post.series.id) ?? {
      id: post.series.id,
      title: post.series.title,
      posts: []
    };
    existing.posts.push(post);
    groups.set(post.series.id, existing);
  }
  return [...groups.values()].map((series) => ({
    ...series,
    posts: series.posts.sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
  }));
}
```

- [x] **Step 3: 给现有文章补系列**

建议第一批：

| series id | title | posts |
|---|---|---|
| `website-engineering` | 个人网站工程化 | 个人网站搭建、blog seo、mdx components |
| `ai-productization` | AI 产品化实践 | eval harness、ci agent guardrails、transformersjs |
| `tracker-system` | 打卡系统设计 | 修行打卡制度、streak incentive |

- [x] **Step 4: 验证**

Run: `npm run build:website`

Expected: build 通过；draft 文章不进入 published series。

---

## Task 5: Blog 列表页增加系列入口

**Files:**
- Modify: `apps/website/app/blog/page.tsx`
- Test: `npm run build:website`

- [x] **Step 1: 读取 series**

在页面中引入：

```ts
import { getPublishedSeries } from "../../lib/blog-series";
```

渲染逻辑：

| 场景 | 展示 |
|---|---|
| series 数量 > 0 | 在文章列表前展示“专题系列” |
| series 数量 = 0 | 不展示该区块 |

- [x] **Step 2: 系列卡片内容**

每张卡片显示：

| 字段 | 来源 |
|---|---|
| title | series.title |
| count | series.posts.length |
| latest post | series.posts[0] 或按 order 的第一篇 |

不新增 `/series/[id]` 路由，第一阶段点击跳到系列第一篇文章。

- [x] **Step 3: 验证**

Run: `npm run build:website`

Expected: `/blog` build 通过。

---

## Task 6: Blog 详情页增加系列导航与底部 CTA

**Files:**
- Modify: `apps/website/app/blog/[slug]/page.tsx`
- Test: `npm run build:website`

- [x] **Step 1: 系列导航**

如果当前 post 有 `series`，展示：

| 内容 | 规则 |
|---|---|
| 系列标题 | `post.series.title` |
| 系列内文章列表 | 只展示 published posts |
| 当前文章 | 高亮 |
| 上一篇/下一篇 | 按 `series.order` |

- [x] **Step 2: 文章底部 CTA**

在相关文章后或前展示：

| CTA | 链接 |
|---|---|
| 查看作品 | `/projects` |
| 阅读更多文章 | `/blog` |
| 联系沟通 | `/contact` |

边界：

| 场景 | 处理 |
|---|---|
| 当前文章不属于系列 | 不展示系列导航 |
| 系列只有一篇 | 显示系列标题，但不显示上一/下一篇 |
| relatedPosts 为空 | CTA 仍展示 |

- [x] **Step 3: 验证**

Run: `npm run build:website`

Expected: build 通过；无类型错误。

---

## Task 7: 首页重构为内容 + 作品闭环

**Files:**
- Modify: `apps/website/app/page.tsx`
- Modify: `apps/website/components/home/home-page-client.tsx`
- Modify: `apps/website/lib/i18n.ts`
- Test: `npm run build:website`

- [x] **Step 1: 首页 server component 传入精选项目和系列**

在 `app/page.tsx` 增加：

```ts
const featuredProjects = getFeaturedProjects().slice(0, 3);
const featuredSeries = getPublishedSeries().slice(0, 3);
```

传给 `HomePageClient`。

- [x] **Step 2: 更新 `HomePageClient` props**

新增 props：

```ts
type HomeProjectItem = {
  title: string;
  subtitle: string;
  status: string;
  href: string;
};

type HomeSeriesItem = {
  title: string;
  count: number;
  href: string;
};
```

- [x] **Step 3: 首页区块调整**

顺序：

| 顺序 | 区块 |
|---|---|
| 1 | Hero：定位 + CTA |
| 2 | 当前构建中 |
| 3 | 精选作品 |
| 4 | 推荐系列 / 最新文章 |
| 5 | Labs / Tracker 简介 |
| 6 | 关于与联系 |

边界：

| 场景 | 处理 |
|---|---|
| featuredProjects 为空 | 隐藏精选作品区块 |
| featuredSeries 为空 | 使用最新文章替代 |
| latestBlogItems 为空 | 使用 i18n fallback |

- [x] **Step 4: 验证**

Run: `npm run build:website`

Expected: build 通过，首页 first load JS 不明显增加。

---

## Task 8: AI 页面分析助手 V1 设计文档

**Files:**
- Create: `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md`

- [x] **Step 1: 写 V1 范围**

V1 只做：

| 功能 | 说明 |
|---|---|
| URL 输入 | 用户输入可访问 URL |
| Brief 输入 | 用户输入业务目标、受众、当前问题 |
| 分析结果 | 结构评分、问题、建议、Backlog |
| 失败状态 | URL 不可抓取、输入不足、生成失败 |

V1 不做：

| 不做 | 原因 |
|---|---|
| 登录 | 暂不需要 |
| 历史记录 | 需要存储设计，放 V2 |
| PDF 导出 | 先验证核心分析价值 |
| 真实截图上传 | 涉及文件存储，放 V2 |

- [x] **Step 2: 写接口草案**

建议接口：

```text
POST /api/analyze
GET /api/healthz
```

`POST /api/analyze` 输入：

```json
{
  "mode": "url",
  "input": "https://example.com",
  "brief": {
    "audience": "中型团队负责人",
    "goal": "提升试用申请率",
    "problem": "首屏价值表达模糊"
  }
}
```

- [x] **Step 3: 写边界条件**

必须覆盖：

| 场景 | 响应 |
|---|---|
| URL 无法访问 | 返回 `url_unreachable` |
| 页面需要登录 | 返回 `auth_required_page` |
| 输入太短 | 返回 `input_too_short` |
| 模型超时 | 返回 `analysis_timeout` |
| 结果置信度低 | 返回结果并标记 `needs_review: true` |

---

## Task 9: Dashboard Content 模块设计文档

**Files:**
- Create: `docs/dashboard/CONTENT_MODULE_PLAN.md`

- [x] **Step 1: 定义目标**

Dashboard Content 模块只读展示：

| 数据 | 来源 |
|---|---|
| published count | `content/blog/*.mdx` |
| draft count | `content/blog/*.mdx` |
| missing metadata | frontmatter 校验 |
| latest posts | blog date |
| series coverage | `series` 字段 |

- [x] **Step 2: 定义边界**

第一阶段不允许 Dashboard 直接编辑 MDX 文件。

原因：

| 原因 | 说明 |
|---|---|
| 安全 | 后台写文件涉及权限和审计 |
| 部署 | 内容变更需要进入 git / build 流程 |
| 复杂度 | 当前 dashboard-api 数据在 OSS，不负责 repo 文件 |

---

## Task 10: 性能与 SEO 后续计划

**Files:**
- Create: `docs/website/PERFORMANCE_SEO_PLAN.md`

- [x] **Step 1: 记录待优化点**

| 项目 | 当前状态 | 目标 |
|---|---|---|
| `<img>` warning | 3 个 warning | 封面图改 `next/image` 或制定 MDX 图片策略 |
| 动态 SSR | 多数页面为 `ƒ` | 能静态的页面静态化 |
| metadata | 已有基础 SEO | Projects / Series 加 canonical |
| sitemap | 已有 blog | 增加 projects |
| 内容校验 | runtime parse | 增加独立校验脚本 |

- [x] **Step 2: 定义验证命令**

```bash
npm run build:website
npm test
```

---

## 11. 全局验收命令

每个实现里程碑至少运行：

```bash
npm test
npm run build:website
```

如果触及 dashboard-api：

```bash
npm test -w apps/dashboard-api
```

如果触及 dashboard-web：

```bash
npm run build:dashboard-web
```

如果触及 knock：

```bash
npm run build:knock
npm run build:test -w apps/knock
node --test apps\knock\.test-dist\test\auth.test.js apps\knock\.test-dist\test\parse.test.js
```

完整 `npm test -w apps/knock` 需要 Node 22 与 `better-sqlite3` ABI 匹配。

## 12. 实施边界

| 边界 | 决策 |
|---|---|
| 不新增数据库 | Phase 2 第一阶段全部静态数据和 MDX |
| 不改 dashboard-api 写内容 | Content 模块先设计，不直接编辑仓库文件 |
| 不做真实 AI 模型接入 | 先写 V1 spec，后续单独实施 |
| 不做大规模视觉重写 | 首页、Projects、Blog 先统一信息架构 |
| 不引入新 UI 库 | 沿用 Tailwind 和现有组件风格 |
