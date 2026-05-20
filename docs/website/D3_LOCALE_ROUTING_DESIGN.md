# Website D3 Locale Routing Design

## 1. 结论

| 项目 | 决策 |
|---|---|
| 日期 | 2026-05-21 |
| 推荐方案 | 中文保留根路径，英文新增 `/en/*` |
| 中文 URL | `/`、`/blog`、`/projects` 等现有路径继续作为中文 canonical |
| 英文 URL | `/en`、`/en/blog`、`/en/projects` 等新增英文 canonical |
| 不推荐方案 | 不把中文迁移到 `/zh/*`，不让根路径按 cookie 自动跳转 |
| 实施方式 | 先抽 locale-aware 路由与 SEO 工具，再逐步迁移公开入口、详情页、sitemap 和验收脚本 |

该方案延续 D2 的稳定基线：现有中文链接不迁移，搜索引擎继续抓取根路径中文内容；英文内容获得独立 URL、canonical、hreflang 和 sitemap 入口。客户端 `localStorage` / `LOCALE_COOKIE` 仍可用于用户偏好，但不再作为 SEO URL 的来源。

## 2. 目标与非目标

| 类型 | 内容 |
|---|---|
| 目标 | 给英文页面独立、可索引、可分享的 URL |
| 目标 | 保留旧中文链接，不制造 `/zh/*` 迁移成本 |
| 目标 | 让 canonical、hreflang、sitemap 和 `PUBLIC_WEBSITE_ROUTES` 的职责清晰 |
| 目标 | 让语言切换从“只改客户端文案”升级为“切换到对应 locale URL” |
| 非目标 | 本阶段不重写视觉设计 |
| 非目标 | 本阶段不引入数据库、CMS 或 middleware 按地区自动跳转 |
| 非目标 | 本阶段不为 tag / series 建立独立 SEO 页面，除非 D3 后续单独拆任务 |

## 3. 方案比较

| 方案 | URL 形态 | 优点 | 风险 | 结论 |
|---|---|---|---|---|
| A | 中文根路径，英文 `/en/*` | 旧链接零迁移，英文 SEO 独立，实施成本适中 | URL 不完全对称 | 推荐 |
| B | 中文 `/zh/*`，英文 `/en/*`，根路径跳转 | SEO 结构最规整，hreflang 对称 | 旧链接需要 301，canonical 和 sitemap 全面迁移 | 暂不采用 |
| C | 继续无 locale URL | 成本最低 | 英文不可独立索引，D3 价值不足 | 不采用 |

## 4. URL 矩阵

| 页面 | 中文 canonical | 英文 canonical | 说明 |
|---|---|---|---|
| 首页 | `/` | `/en` | `/en/` 规范化为 `/en` |
| Blog 列表 | `/blog` | `/en/blog` | tag query 暂不作为独立 SEO URL |
| Blog 详情 | `/blog/[slug]` | `/en/blog/[slug]` | slug 保持一致，内容语言由 route locale 决定 |
| Projects 列表 | `/projects` | `/en/projects` | 项目数据共享，页面 chrome 文案按 locale 输出 |
| Project 详情 | `/projects/[slug]` | `/en/projects/[slug]` | slug 保持一致 |
| Labs | `/labs` | `/en/labs` | 工具交互保持客户端闭环 |
| Tracker | `/tracker` | `/en/tracker` | 公开规则页静态化；真实用户数据另拆应用 |
| About | `/about` | `/en/about` | 信息页静态输出 |
| Contact | `/contact` | `/en/contact` | 信息页静态输出 |
| Enter | `/enter` | `/en/enter` | 入口动效仍为客户端 |
| AI 页面分析 | `/ai-page-analysis` | `/en/ai-page-analysis` | 产品页文案按 locale 输出 |

## 5. 路由数据模型

| 数据源 | 责任 |
|---|---|
| `PUBLIC_WEBSITE_ROUTES` | 继续表示中文根路径公开入口，保持 D2 兼容 |
| `PUBLIC_WEBSITE_LOCALE_ROUTES` | 新增 locale-aware 入口，包含 `{ locale, path, canonicalPath }` |
| `PUBLIC_WEBSITE_EN_ROUTES` | 可选派生值，用于英文 sitemap、验收和 Playwright route list |
| Blog / Project slug 数据 | 继续来自 `getPublishedPosts()` 与 `getAllProjects()`，不复制内容文件 |

建议类型：

```ts
type PublicWebsiteLocaleRoute = {
  locale: "zh" | "en";
  path: string;
  canonicalPath: string;
};
```

中文 `path` 与 `canonicalPath` 相同；英文 `path` 和 `canonicalPath` 都带 `/en` 前缀。这样 sitemap、canonical、浏览器验收和静态验收可以复用同一套矩阵。

## 6. SEO 规则

| 项目 | 规则 |
|---|---|
| canonical | 中文页 canonical 指向根路径；英文页 canonical 指向 `/en/*` |
| hreflang | 每组中英页面互相声明 `zh-CN` 与 `en` alternate；可选补 `x-default` 指向中文根路径 |
| sitemap | sitemap 同时输出中文和英文 canonical URL；Blog / Project 详情页也输出双语 URL |
| metadata | `generateMetadata` 不读 cookie，改为由 route locale 决定 messages |
| JSON-LD | `inLanguage` 跟随 route locale；实体 URL 使用当前 locale canonical |
| robots | 不屏蔽 `/en/*`，确保英文页面可索引 |

