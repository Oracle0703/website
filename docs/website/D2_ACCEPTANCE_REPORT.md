# Website D2 Acceptance Report

## 1. 报告结论

| 项目 | 结论 |
|---|---|
| 报告日期 | 2026-05-20 |
| D2 目标 | 移除公开页面的 page-level request cookie 读取，让公开入口静态输出，同时保留客户端语言和主题偏好恢复 |
| 当前状态 | 已完成并通过自动化验收 |
| 公开入口来源 | D2 以 `PUBLIC_WEBSITE_ROUTES` 作为中文公开入口清单；D3 扩展后以 `PUBLIC_WEBSITE_LOCALE_ROUTES` 覆盖中文根路径和英文 `/en/*` 验收 |
| 渲染模式 | 公开入口为静态输出；Blog / Project 详情页继续通过 `generateStaticParams` 生成 SSG 路径 |
| 个性化边界 | SEO HTML 使用默认语言和默认主题；用户 locale/theme 在 hydration 前后由 boot script 和 provider 恢复 |

## 2. 已完成范围

| 范围 | 完成内容 | 主要文件 |
|---|---|---|
| 根布局默认化 | 根布局不再读取 locale/theme server cookie，默认输出稳定 HTML | `apps/website/app/layout.tsx`、`apps/website/app/preference-boot-script.tsx` |
| 客户端偏好恢复 | hydration 前恢复 `<html lang>` 与 `data-theme`，provider 挂载后同步 localStorage/cookie | `apps/website/components/language-provider.tsx`、`apps/website/components/theme-provider.tsx` |
| 公开入口静态化 | 首页、Blog、Projects、Labs、Tracker、About、Contact、Enter、AI 页面分析页进入公开静态入口清单 | `apps/website/lib/public-routes.mjs`、`apps/website/lib/public-routes.ts` |
| Blog / Project 详情页 | 内容生成留在 server/SSG，页面 chrome 文案、日期和状态标签由客户端 locale 恢复 | `apps/website/app/blog/[slug]/page.tsx`、`apps/website/app/projects/[slug]/page.tsx` |
| SEO 与结构化数据 | canonical、sitemap lastModified、BlogPosting JSON-LD、SoftwareApplication JSON-LD 已有测试覆盖 | `apps/website/app/sitemap.ts`、`tests/website-jsonld-details.test.js` |
| 内容质量 | published MDX frontmatter、封面 alt、正文图片 alt、series order、draft 引用由校验脚本约束 | `scripts/validate-website-content.mjs` |
| 静态验收 | HTML 信号、偏好恢复脚本信号、Next 静态脚本 hydration warning 签名由脚本验证；D3 后覆盖中文根路径和英文 `/en/*` | `scripts/verify-website-static-entrypoints.mjs` |
| 浏览器验收 | Playwright 覆盖桌面/移动、中英文公开入口、详情页、语言切换 URL、console error、偏好恢复和截图 | `tests/website-browser-static.spec.ts` |

## 3. 验收证据

| 命令 | 覆盖范围 | 当前通过标准 |
|---|---|---|
| `npm test` | 根测试套件，覆盖公开路由、静态化护栏、SEO、内容校验、端口策略和文档约束 | 所有 `tests/*.test.js` 通过 |
| `npm run validate:website-content` | published 内容质量 | 13 个内容文件无 error |
| `npm run build:website` | Next.js 生产构建和路由输出 | build exit 0，公开入口保持静态输出 |
| `npm run verify:website-static` | D3 locale-aware 公开静态入口 HTML 与 Next 静态脚本 | 中文根路径和英文 `/en/*` 入口返回 200，无常见 hydration warning 签名 |
| `npm run verify:website-browser` | 桌面/移动浏览器用例 | 覆盖中文根路径、英文 `/en/*`、详情页和语言切换 URL；console error 为空，theme 恢复到 `dark`，截图稳定 |
| `git diff --check` | whitespace | 无 whitespace error |

