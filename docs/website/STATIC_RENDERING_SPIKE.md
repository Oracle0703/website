# Website Static Rendering Spike

## 1. 结论

| 项目 | 结论 |
|---|---|
| 当前状态 | 中文页面位于 `app/(zh)` 根布局，英文页面位于 `app/en` 根布局；路由直接决定服务端 `<html lang>`，客户端只恢复主题偏好 |
| 构建结果 | 公开入口为 `○`；详情页保持 `●` SSG，继续由 `generateStaticParams` 生成已发布内容路径 |
| 体验边界 | 中文路由输出 `lang="zh-CN"`，`/en/**` 输出 `lang="en"`；`PreferenceBootScript` 只在 hydration 前恢复主题 |
| 验收方式 | `verify:website-static` 负责 HTML/静态资源信号，`verify:website-browser` 负责 Playwright 桌面/移动截图、console error 和偏好恢复 |
| 路由结构 | 中文继续使用既有无前缀 URL，英文继续使用 `/en` 前缀；`(zh)` route group 不会出现在公开 URL 中 |

### 1.1 2026-07 多根布局更新

站点已进入 D3 locale 路由化后的源码级收尾：顶层共享 `app/layout.tsx` 被拆为
`app/(zh)/layout.tsx` 与 `app/en/layout.tsx`，两者通过 `RootDocument` 复用主题、页头、页脚和
provider。这样静态 HTML、开发环境和生产 SSR 的文档语言都由路由决定，不需要构建后改写 HTML，
也不会再让 localStorage 中的旧语言偏好覆盖当前 URL 的语义。跨根布局切换语言时由 Next.js 执行
完整文档导航，主题偏好仍由启动脚本恢复。

## 2. 初始诊断

| 证据 | 文件 | 影响 |
|---|---|---|
| 根布局 metadata 读取 locale | `apps/website/app/layout.tsx` | `generateMetadata` 调用 `getLocale()`，触发 request 相关读取 |
| 根布局 HTML 读取 locale/theme | `apps/website/app/layout.tsx` | `<html lang>` 与 `data-theme` 依赖 cookie |
| locale 服务端读取 cookie | `apps/website/lib/i18n-server.ts` | `cookies().get(LOCALE_COOKIE)` 会让依赖它的路由动态化 |
| theme 服务端读取 cookie | `apps/website/lib/theme-server.ts` | `cookies().get(THEME_COOKIE)` 会让根布局动态化 |
| 页面主体读取 locale | `apps/website/app/**/page.tsx` | 多个页面使用 `getLocale()` 获取文案，无法直接静态化 |
| 客户端 provider 会写 cookie | `apps/website/components/language-provider.tsx`、`apps/website/components/theme-provider.tsx` | 用户偏好目前通过 cookie 持久化，并刷新 server payload |

以上是迁移前的阻塞点，用于解释为什么需要 D1.5 前置拆分和 D2 客户端偏好恢复。当前代码已经移除这些 page-level 阻塞点，历史表述不再代表当前实现状态。

初始构建基线：

| 路由类型 | build 表现 | 说明 |
|---|---|---|
| `/`、`/blog`、`/projects` 等静态入口 | `ƒ` | 根布局和页面读取 request cookie |
| `/blog/[slug]`、`/projects/[slug]` | `●` | 详情页有 `generateStaticParams`，但页面仍有 locale 读取语义 |
| `/robots.txt`、`/sitemap.xml` | `○` | 不依赖用户偏好，保持静态 |

## 3. 方案比较

| 方案 | 做法 | 优点 | 风险 | 适用时机 |
|---|---|---|---|---|
| D1 保守方案 | 保留服务端 cookie 读取，不改渲染模式 | 无体验风险，当前功能稳定 | 多数页面继续动态 `ƒ` | 已执行到 M6.5 的当前阶段 |
| D1.5 推荐路线 | 保留 cookie SSR，同时先拆出纯静态常量、内容校验、图片、sitemap、canonical、JSON-LD 等不依赖 cookie 的部分 | 收益稳定，风险低，为 D2 减少变量 | build 输出不会立刻大幅静态化 | 当前推荐 |
| D2 客户端偏好恢复 | 服务端使用默认 `zh` + 默认 theme，客户端从 cookie/localStorage 恢复偏好 | 更多页面可静态化，缓存命中更好 | hydration mismatch、主题闪烁、语言闪烁、SEO 默认语言争议 | D1.5 完成并有 Playwright/截图验证后 |
| D3 locale 路由化 | 使用 `/zh`、`/en` 或 locale segment，theme 纯客户端 | SEO 语言结构清晰，静态化空间最大 | 信息架构、导航、canonical、sitemap、旧链接迁移成本高 | 内容规模和英文内容价值足够大时 |