边界：如果某篇文章未来没有英文正文，仍可先输出英文 chrome + 原文内容，但必须在内容策略里标记。更严格的 D3.2 可以引入 `availableLocales`，没有英文内容的文章不生成 `/en/blog/[slug]`。

## 7. 用户偏好与语言切换

| 场景 | 行为 |
|---|---|
| 用户访问 `/blog` | 服务端输出中文 HTML，客户端初始 locale 为 `zh` |
| 用户访问 `/en/blog` | 服务端输出英文 HTML，客户端初始 locale 为 `en` |
| 用户点击语言切换 | 从当前路径切换到对应 canonical：`/blog` ↔ `/en/blog` |
| 用户已有 `localStorage.locale=en` 后访问 `/blog` | 不自动重定向；可以显示切换提示或保持中文 URL 的中文 SEO 内容 |
| 用户已有 `LOCALE_COOKIE=en` 后访问 `/blog` | 不让 cookie 影响 server metadata；cookie 只作为 UI 偏好回填 |
| `router.refresh` | D3 后语言切换优先使用 `router.push(targetLocalePath)`；`router.refresh` 不再作为语言切换主路径 |

D3 的核心变化是：route locale 优先级高于 `localStorage` 和 `LOCALE_COOKIE`。客户端偏好只能影响无明确 locale 的 UI 恢复，不能覆盖 `/en/*` 的服务端语言语义。

## 8. 旧链接与重定向

| 链接 | 处理 |
|---|---|
| 现有中文链接 `/blog`、`/projects` 等 | 保持 200，不做 301 |
| 未来误访问 `/zh/blog` | 301 到 `/blog` |
| `/en/` | 301 或规范化到 `/en` |
| `/en/blog/unknown` | 保持 `notFound()` |
| 无 locale 根路径 `/` | 保持中文首页，不按 cookie 自动跳转 |

不做基于 `Accept-Language`、IP 或 cookie 的自动跳转。原因是这会让缓存、SEO 和用户预期变复杂，也容易与 D2 静态化目标冲突。

## 9. 实施拆解

| 阶段 | 内容 | 验收 |
|---|---|---|
| D3.1 路由工具 | 增加 locale path helper、`PUBLIC_WEBSITE_LOCALE_ROUTES`、路径转换函数 | `npm test` |
| D3.2 静态入口 | 为公开入口新增 `/en/*` 页面或 route segment facade | `npm run build:website`，中文和英文入口均静态 |
| D3.3 SEO | canonical、hreflang、sitemap、JSON-LD 按 route locale 输出 | SEO 结构测试 |
| D3.4 语言切换 | `LanguageProvider` 切换语言时 push 到对应 locale URL，保留 `localStorage` / cookie 写入 | Playwright 语言切换测试 |
| D3.5 详情页 | Blog / Project 详情页生成 `/en/blog/[slug]`、`/en/projects/[slug]` | `generateStaticParams` 覆盖中英文路径 |
| D3.6 验收脚本 | `verify:website-static`、`verify:website-browser` 覆盖中英文公开入口 | HTML、hydration、截图验收通过 |

## 10. 测试与验收

| 验收项 | 命令 | 标准 |
|---|---|---|
| 路由矩阵测试 | `npm test` | `PUBLIC_WEBSITE_ROUTES` 保持中文根路径，`PUBLIC_WEBSITE_LOCALE_ROUTES` 覆盖中英文 |
| 内容校验 | `npm run validate:website-content` | 当前 published 内容继续合法 |
| 构建 | `npm run build:website` | 中文根路径和 `/en/*` 公开入口静态输出；详情页 SSG |
| 静态 HTML 验收 | `npm run verify:website-static` | 中英文入口返回 200，HTML lang、data-theme、boot script 和 hydration 签名通过 |
| 浏览器验收 | `npm run verify:website-browser` | 桌面/移动覆盖中文和英文关键入口，语言切换 URL 正确，无 console error |
| sitemap 验收 | `npm test` | sitemap 包含中文与英文 canonical URL，hreflang 数据结构可测试 |

## 11. 本阶段不做

| 不做 | 原因 |
|---|---|
| 不把中文迁移到 `/zh/*` | 旧链接迁移成本高，当前中文根路径已经稳定 |
| 不做 cookie 自动跳转 | 会破坏静态缓存和 SEO 可预测性 |
| 不按地区或浏览器语言自动跳转 | 私人网站当前不需要复杂国际化分发 |
| 不新增 CMS 字段模型 | D3 先解决 URL 和 SEO，不扩展内容管理 |
| 不立即做 tag / series SEO 路由 | 应作为 D3 后续子任务独立设计 |

## 12. 进入实现前的决策清单

| 决策 | 默认答案 |
|---|---|
| 英文 URL 是否统一无尾斜杠 | 是，使用 `/en/blog` 而不是 `/en/blog/` |
| 英文内容不足时是否仍生成英文详情页 | 第一阶段可以生成，但后续应引入 `availableLocales` |
| `x-default` 指向哪里 | 指向中文根路径 |
| 语言切换是否保留 cookie/localStorage | 保留，用于下次打开站点时提示或恢复 UI 偏好 |
| D2 验收是否继续保留 | 保留，并扩展到 locale-aware route matrix |
