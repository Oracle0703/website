# 博客系统规格文档（内容模型与规范 P0）

## 目标
为博客内容建立最小可用且可扩展的数据规范，确保列表页与详情页可稳定依赖。

## 适用范围
仅覆盖“内容模型与规范”层面，不涉及渲染、路由或代码实现。

## 目录结构
- 内容根目录：`/content/blog/`
- 单篇文章：一个 `.mdx` 文件
- 建议命名：`YYYY-MM-DD-slug.mdx`

## Frontmatter 规范
**必填字段**
- `title`: string，文章标题
- `slug`: string，URL 唯一标识（允许中文）
- `date`: string，发布日期，格式 `YYYY-MM-DD`
- `updatedAt`: string，最后更新日期，格式 `YYYY-MM-DD`（未更新可与 `date` 相同）
- `summary`: string，列表页摘要
- `cover`: string | object，封面图路径或封面图对象（见下方规范）
- `author`: string，作者显示名

**选填字段**
- `tags`: string[]，自由输入标签（如 `['nextjs','个人站']`）
- `category`: string，单一分类（可选，P1）
- `status`: enum，`draft` | `published` | `archived` | `scheduled`（可选，P1）
- `publishDate`: string，定时发布时间（仅当 `status=scheduled`，格式 `YYYY-MM-DDTHH:mm:ss`）
- `draft`: boolean，默认 `false`（兼容字段，若 `status` 存在，以 `status` 为准）
- `seo`: object，SEO 扩展字段（可选）
- `type`: enum，`article` | `tutorial` | `note` | `translation` | `announcement`（可选，P2）
- `relatedPosts`: string[]，相关文章 slug（可选，P2）
- `comments`: object，评论配置（可选，P2）

## 封面图对象规范（可选）
当 `cover` 为对象时，建议字段如下：
- `src`: string，图片路径
- `alt`: string，替代文本
- `width`: number，可选
- `height`: number，可选
- `blurDataURL`: string，可选

**封面图建议**
- 标准尺寸：1200x630（适配 Open Graph）
- 最大大小：≤ 500KB
- 格式：优先 WebP，其次 PNG/JPEG

**内容图建议（P1）**
- 最大宽度：800px
- 最大大小：≤ 300KB
- 建议 WebP + 响应式尺寸（如 640w/1024w/1920w）
- 建议懒加载与占位图

## SEO 对象规范（可选）
- `description`: string，120–160 字符
- `keywords`: string[]，3–5 个
- `noindex`: boolean，默认 `false`
- `canonical`: string，可选，默认当前 URL
- `ogImage`: string，可选，默认使用 `cover`

## 数据校验与类型定义（P0）
- 实现阶段提供 `types/blog.ts` 或 `schemas/blog-frontmatter.json`
- 校验重点：必填字段、日期格式、状态枚举、`publishDate` 与 `status` 关联

```ts
export type PostStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface CoverImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

export interface SEOConfig {
  description: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
  ogImage?: string;
}

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  updatedAt: string;
  summary: string;
  cover: string | CoverImage;
  author: string;
  tags?: string[];
  category?: string;
  status?: PostStatus;
  publishDate?: string;
  draft?: boolean;
  seo?: SEOConfig;
  type?: 'article' | 'tutorial' | 'note' | 'translation' | 'announcement';
  relatedPosts?: string[];
  comments?: { enabled: boolean; provider?: string };
}
```

## 派生字段（自动计算）
- `wordCount`: number，字数（自动计算，不写入 frontmatter）
- `readingTime`: number，阅读时长（自动计算，不写入 frontmatter）

## 发布状态规则（P1）
- `status` 可选值：`draft` / `published` / `archived` / `scheduled`
- `scheduled` 需配合 `publishDate`
- 若 `status` 缺省则使用 `draft`，`status` 优先于 `draft`
- 仅 `published` 进入公开列表；`archived` 不展示；`scheduled` 未到时间不展示