## 4. 推荐路线：D1.5

D1.5 的目标不是立刻让所有页面变成 `○`，而是把静态化的阻塞点收敛到少数明确文件，并避免后续继续扩大 cookie 依赖。

| 顺序 | 任务 | 文件 | 验收 |
|---|---|---|---|
| 1 | 保留当前 `getLocale()` / `getTheme()` 行为 | `i18n-server.ts`、`theme-server.ts` | 用户语言和主题刷新后仍能恢复 |
| 2 | 禁止新增非必要 server cookie 读取 | 新增测试或 review checklist | `rg "cookies\\(" apps/website` 只命中已知文件 |
| 3 | 继续完成 JSON-LD | Blog / Project 详情页 | 结构化数据不依赖 cookie 之外的运行时状态 |
| 4 | 增加 build 输出基线记录 | 文档或测试脚本 | 记录哪些路由是 `ƒ`、`●`、`○` |
| 5 | 独立设计 D2 spike | 后续计划 | 明确首屏主题、HTML lang、router.refresh、cookie/localStorage 迁移 |

## 4.1 D1.5 信息页静态化前置

| 页面 | 调整 | 说明 |
|---|---|---|
| `/about` | 页面 `generateMetadata` 使用 `defaultLocale`，正文交给 `AboutClient` 读取 `useI18n()` | 移除 page-level server cookie 读取，语言切换仍由客户端上下文生效 |
| `/contact` | 页面 `generateMetadata` 使用 `defaultLocale`，正文交给 `ContactClient` 读取 `useI18n()` | 移除 page-level server cookie 读取，避免静态信息页继续扩大 request 依赖 |

边界说明：当前根布局仍读取 `getLocale()` 和 `getTheme()`，因此这一步不是完整 D2，也不会承诺 `/about`、`/contact` 已从构建输出中变成 `○`。它的价值是先把信息页自身的 page-level server cookie 依赖移除，为后续根布局默认化和客户端偏好恢复降低变量。

## 4.2 D2 最小偏好恢复 spike

| 项目 | 调整 | 边界 |
|---|---|---|
| 根布局 | `layout.tsx` 使用 `defaultLocale` 和 `defaultTheme`，不再导入 `i18n-server` / `theme-server` | 根布局不再主动读取 request cookie，但页面级 `getLocale()` 仍会让未迁移页面保持动态 |
| 首屏偏好（D2 历史方案） | 新增 `PreferenceBootScript`，在 hydration 前恢复语言和主题 | 当前 D3 实现已把语言交给路由根布局，脚本只恢复合法主题值 |
| 客户端状态 | `LanguageProvider` / `ThemeProvider` 挂载后读取 `localStorage` 或 cookie，并写回两者 | 挂载恢复不触发 `router.refresh()`，只有用户手动切换语言继续刷新 server payload |
| 迁移状态 | `/about`、`/contact` 已移除 page-level server cookie 读取；其他页面继续逐步迁移 | 这是 D2 最小 spike，不是全站 locale 路由化 |

该步骤的核心收益是把根布局 request cookie 依赖移除，并验证客户端偏好恢复链路。后续还需要逐步处理页面级 `getLocale()`：优先 `/projects`、`/blog`、`/labs`，再处理详情页和 `tracker` 等较重页面。

## 4.3 Projects 页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/projects` | `page.tsx` 只读取 `getAllProjects()` / `getFeaturedProjects()`，metadata 使用 `defaultLocale` | 移除 page-level server cookie 读取，页面可由静态项目数据生成 |
| `/projects` 文案 | 新增 `ProjectsClient`，通过 `useI18n()` 读取 `messages.pages.projects` 和公共返回链接文案 | 语言切换后列表页文案随客户端上下文更新，项目数据本身保持静态 |