## 4. 端口策略

| 验收脚本 | 默认端口 | 显式覆盖 | 占用行为 |
|---|---:|---|---|
| `npm run verify:website-static` | `4321` | `NEXT_STATIC_VERIFY_PORT=4325 npm run verify:website-static` | 默认端口被占用时自动尝试后续端口；显式端口被占用时报 `EADDRINUSE` |
| `npm run verify:website-browser` | `4323` | `WEBSITE_BROWSER_VERIFY_PORT=4327 npm run verify:website-browser` | 默认端口被占用时自动尝试后续端口；显式端口被占用时报 `EADDRINUSE` |

这两个验收脚本共用 `scripts/lib/static-verifier-port.mjs` 的端口探测逻辑，避免固定端口时误连旧服务。

## 5. 剩余风险

| 风险 | 当前处理 | 后续建议 |
|---|---|---|
| SEO 默认语言 | 搜索引擎抓取默认语言 HTML，客户端 locale 切换不改变 URL | 英文内容规模继续扩大时进入 D3 locale 路由设计 |
| hydration 边界 | 已检查 HTML、静态脚本签名和 Playwright console error | 若新增 provider 或首屏偏好逻辑，必须继续跑 `verify:website-browser` |
| 主题闪烁 | boot script 在 hydration 前恢复 `data-theme` | 如后续改主题 token 或首屏大面积背景，需要补 trace 或更细截图验证 |
| 浏览器截图维护 | 截图基线覆盖桌面/移动，但不进入默认快速测试 | UI 有意调整时用 `npm run verify:website-browser -- --update-snapshots` 更新基线 |
| 动态用户数据 | 当前 Tracker 等页面仍是公开展示型页面 | 接入真实用户数据时应拆分公开静态页和登录后动态应用 |
| 端口诊断参数 | `WEBSITE_BROWSER_VERIFY_START_PORT` 仅用于测试默认端口 fallback | 对外使用只推荐 `WEBSITE_BROWSER_VERIFY_PORT` |

## 6. D3 候选项

| 候选方向 | 触发条件 | 关键设计问题 |
|---|---|---|
| locale 路由化 | 英文内容和英文搜索价值足够高 | `/zh`、`/en` 路由结构、旧链接迁移、canonical、hreflang、sitemap 分组 |
| 主题纯客户端化 | 不再需要服务端输出任何主题默认差异 | 首屏闪烁、系统主题、用户手动选择优先级 |
| 内容索引增强 | Blog series 和 tags 需要独立 SEO 页面 | `/blog/series/[id]`、`/blog/tag/[tag]` 的静态参数、分页和 canonical |
| 部署预览验收 | CI 或预览环境开始承载验收职责 | `NEXT_STATIC_VERIFY_BASE_URL`、Playwright 预览地址模式、截图环境稳定性 |
| Lighthouse 指标化 | 工程护栏稳定后开始优化指标 | LCP 图片优先级、字体加载、bundle 拆分、移动端首屏预算 |

## 7. 后续执行建议

| 优先级 | 下一步 | 原因 |
|---|---|---|
| P1 | 将 D2 验收命令纳入发布前 checklist | 防止静态化、偏好恢复和 SEO 护栏回退 |
| P1 | 继续观察新增页面是否同步 `PUBLIC_WEBSITE_ROUTES` 与 `PUBLIC_WEBSITE_LOCALE_ROUTES` | 保持中文入口、英文入口、sitemap、静态验收、浏览器验收一致 |
| P2 | 设计 D3 locale 路由方案，但暂不实现 | 当前 D2 已满足静态化和偏好恢复目标，D3 成本更高；设计见 `docs/website/D3_LOCALE_ROUTING_DESIGN.md` |
| P2 | 为视觉改版建立更明确的截图更新流程 | 避免 Playwright 截图基线被随意更新 |

发布前执行流程见 `docs/website/RELEASE_CHECKLIST.md`。
