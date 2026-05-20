# Dashboard Content 模块设计

## 1. 目标

| 项目 | 定义 |
|---|---|
| 模块名 | Content |
| 所属系统 | `apps/dashboard-web` + `apps/dashboard-api` |
| 阶段 | Phase 2 第一阶段设计 |
| 核心目标 | 在 Dashboard 中只读展示博客内容健康度、发布状态和系列覆盖情况 |
| 关键边界 | 第一阶段不允许 Dashboard 直接编辑 MDX，不直接写仓库文件 |

Content 模块的职责是让内容运营状态进入后台视野：哪些文章已发布、哪些是草稿、哪些缺 metadata、哪些文章没有纳入系列、最近更新是否稳定。

## 2. 当前系统上下文

| 系统 | 当前职责 | 与 Content 模块关系 |
|---|---|---|
| `content/blog/*.mdx` | 博客正文与 frontmatter 源数据 | Content 模块的数据来源 |
| `apps/website/lib/blog.ts` | 解析 MDX、校验 frontmatter、过滤发布状态 | 可复用其字段规则，但不直接从 Dashboard import |
| `apps/website/lib/blog-series.ts` | 聚合 published series | Content 指标需要复用同类逻辑 |
| `apps/dashboard-api` | 读写 OSS 中的 tasks/logs/status/events/state | V1 不直接读取 repo 文件 |
| `apps/dashboard-web` | 展示 Dashboard 页面 | 新增 Content 页面或扩展现有 Content 导航 |

## 3. 第一阶段展示数据

| 数据 | 来源 | 说明 |
|---|---|---|
| `published count` | `content/blog/*.mdx` | `status: "published"` 且非 `noindex` 的文章数量 |
| `draft count` | `content/blog/*.mdx` | `status: "draft"` 或旧字段 `draft: true` 的文章数量 |
| `scheduled count` | `content/blog/*.mdx` | `status: "scheduled"` 的文章数量 |
| `archived count` | `content/blog/*.mdx` | `status: "archived"` 的文章数量 |
| `missing metadata` | frontmatter 校验 | 缺 title、slug、date、updatedAt、summary、cover、author、cover alt 等 |
| `latest posts` | `date` / `updatedAt` | 最近发布或更新的文章列表 |
| `series coverage` | `series` 字段 | 已发布文章中带 series 的比例 |
| `unassigned published posts` | `series` 字段 | 已发布但未归入系列的文章 |
| `duplicate slugs` | `slug` 字段 | 重复 slug 风险清单 |

## 4. 推荐数据快照

Dashboard 第一阶段不要在运行时扫描仓库，而是由独立脚本生成只读快照，再交给 Dashboard 展示。

| 项 | 设计 |
|---|---|
| 快照文件 | `dashboard/content-summary.json` |
| 存储位置 | OSS `dashboard/` prefix，或后续本地构建产物上传到 OSS |
| 生成时机 | 本地/CI 内容校验后生成；后续可在部署流程中自动上传 |
| 读取方式 | dashboard-api 新增只读 `GET /content/summary`，从 OSS 读取快照 |
| 更新方式 | 不通过 Dashboard 页面更新，由 repo/CI 负责生成 |

建议 JSON 结构：

```json
{
  "generatedAt": "2026-05-18T10:00:00.000Z",
  "source": {
    "root": "content/blog",
    "commit": "optional-git-sha"
  },
  "counts": {
    "published": 9,
    "draft": 4,
    "scheduled": 0,
    "archived": 0,
    "total": 13
  },
  "health": {
    "missingMetadata": 0,
    "duplicateSlugs": 0,
    "seriesCoverage": 1
  },
  "latestPosts": [
    {
      "title": "博客 SEO 基线：在 Next.js 中稳定落地",
      "slug": "blog-seo-baseline-nextjs",
      "status": "published",
      "date": "2026-02-11",
      "updatedAt": "2026-02-11",
      "series": "个人网站工程化"
    }
  ],
  "series": [
    {
      "id": "website-engineering",
      "title": "个人网站工程化",
      "publishedCount": 3,
      "slugs": ["个人网站搭建", "blog-seo-baseline-nextjs", "mdx-components-in-production"]
    }
  ],
  "issues": []
}
```

## 5. Dashboard 页面设计

