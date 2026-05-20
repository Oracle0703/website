# Website Performance & SEO 后续计划

## 1. 目标

| 维度 | 当前问题 | 目标状态 |
|---|---|---|
| 构建质量 | `next build` 仍有 3 个 `<img>` warning | 主站构建 warning 可解释、可归零 |
| 图片体验 | 博客封面和 MDX 图片直接使用 `<img>` | 封面图使用 `next/image`；MDX 图片有明确策略 |
| 渲染模式 | 根布局读取 cookie，页面大多显示为动态 SSR | 保留个性化能力，同时让可静态页面尽量静态化 |
| SEO 完整性 | 基础 metadata、canonical、sitemap 已具备 | Projects、Blog、Series、静态页 metadata 策略统一 |
| 内容质量 | frontmatter 主要在运行时解析 | 增加独立内容校验脚本，提前发现无效 metadata |
| 可维护性 | 性能优化散落在页面实现中 | 建立可重复执行的检查清单和验收命令 |

本计划只定义后续优化拆解，不在当前步骤直接修改运行时代码。原因是图片替换、静态化和内容校验都会影响 build 输出或页面行为，需要单独按测试驱动方式执行。

## 2. 当前状态基线

| 项目 | 现状 | 证据文件 | 风险 |
|---|---|---|---|
| 博客列表封面 | 使用原生 `<img>` 渲染封面图 | `apps/website/app/blog/page.tsx` | 触发 Next.js 图片优化 warning，LCP/CLS 优化空间较大 |
| 博客详情封面 | 使用原生 `<img>` 渲染文章主图 | `apps/website/app/blog/[slug]/page.tsx` | 首屏大图无法利用 Next Image 的尺寸、优先级和格式优化 |
| MDX 图片组件 | `mdxComponents.img` 包装为原生 `<img>` | `apps/website/components/mdx-components.tsx` | 文章正文图片缺少统一尺寸、远程域名、安全和加载策略 |
| locale/theme | 根布局通过 `cookies()` 读取用户偏好 | `apps/website/app/layout.tsx`、`apps/website/lib/i18n-server.ts`、`apps/website/lib/theme-server.ts` | 读取 request cookie 会让页面倾向动态渲染 |
| canonical | 首页、Blog、Project、静态页已有 canonical | `apps/website/app/**/page.tsx` | 后续新增页面时容易遗漏，需要测试约束 |
| sitemap | 已包含静态页、published blog、projects | `apps/website/app/sitemap.ts` | 静态页和 projects 当前使用 `now`，每次请求会改变 lastModified |
| robots | 允许全站抓取并指向 sitemap | `apps/website/app/robots.ts` | 需要确保 Dashboard、内部 API 不被误纳入公开站点 sitemap |
| 内容状态 | `published` 文章进入页面和 sitemap | `apps/website/lib/blog.ts` | draft/scheduled/archived 边界需要独立脚本持续校验 |

## 3. 优先级路线

| 优先级 | 任务 | 修改范围 | 预期收益 | 风险 |
|---|---|---|---|---|
| P0 | 图片 warning 收敛 | Blog 列表、Blog 详情、MDX 图片组件 | 构建输出更干净，封面加载更稳定 | MDX 远程图片尺寸未知，需要策略兜底 |
| P0 | 内容校验脚本 | `scripts/`、根 `package.json`、测试或校验 fixture | 无效 frontmatter 在构建前失败 | 校验过严会影响草稿写作体验 |
| P1 | sitemap lastModified 稳定化 | `apps/website/app/sitemap.ts`、Projects 数据模型 | 减少搜索引擎误判所有页面每天更新 | Projects 需要维护 `updatedAt` 字段 |
| P1 | 静态化分层设计 | layout、theme、locale provider | 减少不必要 SSR，提高缓存命中率 | 改动涉及用户偏好，容易引入 hydration mismatch |
| P1 | metadata 测试化 | `tests/website-*.test.js` | 防止新增页面遗漏 canonical/OG | 静态文本测试容易随文案调整变脆 |
| P2 | JSON-LD 结构化数据 | Blog Article、Project、Person/ProfilePage | 提升搜索理解能力 | 结构化数据必须与页面真实内容一致 |
| P2 | 图片资产治理 | `public/`、`content/blog/*.mdx` | 控制图片体积、alt、尺寸和来源 | 需要逐篇内容清理 |

## 4. 执行拆解

### Task A：图片策略与 warning 归零

| 步骤 | 动作 | 文件 |
|---|---|---|
| A1 | 为博客封面提取 `BlogCoverImage` 组件，内部使用 `next/image` | `apps/website/components/blog-cover-image.tsx` |
| A2 | 博客列表封面使用固定 `sizes`：移动端 `100vw`，桌面卡片约 `40vw` | `apps/website/app/blog/page.tsx` |
| A3 | 博客详情页主图设置稳定宽高比例，首屏主图可设置 `priority` | `apps/website/app/blog/[slug]/page.tsx` |
| A4 | MDX 图片保留包装组件，但制定规则：本地图片优先 `next/image`，远程未知尺寸先保留原生图片并记录 warning 策略 | `apps/website/components/mdx-components.tsx` |
| A5 | 若允许远程图片，补 `next.config.js` 的 `images.remotePatterns` 白名单 | `apps/website/next.config.js` |

