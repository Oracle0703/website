# Website Release Checklist

## 1. 使用范围

| 场景 | 是否适用 | 说明 |
|---|---|---|
| 合并主站代码前 | 是 | 用于确认 Next.js 站点、内容、SEO、静态入口和偏好恢复没有回退 |
| 内容发布前 | 是 | 至少跑内容校验、构建和静态入口验收 |
| UI 或首屏改版 | 是 | 必须额外跑浏览器截图验收 |
| 服务器部署操作 | 否 | 服务器上线、Nginx、NSSM、回滚流程见 `docs/website/GO_LIVE_CHECKLIST.md` |
| D2 状态审计 | 参考 | D2 当前验收结论见 `docs/website/D2_ACCEPTANCE_REPORT.md` |

## 2. 每次必跑

| 顺序 | 命令 | 通过标准 | 失败定位 |
|---:|---|---|---|
| 1 | `npm test` | 根测试套件全部通过 | 先看失败 test 名；静态化相关失败优先检查 `PUBLIC_WEBSITE_ROUTES`、page-level cookie 读取、metadata/canonical 护栏 |
| 2 | `npm run validate:website-content` | published 内容无 error | 检查 frontmatter、cover alt、正文图片 alt、series order、draft 引用 |
| 3 | `npm run audit:website-english-content` | D4 英文 route surface 无中文主体泄漏，known-debt 不超过登记基线 | 检查 Projects view、Blog locale availability、AI 页面分析 copy 和 D4 known-debt 阈值 |
| 4 | `npm run build:website` | Next.js production build exit 0 | 类型错误先修代码；路由输出变化要确认是否符合预期 |
| 5 | `npm run verify:website-static` | 中英文公开静态入口 HTML 和 Next 静态脚本验收通过 | 如果某入口 404，检查 `PUBLIC_WEBSITE_LOCALE_ROUTES` 与实际路由；如果 hydration warning 命中，检查 provider、boot script 或 client 文案 |
| 6 | `git diff --check` | 无 whitespace error | 修正行尾空格、文件尾空行或 patch 格式问题 |

## 3. 条件必跑

| 触发条件 | 命令 | 通过标准 |
|---|---|---|
| 改动页面 UI、布局、主题、语言恢复、provider、Playwright config 或截图基线 | `npm run verify:website-browser` | 桌面/移动覆盖中文根路径、英文 `/en/*`、详情页与语言切换，console error 为空，theme 恢复为 `dark` |
| 改动 D4 English content、Projects view、Blog locale availability 或 AI 页面分析英文文案 | `npm run audit:website-english-content` + `npm run verify:website-browser` | 英文关键页面标题、CTA、Project detail、JSON-LD 语义和 visible content 与 route locale 一致 |
| 改动截图预期或视觉设计被确认接受 | `npm run verify:website-browser -- --update-snapshots` | 新截图基线符合预期，并在 review 中说明原因 |
| 改动静态入口清单、sitemap、公开页面新增/删除 | `npm test` + `npm run verify:website-static` + `npm run verify:website-browser` | `PUBLIC_WEBSITE_ROUTES` 保持中文根路径，`PUBLIC_WEBSITE_LOCALE_ROUTES`、sitemap、HTML 验收和浏览器验收保持一致 |
| 验证部署预览地址 | `NEXT_STATIC_VERIFY_BASE_URL=https://example.com npm run verify:website-static` | 远端公开入口返回 200，HTML 和静态脚本信号通过 |
| 触及 dashboard-api | `npm test -w apps/dashboard-api` | API 工作区测试通过 |
| 触及 knock | `npm run build:knock` | 只跑构建；完整 knock 测试可能受 `better-sqlite3` ABI 影响 |

## 4. 端口策略

| 命令 | 默认端口 | 显式端口 | EADDRINUSE 处理 |
|---|---:|---|---|
| `npm run verify:website-static` | `4321` | `NEXT_STATIC_VERIFY_PORT=4325 npm run verify:website-static` | 默认端口占用时自动向后寻找可用端口；显式端口占用时失败 |
| `npm run verify:website-browser` | `4323` | `WEBSITE_BROWSER_VERIFY_PORT=4327 npm run verify:website-browser` | 默认端口占用时自动向后寻找可用端口；显式端口占用时失败 |

如果失败信息包含 `EADDRINUSE`：

| 场景 | 处理 |
|---|---|
| 未显式指定端口仍失败 | 检查是否连续多个端口被占用，或端口探测权限异常 |
| 显式指定端口失败 | 停掉占用该端口的旧服务，或换一个端口重新运行 |
| 怀疑误连旧服务 | 不要打开 `reuseExistingServer`；优先使用当前 wrapper，让脚本自行选择端口 |

## 5. 失败定位

| 失败点 | 优先检查 |
|---|---|
| `npm test` 中静态化护栏失败 | 是否重新引入 `cookies()`、`getLocale()`、`getTheme()` 到公开 page-level server component |
| `validate:website-content` 失败 | 对应 MDX frontmatter、图片 alt、series order、relatedPosts slug |
| `build:website` 失败 | TypeScript 类型、Next.js 路由约束、MDX 编译、动态路由参数 |
| `verify:website-static` 失败 | 公开入口 200、`<html lang>`、`data-theme`、`localStorage` boot script、hydration warning 签名 |
| `verify:website-browser` 失败 | 浏览器 console、pageerror、偏好恢复 DOM、截图差异 |
| 截图基线失败 | 先判断是否真实视觉回退；只有确认设计变化合理时才更新截图基线 |

## 6. 截图基线规则

| 规则 | 说明 |
|---|---|
| 不把截图更新当作修复 | 先确认页面行为和视觉变化合理，再更新 |
| 每次截图更新要说明原因 | 例如布局调整、文案变化、主题 token 调整 |
| 移动端和桌面端一起看 | `verify:website-browser` 覆盖 `website-mobile` 和 `website-desktop` |
| 不用截图替代静态验收 | 截图只覆盖视觉和浏览器行为，HTML/静态脚本信号仍由 `verify:website-static` 覆盖 |

## 7. 最小发布判断

| 判断项 | 要求 |
|---|---|
| 代码与内容 | 每次必跑命令全部通过 |
| 公开入口 | `PUBLIC_WEBSITE_ROUTES` 保持中文根路径；`PUBLIC_WEBSITE_LOCALE_ROUTES` 覆盖中文根路径和英文 `/en/*`，并与 sitemap、静态验收、浏览器验收一致 |
| 偏好恢复 | locale/theme 相关改动必须跑浏览器验收 |
| SEO | 新增公开页面必须有 canonical，并进入 sitemap 或明确不进入 sitemap |
| 文档 | 若新增验收流程或端口策略，需要同步 README、D2 报告或本 checklist |