| 区块 | 内容 | 空状态 |
|---|---|---|
| Summary Cards | Published、Draft、Missing metadata、Series coverage | 显示 `No content snapshot` |
| Health Panel | duplicate slugs、missing cover alt、invalid dates | 全部为 0 时显示健康状态 |
| Latest Posts | 标题、状态、日期、系列、slug | 无文章时显示空列表 |
| Series Coverage | 每个系列的文章数、第一篇、未分配文章数 | 无 series 时提示先补 frontmatter |
| Issues Table | 文件路径、字段、严重度、建议 | 无问题时隐藏或展示通过状态 |
| Snapshot Meta | generatedAt、commit、source root | 缺 commit 时显示 `not provided` |

## 6. API 草案

### 6.1 `GET /content/summary`

| 项 | 说明 |
|---|---|
| 鉴权 | 沿用 dashboard admin JWT |
| 数据源 | OSS `content-summary.json` |
| 写入 | 不支持 |
| 缓存 | 前端可按 settings 的 auto refresh 读取；服务端不需要强缓存 |

成功响应：

```json
{
  "value": {
    "generatedAt": "2026-05-18T10:00:00.000Z",
    "counts": {
      "published": 9,
      "draft": 4,
      "scheduled": 0,
      "archived": 0,
      "total": 13
    },
    "health": {
      "missingMetadata": 0,
      "duplicateSlugs": 0,
      "seriesCoverage": 1
    },
    "latestPosts": [],
    "series": [],
    "issues": []
  }
}
```

错误响应：

| 场景 | HTTP | error |
|---|---:|---|
| 快照不存在 | 404 | `content_summary_not_found` |
| OSS 读取失败 | 500 | `content_summary_read_failed` |
| 快照 schema 无效 | 500 | `content_summary_invalid` |
| 未登录 | 401 | 复用现有 auth 错误 |

## 7. 生成脚本设计

建议后续新增脚本：

```text
node scripts/content-summary.mjs
```

| 输入 | 输出 |
|---|---|
| `content/blog/*.mdx` | `dashboard/content-summary.json` |

脚本职责：

| 职责 | 规则 |
|---|---|
| 解析 frontmatter | 使用 `gray-matter`，避免字符串手写解析 |
| 复用校验规则 | 与 `apps/website/lib/blog.ts` 字段语义保持一致 |
| 统计状态 | published/draft/scheduled/archived/total |
| 检查 metadata | 输出文件路径、字段、严重度 |
| 检查 series | 统计 coverage，列出未分配 published posts |
| 检查 slug | 重复 slug 进入 issues |
| 生成 JSON | 输出稳定 schema，便于 Dashboard 渲染 |

## 8. 为什么第一阶段不直接编辑 MDX

| 原因 | 说明 |
|---|---|
| 安全 | 后台写文件涉及文件系统权限、路径穿越、防误删和审计 |
| 部署 | 内容变更需要进入 git、review、build、deploy 流程 |
| 数据职责 | 当前 dashboard-api 的持久化边界是 OSS JSON，不负责 repo 文件 |
| 冲突 | 多端编辑 MDX 容易和 git 工作区冲突 |
| 复杂度 | 直接编辑需要预览、保存草稿、发布、回滚、附件管理等一整套 CMS 能力 |

因此 V1 坚持只读展示；如果未来要编辑内容，应单独设计 Content CMS V2。

## 9. 实施顺序建议

| 顺序 | 任务 | 验证 |
|---|---|---|
| 1 | 编写 `content-summary` 生成脚本 | 输出 JSON schema 稳定 |
| 2 | 为脚本增加 node:test | 覆盖 published/draft/missing metadata/series coverage |
| 3 | dashboard-api 增加 `GET /content/summary` | API test 覆盖存在、缺失、无效快照 |
| 4 | dashboard-web 新增 `/content` 页面 | `npm run build:dashboard-web` |
| 5 | 部署流程上传快照到 OSS | 线上 Dashboard 可读 |

## 10. 验收标准

| 维度 | 标准 |
|---|---|
| 只读边界 | Dashboard 页面没有编辑、保存、发布 MDX 的入口 |
| 数据完整 | 能展示 count、latest posts、missing metadata、series coverage |
| 错误清晰 | 快照缺失、读取失败、schema 无效都有明确状态 |
| 不破坏现有模块 | tasks/logs/status/events/state API 和页面不变 |
| 可演进 | 后续可以接入 CI 上传快照，也可以扩展为 CMS V2 |