该迁移验证了“server 组件取静态数据、client 组件取当前语言文案”的模板。`/blog` 列表页在后续迁移中沿用该结构，并额外处理 `searchParams`、日期格式和标签筛选。

## 4.4 Labs 页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/labs` | `page.tsx` 的 metadata 使用 `defaultLocale`，页面主体改为渲染 `LabsClient` | 移除 page-level `getLocale()` / `i18n-server` 依赖，页面可跟随根布局默认化进入静态输出 |
| `/labs` 文案 | 新增 `LabsClient`，通过 `useI18n()` 读取 `messages.pages.labs` 和 `messages.pages.common` | 语言切换后实验室页头与返回链接继续从客户端上下文更新 |
| `TimestampTool` | 由组件内部通过 `useI18n()` 获取当前 locale，不再接收 `locale` prop | 保持工具交互状态在客户端闭环，避免页面 server 组件为了传 locale 读取 request cookie |

该迁移把 `/labs` 对服务端语言 cookie 的依赖收敛到客户端上下文。时间戳工具仍然只在客户端读取当前时间、输入状态和剪贴板能力，静态 HTML 保留默认语言 SEO 内容，用户偏好由 D2 的 provider 恢复链路接管。

## 4.5 Blog 列表页页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/blog` | `page.tsx` 的 metadata 使用 `defaultLocale`，服务端只读取 `getPublishedPosts()` / `getPublishedSeries()` | 移除 page-level `getLocale()` / `i18n-server` 依赖，列表页主体由静态内容数据生成 |
| `/blog` 文案与日期 | 新增 `BlogClient`，通过 `useI18n()` 读取 `messages.pages.blog` 和 `messages.pages.common` | 语言切换后标题、系列区、日期格式和阅读时间文案随客户端上下文更新 |
| 标签筛选 | `BlogClient` 通过 `useSearchParams()` 读取 `tag`，并在客户端完成 tag counts、active tag 和 filtered posts | 避免 server page 接收 `searchParams` 导致路由动态化；未知 tag 会回退到全部文章 |
| 数据边界 | `page.tsx` 使用 `mapPostForList` / `mapSeriesForList` 只传列表字段 | 不把 MDX `content`、`filePath` 等详情页字段序列化进客户端列表组件 |

该迁移让 `/blog` 列表页从 request-coupled route 转为静态入口页。边界上，tag query 不再生成独立静态 HTML，而是在同一个静态页面内由客户端读取查询参数完成过滤；如果未来需要 `/blog/tag/[tag]` 的可索引标签页，应单独走 D3 信息架构设计。

## 4.6 Enter 页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/enter` | `page.tsx` 的 metadata 使用 `defaultLocale`，页面主体继续渲染既有 `EnterClient` | 移除 page-level `getLocale()` / `i18n-server` 依赖，入口页不再因为 metadata 读取 request cookie 动态化 |
| `/enter` 文案 | `EnterClient` 已通过 `useI18n()` 读取 `messages.enter` 和 `messages.pages.common` | 语言切换、主题切换、键盘返回和动效导航仍保持客户端闭环 |

该迁移是 D2 中最小的一类页面：主体本来已经 client 化，静态化阻塞只来自 metadata 的服务端 locale cookie 读取。完成后 `/enter` 可与 `/about`、`/contact`、`/projects`、`/blog`、`/labs` 一样使用默认 SEO 语言生成静态 HTML，再由 provider 恢复用户偏好。

## 4.7 Tracker 页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/tracker` | `page.tsx` 的 metadata 使用 `defaultLocale`，页面主体改为渲染 `TrackerClient` | 移除 page-level `getLocale()` / `i18n-server` 依赖，产品规则页可静态生成 |
| `/tracker` 内容 | `trackerContent` 移入 `TrackerClient`，通过 `useI18n()` 的 locale 选择中英文规则、公告和示例数据 | 语言切换后页面标题、规则内容、表格、公告和返回链接随客户端上下文更新 |
| 客户端边界 | `AnnouncementTicker` 已是 client 组件，迁移后仍由 `TrackerClient` 统一管理展示数据 | 不引入 server request 读取，也不改变当前示例数据和规则表达 |

该迁移把打卡平台的展示型规则页从动态 SSR 入口变为静态入口页。当前页面仍是 mock 数据展示，不接入真实签到状态；未来如果接入用户数据，需要单独拆分“公开静态规则页”和“登录后的动态打卡应用”。