## 状态流转与验收（P1）
### 流转规则
- `draft` → `published`：手动发布
- `draft` → `scheduled`：设置 `publishDate`
- `scheduled` → `published`：到达发布时间自动发布
- `published` → `archived`：归档
- `archived` → `published`：取消归档

### 验收标准（DoD）
- `scheduled` 未到时间不出现在列表/站点地图
- 到达 `publishDate` 后在一个构建周期内变为 `published`
- `archived` 不出现在列表/站点地图，访问页默认 `noindex`

## Slug 规则
- 必须全局唯一
- 允许中文、英文小写字母、数字、短横线
- 不允许空格与特殊符号
- URL 结构：`/blog/[slug]`
- 如含中文，保持原样并由路由进行 URL 编码

**示例**
- `my-first-post`
- `个人网站搭建`
- `nextjs-14-实践`

## 排序规则
- 默认按 `date` 倒序
- 日期相同则按文件名或标题排序（需在实现中统一）

## 校验与容错
- `status` 非 `published`（或 `draft: true`）的文章不进入公开列表
- 缺失必填字段的文章视为“无效文章”，开发期记录警告，生产环境不展示
- `date` / `updatedAt` 格式不合法视为无效文章
- `cover` 路径不存在时允许展示占位图（需在实现层处理）
- `seo.description` 建议 120–160 字符（若提供）

## 边界场景清单
### 内容相关
- 文章内容为空或仅标题
- 代码块语法错误或语言未指定
- 图片路径失效、外链失效
- MDX 组件参数错误或异常 HTML

### 数据相关
- `slug` 冲突（两篇文章相同 slug）
- `date` / `updatedAt` 格式错误
- `summary` 为空或过长
- `tags` 为空数组或缺失
- `cover` 不存在或缺少 `alt`
- `seo.description` 过长或缺失
- `publishDate` 格式错误

### 状态相关
- 全部文章为未发布（`draft`/`scheduled`/`archived`）
- `scheduled` 已过发布时间但状态未更新
- `archived` 文章被访问
- `status` 非法值

### 性能与 SEO
- 图片过大或未优化
- 文章过长或代码块过多
- 缺少 meta description 或 canonical

## 验收标准（DoD）
- 至少 2 篇样例文章符合规范
- 可明确判断一篇文章是否“有效”
- `status` 非 `published`（或 `draft`）的文章不会出现在公开列表
- `slug` 与日期规则在文档中明确
- 团队成员可按本文档独立创建文章

## 任务拆解（Spec → Task）
1) 确认目录结构与命名规则
2) 固化 frontmatter schema 与必填项
3) 明确 slug 与日期的格式规则
4) 定义无效文章处理策略
5) 准备 2 篇符合规范的样例文章

## Frontmatter 示例
```md
---
title: "个人网站搭建：从规划到落地"
slug: "个人网站搭建"
date: "2026-01-22"
updatedAt: "2026-01-22"
summary: "记录个人网站的技术选型与搭建流程。"
cover:
  src: "/images/blog/personal-site.png"
  alt: "个人网站架构图"
  width: 1200
  height: 630
author: "Your Name"
category: "技术教程"
tags: ["nextjs", "个人站", "规划"]
status: "published"
seo:
  description: "记录个人网站的技术选型与搭建流程，涵盖 Next.js 与 Tailwind CSS。"
---
```

## 博客详情页与 MDX 渲染规格（P0）

### 目标
定义详情页的访问规则、展示结构与 MDX 渲染能力，保证内容稳定可读。

### 路由与访问规则
- 路由：`/blog/[slug]`
- `status` 非 `published`（或 `draft: true`）的文章不可公开访问
- 不存在的 `slug` 返回 404

### 页面结构（最小可用）
- 标题、发布日期、更新日期
- 作者、标签
- 封面图（如有）
- 正文（MDX 渲染）
- 阅读时长（可选，P1，自动计算）