边界条件：

| 场景 | 处理 |
|---|---|
| `cover` 是字符串 | 默认 alt 使用文章标题，尺寸使用统一封面比例 |
| `cover` 是对象 | 使用 `cover.src` 和 `cover.alt` |
| `cover.src` 为空 | 不渲染图片容器，避免空请求 |
| 远程 URL 不在白名单 | 不使用 `next/image`，校验脚本提示需要加入白名单或下载到本地 |
| MDX 图片没有 alt | 内容校验失败；草稿可 warning，published 必须失败 |
| SVG 图片 | 允许作为普通资源，但不作为首屏主封面优先优化目标 |

验收：

| 命令 | 目标 |
|---|---|
| `npm run build:website` | 不再出现博客封面相关 `<img>` warning |
| `npm test` | 图片组件接入不破坏既有 blog/project/home 约束 |

### Task B：内容校验脚本

| 校验项 | published | draft | scheduled | archived |
|---|---|---|---|---|
| `title` | 必填 | 必填 | 必填 | 必填 |
| `summary` | 必填 | 建议 | 必填 | 建议 |
| `date` | 必填且合法日期 | 必填且合法日期 | 必填且合法日期 | 必填且合法日期 |
| `cover` | 必填且有 alt | 可缺失 | 必填且有 alt | 可缺失 |
| `tags` | 至少 1 个 | 可空 | 至少 1 个 | 可空 |
| `category` | 必填 | 建议 | 必填 | 建议 |
| `series.order` | 如果存在则必须为有限数字 | 同 published | 同 published | 同 published |
| `seo.canonical` | 如存在必须是绝对 URL | 同 published | 同 published | 同 published |
| `relatedPosts` | slug 必须存在且不能指向自身 | warning | warning | warning |

建议实现：

| 文件 | 责任 |
|---|---|
| `scripts/validate-website-content.mjs` | 读取 `content/blog/*.mdx`，解析 frontmatter，输出错误和 warning |
| `tests/website-content-validation.test.js` | 用 Node test 约束脚本核心规则或直接运行校验 |
| `package.json` | 增加 `validate:website-content`，并考虑纳入根 `npm test` |

边界条件：

| 场景 | 处理 |
|---|---|
| 中文 slug | 允许，但 sitemap 和页面链接必须 `encodeURIComponent` |
| 未来 scheduled 文章 | 未到发布时间不进入 `getPublishedPosts()` 与 sitemap |
| draft 被 relatedPosts 引用 | published 文章引用 draft 应报错，draft 引用 draft 可 warning |
| 同系列 order 重复 | published 文章中同 series 重复 order 报错 |
| 文件名日期与 frontmatter 日期不一致 | warning，不阻塞；后续可升级为 error |

### Task C：sitemap 与 metadata 稳定化

| 项目 | 当前 | 调整 |
|---|---|---|
| 静态页 `lastModified` | 使用 `now` | 使用固定站点更新时间或按代码变更不可得时省略 |
| Projects `lastModified` | 使用 `now` | Project 模型新增 `updatedAt`，sitemap 使用该字段 |
| Blog `lastModified` | 使用 `updatedAt` 或 `date` | 保持现状 |
| canonical | 多数页面已有 | 增加测试确保公开页面都有 canonical |
| OG image | 默认 `/og.png` | Blog/Project 支持各自 og image，缺失时回退默认图 |

公开页面 canonical 矩阵：

| 路由 | canonical |
|---|---|
| `/` | `toAbsoluteUrl("/")` |
| `/blog` | `toAbsoluteUrl("/blog")` |
| `/blog/[slug]` | `toAbsoluteUrl("/blog/{encodedSlug}")` |
| `/projects` | `toAbsoluteUrl("/projects")` |
| `/projects/[slug]` | `toAbsoluteUrl("/projects/{encodedSlug}")` |
| `/labs` | `toAbsoluteUrl("/labs")` |
| `/tracker` | `toAbsoluteUrl("/tracker")` |
| `/about` | `toAbsoluteUrl("/about")` |
| `/contact` | `toAbsoluteUrl("/contact")` |
| `/enter` | `toAbsoluteUrl("/enter")` |
| `/ai-page-analysis` | `toAbsoluteUrl("/ai-page-analysis")` |

### Task D：静态化分层

当前动态化主要来自根布局读取 `locale` 与 `theme` cookie。优化方向不是移除用户偏好，而是把默认静态内容和客户端偏好恢复分层。