## 4.8 首页页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| `/` 首页 | `page.tsx` 的 metadata、JSON-LD 和首屏数据使用 `defaultLocale` 生成 | 移除 page-level `getLocale()` / `i18n-server` 依赖，让首页可以静态生成 |
| `HomePageClient` | 继续通过 `useI18n()` 读取 `messages.home`、`messages.pages.common` 和 `messages.pages.projects.status` | 语言切换后首页主文案、入口卡片和项目状态标签随客户端上下文更新 |
| 项目状态 | server component 只传 `ProjectStatus` key，client component 再映射本地化 label | 避免在默认语言静态 HTML 中提前固化项目状态文案，同时保留类型边界 |

该迁移把首页从动态入口转为静态入口。服务端仍负责读取博客、系列和精选项目这些构建期内容数据；所有用户偏好相关文案都在 `HomePageClient` 内根据 provider 当前语言恢复。边界上，搜索引擎抓取到的是默认语言首页，用户切换语言后的 UI 文案由客户端即时更新。

## 4.9 详情页页面级迁移

| 页面 | 调整 | 说明 |
|---|---|---|
| Blog 详情页 `/blog/[slug]` | metadata 使用 `defaultLocale`，server component 保留静态参数、MDX 编译、相关文章和 JSON-LD，页面 UI 交给 `BlogDetailClient` | 移除详情页 page-level `getLocale()` / `i18n-server` 依赖，日期、目录标题、系列导航、CTA 和返回链接由客户端语言上下文恢复 |
| Project 详情页 `/projects/[slug]` | metadata 使用 `defaultLocale`，server component 保留 `generateStaticParams`、项目查找和 SoftwareApplication JSON-LD，页面 UI 交给 `ProjectDetailClient` | 状态、类型、章节标题和返回链接通过 `useI18n()` 在客户端本地化 |
| 数据边界 | Blog server 仍传已编译 MDX children 与静态文章关系数据，Project server 传单个静态项目对象 | 不把 `fs`、MDX 编译、内容扫描或 JSON-LD 生成移入客户端 bundle |

该迁移把详情页的“内容生成”和“偏好文案恢复”拆开：SEO、canonical、JSON-LD 和内容实体仍由构建期数据决定；用户语言偏好只影响页面 chrome 文案、日期格式、项目状态和导航标签。详情页仍然依赖 `generateStaticParams` 输出已发布文章和项目路径，未发布文章继续走 `notFound()`。

## 5. D2 边界条件

如果后续进入 D2，必须先满足以下条件：

| 边界 | 要求 |
|---|---|
| hydration | 不允许出现 React hydration warning |
| 主题首屏 | 默认 theme 到用户偏好恢复过程不能出现明显背景/文字闪烁 |
| HTML lang | 每个路由的服务端 HTML 必须与其 locale 精确一致，客户端不得覆盖当前 URL 的语言语义 |
| SEO | 搜索引擎抓取到的默认语言内容必须完整，不依赖客户端切换才能看到主内容 |
| 旧 cookie | 已存在的 `LOCALE_COOKIE`、`THEME_COOKIE` 需要兼容或迁移 |
| 用户操作 | 切换语言后是否还需要 `router.refresh()` 必须重新评估 |
| 截图验证 | 至少验证桌面和移动端首页、博客页、文章页、Projects 页 |

## 5.1 D2 静态入口验收

| 验收项 | 命令 | 说明 |
|---|---|---|
| 本地生产构建验收 | `npm run build:website` 后执行 `npm run verify:website-static` | 脚本会启动 `next start`，检查首页、博客页、Projects 页、Labs 页、AI 页面分析页、About、Contact、Enter、Tracker 的 HTML 基线；默认 `4321` 被占用时会自动尝试后续端口 |
| 外部预览地址验收 | `NEXT_STATIC_VERIFY_BASE_URL=https://example.com npm run verify:website-static` | 复用同一套检查验证部署预览地址，不启动本地 server |
| 指定本地端口验收 | `NEXT_STATIC_VERIFY_PORT=4325 npm run verify:website-static` | 显式端口被占用时直接报 `EADDRINUSE`，避免误连已有服务或静默切换到非预期端口 |
| 浏览器级视觉验收 | `npm run verify:website-browser` | Playwright 使用生产构建，覆盖桌面/移动两档，检查公开入口清单、Blog 详情页和 Project 详情页的 console error、语言/主题 DOM 恢复和截图基线；默认 `4323` 被占用时会自动尝试后续端口 |
| 指定浏览器验收端口 | `WEBSITE_BROWSER_VERIFY_PORT=4327 npm run verify:website-browser` | 显式端口被占用时直接报 `EADDRINUSE`；该端口会同时注入 Playwright `baseURL` 和 `webServer.url` |