### MDX 渲染规则
- 支持标准 Markdown 语法（标题、段落、列表、引用）
- 支持代码块与行内代码
- 支持图片与链接，外链可设为新窗口打开
- 标题层级建议仅使用 `h2`/`h3`，避免与页面标题冲突

### 自定义组件范围（先定义白名单）
- 允许的组件需在文档中列出（如 `Callout`, `CodeBlock`）
- 未在白名单的组件视为无效（渲染失败需有明确提示或回退）

### 错误与空状态
- 文章解析失败时显示“内容不可用”提示
- 关键字段缺失时显示占位（如作者、封面）

### 边界场景清单
- 正文包含异常 HTML/组件
- 代码块语言未指定
- 图片路径失效
- 标题层级混乱或缺失
- `updatedAt` 早于 `date`

### 验收标准（DoD）
- 任意合法 MDX 文章可被正常渲染
- 404 与未发布访问受控
- 详情页信息完整且排版稳定
- 代码块与链接样式清晰可读
- 解析失败时有明确提示

### 任务拆解（Spec → Task）
1) 确认详情页展示字段与顺序
2) 定义 MDX 语法支持范围与白名单组件
3) 明确错误/空状态展示策略
4) 准备 1 篇含代码块与图片的样例文章

## 博客列表页规格（P0）

### 目标
定义列表页的数据来源、排序规则与展示最小信息，确保可快速浏览与进入详情。

### 路由与访问规则
- 路由：`/blog`
- `status` 非 `published`（或 `draft: true`）的文章不进入公开列表
- 列表仅展示“有效文章”

### 列表展示字段（最小可用）
- 标题
- 摘要
- 发布日期
- 更新日期（可选）
- 标签（可选）
- 封面图缩略图（可选）

### 排序与分页
- 默认按 `date` 倒序
- 初期可不分页，后续按 `N` 篇/页扩展（P1）

### 交互与状态
- 列表项可点击进入详情
- 无文章时显示空状态提示
- 数据加载失败时显示可恢复提示

### 边界场景清单
- 文章数量为 0
- 有文章但全部为未发布（`draft`/`scheduled`/`archived`）
- 摘要为空或过长
- `updatedAt` 为空

### 验收标准（DoD）
- `/blog` 可访问并正确展示文章列表
- `status` 非 `published` 的文章与无效文章不展示
- 点击列表项可进入详情页
- 空状态与错误状态清晰

### 任务拆解（Spec → Task）
1) 确认列表页展示字段与布局
2) 明确排序与去重策略
3) 定义空状态与错误状态文案
4) 准备 1 篇含标签的样例文章

## 标签、搜索与分页规格（P1）

### 目标
增强内容可发现性与可浏览性，支持按标签筛选、关键词搜索与分页浏览。

### 标签系统
**路由与页面**
- 标签聚合页：`/blog/tags`
- 标签详情页：`/blog/tags/[tag]`

**展示规则**
- 聚合页展示全部标签及文章数量
- 详情页展示该标签的文章列表（复用列表组件）

**边界场景**
- 标签为空或不存在时提示“无相关文章”
- 标签中含中文与空格（需 URL 编码）

### 分类系统（P1）
**路由与页面**
- 分类聚合页：`/blog/categories`
- 分类详情页：`/blog/categories/[category]`

**规则**
- 一篇文章仅属于一个分类
- 分类用于粗粒度导航

### 搜索
**范围与规则**
- 默认搜索字段：`title`、`summary`、`tags`
- 搜索行为：前端即时过滤或提交搜索（实现时二选一）

**交互与状态**
- 无匹配结果时显示空状态
- 搜索词保留在 URL（便于分享）

**边界场景**
- 关键词包含特殊字符或中文
- 搜索结果为空

### 分页
**规则**
- 当文章数量超过 `N` 篇启用分页（`N` 在实现时确定）
- 路由形式：`/blog/page/[page]` 或 `?page=2`（实现时二选一）