| 方案 | 做法 | 优点 | 风险 |
|---|---|---|---|
| D1 保守方案 | 保留 cookie SSR，先只做图片和内容校验 | 改动最小 | 页面仍多为动态 SSR |
| D2 中间方案 | 服务器默认 `zh` + 默认 theme，客户端 provider 从 cookie/localStorage 恢复 | 可让更多页面静态化 | 首屏可能有语言或主题闪烁 |
| D3 路由方案 | 用 `/zh`、`/en` 或 middleware 处理 locale，theme 纯客户端 | SEO locale 更清晰 | 信息架构和链接成本较高 |

推荐先执行 D1，再单独评估 D2。D2 必须满足：

| 验收项 | 标准 |
|---|---|
| 无明显主题闪烁 | 首屏背景和文字色稳定 |
| HTML lang 正确 | 默认语言和客户端切换后语义不冲突 |
| 搜索可抓取 | 默认语言内容可完整抓取 |
| 用户偏好保留 | 刷新后 locale/theme 能恢复 |
| build 输出改善 | 至少静态内容页不再全部依赖 request cookie |

### Task E：结构化数据

| 页面 | Schema | 数据来源 |
|---|---|---|
| 首页 | `ProfilePage` 或 `Person` | i18n 站点文案 |
| Blog 详情 | `Article` / `BlogPosting` | `BlogPost` frontmatter |
| Projects 详情 | `CreativeWork` 或 `SoftwareApplication` | `Project` 模型 |
| AI 页面分析助手 | `SoftwareApplication` | landing 文案和产品 spec |

边界条件：

| 场景 | 处理 |
|---|---|
| 草稿文章 | 不输出结构化数据 |
| 缺少封面 | 不输出 `image` 或使用默认 OG 图 |
| 作者信息 | 保持与页面展示作者一致 |
| 日期 | 使用 ISO 字符串，避免本地化格式进入 JSON-LD |

## 5. 建议实施顺序

| 顺序 | 任务 | 原因 | 是否需要代码测试 |
|---|---|---|---|
| 1 | Task B 内容校验脚本 | 先建立护栏，后续改图片和 metadata 不会漏内容问题 | 是 |
| 2 | Task A 博客封面 `next/image` | 直接消除可见 build warning | 是 |
| 3 | Task C sitemap / metadata 测试化 | 防止 SEO 基线回退 | 是 |
| 4 | Task A 的 MDX 图片策略 | MDX 图片尺寸和远程域名边界较多，单独处理 | 是 |
| 5 | Task D 静态化分层评估 | 影响布局和偏好恢复，需要独立验证；spike 见 `docs/website/STATIC_RENDERING_SPIKE.md` | 是 |
| 6 | Task E JSON-LD | 增强项，必须基于稳定 metadata | 是 |

## 6. 验证命令

| 场景 | 命令 | 通过标准 |
|---|---|---|
| 文档或计划更新 | `git diff --check` | 无 whitespace error |
| 内容校验脚本 | `npm run validate:website-content` | published 内容无 error |
| 根测试 | `npm test` | `tests/*.test.js` 全部通过 |
| 主站构建 | `npm run build:website` | exit 0，新增 warning 必须解释 |
| 图片 warning 验收 | `npm run build:website` | 博客和 MDX 相关 `<img>` warning 消失或被策略明确保留 |

## 7. 完成定义

| 阶段 | 完成标准 |
|---|---|
| M6.1 | 已完成：内容校验脚本存在，并纳入独立校验命令与根测试 |
| M6.2 | 已完成：博客列表和详情页封面使用统一 `BlogCoverImage` 组件 |
| M6.3 | 已完成：MDX 图片组件使用 `next/image`，正文图片 alt 纳入内容校验，构建 `<img>` warning 归零 |
| M6.4 | 已完成：sitemap 静态页不再使用运行时 `now`，projects 使用项目 `updatedAt` |
| M6.5 | 已完成：公开页面 canonical 有测试覆盖，公开路由清单由 sitemap 复用 |
| M6.6 | 已完成：静态化方案完成 spike，推荐继续 D1.5，再单独执行 D2 客户端偏好恢复验证 |
| M6.7 | 已完成：Blog 详情页输出 `BlogPosting` JSON-LD，Project 详情页输出 `SoftwareApplication` JSON-LD，并由详情页结构测试覆盖 |

## 8. 不做事项

| 不做 | 原因 |
|---|---|
| 立即重构 locale 路由 | 影响所有导航和 SEO 路径，需要单独设计 |
| 立即引入图片 CDN | 当前图片规模小，先用 Next 内置能力 |
| 立即做 Lighthouse 追分 | 先消除明确工程问题，再做指标优化 |
| 让 Dashboard 直接编辑 SEO 字段 | 内容写入仍需经过 git/build 流程 |
| 为所有页面强行加 JSON-LD | 结构化数据必须真实、稳定，避免低质量标记 |