该验收覆盖双语静态入口，并与 `PUBLIC_WEBSITE_LOCALE_ROUTES` 的公开入口清单保持一致：每个入口必须返回 200，中文路由的 `<html lang>` 必须为 `zh-CN`，英文路由必须为 `en`，同时保留 `data-theme`、主题恢复脚本中的 `localStorage` 与 `document.documentElement.dataset.theme` 信号，并扫描 HTML 与 Next 静态脚本中是否出现常见 hydration warning 签名。本地运行时脚本会优先使用 `NEXT_STATIC_VERIFY_PORT` 或默认 `4321`，默认端口占用时自动向后寻找可用端口；只有用户显式指定端口时才把占用视为失败。它不能替代 Playwright 截图验收；如果后续要验证“是否有肉眼可见闪烁”，仍应补浏览器截图或 trace。

Playwright 验收是 D2 的第二层质量门：它不进入默认 `npm test`，避免日常单元测试变慢；需要确认桌面/移动首屏视觉、偏好恢复和浏览器 console 时单独运行。脚本通过 `scripts/verify-website-browser.mjs` 先解析可用端口，再把 `WEBSITE_BROWSER_VERIFY_PORT` 注入 Playwright 配置，避免固定 `4323` 时误连旧服务。首次建立或主动更新截图基线时使用 `npm run verify:website-browser -- --update-snapshots`，后续常规运行使用 `npm run verify:website-browser`。

## 6. D2 最小 spike 设计

| 步骤 | 动作 | 验收 |
|---|---|---|
| 1 | 建立实验分支，不与内容/SEO 改动混做 | diff 只涉及 layout/provider/i18n/theme |
| 2 | 服务端默认 `defaultLocale` 和 `defaultTheme` | build 输出中静态入口页数量增加 |
| 3 | 客户端 provider 首次 mount 读取 cookie/localStorage 并更新 DOM | 无 hydration warning |
| 4 | 语言切换时更新 cookie/localStorage，并评估是否保留 `router.refresh()` | 切换后页面文案一致 |
| 5 | 主题切换用内联启动脚本或 CSS 默认值降低闪烁 | 视觉截图稳定 |
| 6 | 跑 `npm run build:website`，比较 `ƒ`/`○`/`●` | 有明确收益再进入正式实现 |

## 7. 验证命令

| 场景 | 命令 | 通过标准 |
|---|---|---|
| 当前 spike 文档 | `npm test` | 静态化 spike 测试通过 |
| 内容与 SEO 保护 | `npm run validate:website-content` | published 内容无错误 |
| 构建基线 | `npm run build:website` | exit 0，记录 `ƒ`/`●`/`○` 输出 |
| D2 静态入口验收 | `npm run verify:website-static` | 静态入口返回 200，HTML 和脚本无常见 hydration warning 签名 |
| D2 浏览器验收 | `npm run verify:website-browser` | Playwright 桌面/移动截图稳定，页面无 console error，偏好恢复到 `en`/`dark` |
| 代码格式 | `git diff --check` | 无 whitespace error |
| 后续 D2 视觉验证 | Playwright 截图或等价浏览器验证 | 无 hydration 问题、无明显闪烁 |

## 8. 本阶段不做

| 不做 | 原因 |
|---|---|
| 不直接移除 `cookies()` | 会改变语言、主题和 metadata 行为 |
| 不立即引入 `/zh`、`/en` | D3 成本高，需独立信息架构设计 |
| 不把主题完全交给客户端 | 首屏主题闪烁风险需要截图验证 |
| 不用构建数字掩盖体验风险 | 静态化收益必须和 SEO、hydration、用户偏好一起评估 |