**状态**
- 当前页高亮
- 超出页数返回 404 或重定向到最后一页

### 验收标准（DoD）
- 标签聚合页可访问且显示数量
- 标签详情页仅展示对应文章
- 搜索结果准确，URL 可复用
- 分页规则明确且页码可分享

### 任务拆解（Spec → Task）
1) 确定标签页面信息结构与展示样式
2) 明确搜索范围与 URL 方案
3) 确定分页大小与路由形式
4) 补充 1 篇含多个标签的样例文章

## MDX 白名单组件清单（P0）

### 目标
控制 MDX 中可用组件范围，保证渲染一致性与安全性。

### 允许组件（P0）
- `Callout`：提示/注意/警告等区块
- `CodeBlock`：带高亮的代码块
- `Image`：统一的图片渲染组件
- `Link`：链接组件（支持外链新窗口）

### 增强组件（P1）
- `Table`：表格
- `Video`：视频嵌入
- `Embed`：外部内容嵌入
- `Mermaid`：流程图/时序图
- `Tabs`：标签页
- `Collapsible`：可折叠内容
- `FileTree`：文件树

### 高级组件（P2）
- `Chart`：图表
- `Gallery`：图片画廊
- `Timeline`：时间线
- `Comparison`：对比视图
- `InteractivePlayground`：交互式演示

### 使用规范
- 组件名需完全匹配白名单
- 组件 props 需遵循统一规范（在实现阶段定义）
- 未在白名单内的组件视为无效并回退为文本提示
- 组件参数需进行类型验证

### 验收标准（DoD）
- 白名单在文档中明确可查
- 任意未授权组件有一致的回退行为

## SEO 与元信息规格（P1）

### 目标
确保博客文章与列表页具备基础 SEO 能力，并支持社交分享预览。

### 页面级元信息
- 列表页：站点级标题与描述（如“博客 - 个人网站”）
- 详情页：使用文章 `title` 与 `summary`
- URL 与 `slug` 保持一致且稳定
- 如 frontmatter 提供 `seo` 字段，则优先使用其配置

### Open Graph / 社交分享
- `og:title`、`og:description` 使用文章数据
- `og:image` 优先使用 `cover`，无封面则使用默认图
- `og:type` 为 `article`

### 结构化数据（可选）
- 使用 JSON-LD `Article` 类型
- 至少包含 `headline`、`datePublished`、`author`

### 站点资源
- sitemap 包含 `/blog` 与所有已发布文章详情页（排除 `noindex`/`archived`/`draft`）
- RSS 包含最新文章（可选）

### 边界场景清单
- 文章缺少 `summary` 或 `cover`
- `noindex`/`archived`/`draft` 文章不应进入 sitemap/RSS

### 验收标准（DoD）
- 详情页有独立 title/description
- Open Graph 信息完整
- sitemap 与 RSS 排除 `noindex`/`archived`/`draft`

## 相关文章与评论（P2）

### 相关文章
- 手动指定：`relatedPosts` 填写 slug 列表
- 自动推荐（可选）：按 `category` > `tags` > 时间接近度排序
- 展示数量：3–5 篇

### 评论
- `comments.enabled`: 是否启用评论（默认 false）
- `comments.provider`: giscus / utterances（可选）
- 评论系统配置放在站点配置文件，可被文章级字段覆盖

### 验收标准（DoD）
- 相关文章不包含当前文章
- 评论关闭时页面无多余占位

## 性能目标（P2）
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1
- FCP ≤ 1.8s
- 图片使用 WebP，封面图延迟加载
- 代码高亮按需加载

## 交付里程碑清单

### P0 里程碑（必须交付）
- 内容模型与规范已落地，frontmatter 与目录结构稳定
- 详情页规范明确，可渲染 MDX 文章
- 列表页规范明确，可展示有效文章
- MDX 白名单组件清单确定

### P1 里程碑（重要增强）
- 标签系统、搜索与分页规范明确
- SEO 与元信息规范明确










