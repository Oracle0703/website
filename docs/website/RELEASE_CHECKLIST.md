# Website Release Checklist

> **生产流程与端口不可混用：当前预构建 standalone + 宝塔流程使用 `127.0.0.1:3001`；旧源码构建 + NSSM 流程使用 `127.0.0.1:3000`。一次发布的启动命令、部署脚本、健康检查和 Nginx `proxy_pass` 必须全部采用所选流程的同一端口。**

## 1. 使用范围

| 场景 | 是否适用 | 说明 |
|---|---|---|
| 合并主站代码前 | 是 | 用于确认 Next.js 站点、内容、SEO、静态入口和偏好恢复没有回退 |
| 内容发布前 | 是 | 至少跑内容校验、构建和静态入口验收 |
| UI 或首屏改版 | 是 | 必须额外跑浏览器截图验收 |
| D5 视觉、证据或转化改动 | 是 | 涉及首页、Projects、Blog detail、Contact、AI 页面分析助手时必须跑 browser verifier，并检查截图变化 |
| D6 信任资产或联系闭环改动 | 是 | 涉及 Project asset、Contact 决策、AI V1 技术规格时必须跑测试、英文审计、内容校验和浏览器验收 |
| D7 Contact API 或表单改动 | 是 | 涉及 `POST /api/contact`、Contact form、`CONTACT_SUBMISSIONS_DIR`、`CONTACT_NOTIFICATION_WEBHOOK_URL` 时必须跑测试、构建、静态验收和浏览器验收 |
| D8 Contact Operations 改动 | 是 | 涉及 Contact JSONL retention cleanup、存储目录护栏或运维脚本时必须跑测试、`contact:ops` dry run、构建和 whitespace 检查 |
| D9 AI Page Analysis API 改动 | 是 | 涉及 `/api/analyze`、AI 页面分析 schema、SSRF guard 或 Safe Mock API 前端调用时必须跑测试、英文审计、构建和 whitespace 检查 |
| D10 AI Page Analysis Capture Harness 改动 | 是 | 涉及 DNS resolve、redirect guard、HTML size limit、auth/content capture 或 `/api/analyze` capture pipeline 时必须跑测试、英文审计、构建和 whitespace 检查 |
| WeatherAPI 查询代理改动 | 是 | 涉及 `/api/query`、城市/天气/空气质量、缓存、并发、`WEATHERAPI_KEY` 或 attribution 时必须检查 server-only 密钥边界、构建、健康检查与 Nginx 日志 |
| Local-first 功能改动 | 是 | 涉及搜索、Tracker、Blog engagement、Resume/Now 或 Developer toolbox 时按 `docs/website/LOCAL_FIRST_FEATURES.md` 检查静态/本地边界与可选第三方配置 |
| 服务器部署操作 | 否 | 服务器上线、Nginx、NSSM、回滚流程见 `docs/website/GO_LIVE_CHECKLIST.md` |
| D2 状态审计 | 参考 | D2 当前验收结论见 `docs/website/D2_ACCEPTANCE_REPORT.md` |
| D4 英文内容审计 | 参考 | D4 当前验收结论见 `docs/website/D4_ACCEPTANCE_REPORT.md` |
| D5 视觉与转化验收 | 参考 | D5 当前验收结论见 `docs/website/D5_ACCEPTANCE_REPORT.md` |

## 2. 每次必跑

| 顺序 | 命令 | 通过标准 | 失败定位 |
|---:|---|---|---|
| 1 | `npm test` | 根测试套件全部通过 | 先看失败 test 名；静态化相关失败优先检查 `PUBLIC_WEBSITE_ROUTES`、page-level cookie 读取、metadata/canonical 护栏 |
| 2 | `npm run validate:website-content` | published 内容无 error | 检查 frontmatter、cover alt、正文图片 alt、series order、draft 引用 |
| 3 | `npm run audit:website-english-content` | D4 英文 route surface、ProjectView、BlogView 无中文主体泄漏，localized-source 不超过登记基线 | 检查 Projects view、Blog locale availability、AI 页面分析 copy 和 D4 localized-source 阈值 |
| 4 | `npm run build:website` | Next.js production build exit 0 | 类型错误先修代码；路由输出变化要确认是否符合预期 |
| 5 | `npm run verify:website-static` | 中英文公开静态入口、RSS、SEO 资源、安全响应头和 Next 静态脚本验收通过 | 如果某入口或资源 404，检查路由与构建产物；如果响应头缺失，检查 `next.config.js` 与反向代理配置；如果 hydration warning 命中，检查 provider、boot script 或 client 文案 |
| 6 | `git diff --check` | 无 whitespace error | 修正行尾空格、文件尾空行或 patch 格式问题 |

## 3. 条件必跑

| 触发条件 | 命令 | 通过标准 |
|---|---|---|
| 改动页面 UI、布局、主题、语言恢复、provider、Playwright config 或截图基线 | `npm run verify:website-browser` | 桌面/移动覆盖中文根路径、英文 `/en/*`、详情页与语言切换，console error 为空，theme 恢复为 `dark` |
| 改动 D4 English content、Projects view、Blog locale availability 或 AI 页面分析英文文案 | `npm run audit:website-english-content` + `npm run verify:website-browser` | 英文关键页面标题、CTA、Project detail、JSON-LD 语义和 visible content 与 route locale 一致 |
| 改动 D5 视觉 token、首页证据链、Project evidence、Contact 转化路径、Blog detail CTA 或 AI 产品页 roadmap/limitation | `npm test` + `npm run audit:website-english-content` + `npm run verify:website-browser` | D5 静态护栏通过，英文主内容无 CJK，Contact 无占位联系方式，Project detail evidence/trade-offs/roadmap 可见，AI demo 不伪装真实生产分析 |
| 改动 D6 项目资产、ProjectAsset 模型、项目截图、product mock 或公开资产路径 | `npm test` + `npm run validate:website-content` + `npm run audit:website-english-content` + `npm run verify:website-browser` | 每个项目有 screenshot/mock/diagram/doc/none 策略，mock 明确标记，none 有原因和下一步，英文 alt/caption/reason 无 CJK |
| 改动 D6 Contact 真实渠道、联系闭环决策或 D7 表单规格 | `npm test` + `npm run audit:website-english-content` + `npm run verify:website-browser` | 不出现 `example.com`、`mailto:hello` 或占位邮箱；若新增真实渠道，需要确认隐私、反垃圾、失败状态和浏览器可见文案 |
| 改动 D7 Contact API、Contact form、保存目录或通知 webhook | `npm test` + `npm run audit:website-english-content` + `npm run validate:website-content` + `npm run build:website` + `npm run verify:website-static` + `npm run verify:website-browser` | `POST /api/contact` 校验、rate limit、duplicate submit、JSONL 落盘和 `received_with_notification_failure` 状态正常；`CONTACT_SUBMISSIONS_DIR` 不指向公开目录；`CONTACT_NOTIFICATION_WEBHOOK_URL` 不在前端暴露 |
| 改动 D8 Contact Operations、retention cleanup 或 storage guard | `npm test` + `npm run contact:ops -- --check-storage` + `npm run contact:ops -- --cleanup --dry-run` + `npm run build:website` + `git diff --check` | `unsafe_storage_directory` 护栏有效；cleanup dry run 不改文件；malformed JSONL 行保留；默认 retention 为 90 天 |
| 改动 D9 AI Page Analysis API、SSRF guard、mock output schema 或前端 API 调用链 | `npm test` + `npm run audit:website-english-content` + `npm run build:website` + `git diff --check` | `/api/analyze` 只接受 URL mode；localhost、内网和 cloud metadata 被拒绝；Safe Mock API 不抓取真实网页、不调用模型、不保存历史 |
| 改动 D10 AI Page Analysis capture、DNS resolver、redirect guard、size limit 或 content extraction | `npm test` + `npm run audit:website-english-content` + `npm run build:website` + `git diff --check` | DNS 解析后复检 SSRF；redirect 每跳复检；2 MB 上限生效；登录页、内容不足、超时和不可达错误码稳定 |
| 改动 `/api/query`、WeatherAPI client、查询缓存/限流或 attribution | `npm test` + `npm run build:website` + `npm run verify:website-static` + `git diff --check` | 测试使用 mock，不要求真实 key；`WEATHERAPI_KEY` 仅服务端读取且不得进入响应或应用日志；healthz 不请求第三方；current/forecast 缓存不超过 60 分钟/24 小时；Free attribution/免责声明可见；Nginx 专用 access log 与其他日志源分别验收 |
| 改动 AI 页面分析 V1 后端规格或计划接入真实模型 | `npm test` + `npm run audit:website-english-content` | `AI_PAGE_ANALYSIS_V1_TECH_SPEC.md` 覆盖 SSRF、内网、cloud metadata、input schema、output schema、错误码和 D6 非实现边界 |
| 改动截图预期或视觉设计被确认接受 | `npm run verify:website-browser -- --update-snapshots` | 新截图基线符合预期，并在 review 中说明原因 |
| 改动静态入口清单、sitemap、公开页面新增/删除 | `npm test` + `npm run verify:website-static` + `npm run verify:website-browser` | `PUBLIC_WEBSITE_ROUTES` 保持中文根路径，`PUBLIC_WEBSITE_LOCALE_ROUTES`、sitemap、HTML 验收和浏览器验收保持一致 |
| 改动 RSS、`next.config.js` 安全头或反向代理响应头 | `npm test` + `npm run build:website` + `npm run verify:website-static` | `/rss.xml` 为合法 RSS 2.0；HSTS、nosniff、Referrer-Policy、Permissions-Policy 与 frame protection 在实际响应中存在 |
| 改动搜索、Tracker、Blog engagement、Resume/Now 或 Developer toolbox | `npm test` + `npm run build:website` + `npm run verify:website-static` + `npm run verify:website-browser` | 搜索索引仍为静态且按需加载；Tracker 导入失败不覆盖数据；工具输入不离开浏览器；评论关闭时不加载 Giscus；中英文入口、键盘路径与 canonical 正常 |
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
| `/api/query/healthz` 未就绪 | 确认 `WEATHERAPI_KEY` 设置在实际运行的宝塔/NSSM 进程环境，完整重启进程；healthz 不应通过联网请求验证 key |

## 6. 截图基线规则

| 规则 | 说明 |
|---|---|
| 不把截图更新当作修复 | 先确认页面行为和视觉变化合理，再更新 |
| 更新截图前必须看实际图 | D6 项目资产或 Contact 页面变化会影响截图，必须先确认真实视觉和文案边界合理 |
| 每次截图更新要说明原因 | 例如布局调整、文案变化、主题 token 调整 |
| 移动端和桌面端一起看 | `verify:website-browser` 覆盖 `website-mobile` 和 `website-desktop` |
| 不用截图替代静态验收 | 截图只覆盖视觉和浏览器行为，HTML/静态脚本信号仍由 `verify:website-static` 覆盖 |

## 7. WeatherAPI.com Free 发布边界

| 判断项 | 要求 |
|---|---|
| Free key | 查询功能首次上线前在 WeatherAPI.com 注册；PR、CI、评审和构建过程不要求用户提供真实 key |
| 环境变量 | 真实值只设置为服务器进程的 `WEATHERAPI_KEY`；禁止提交到 Git、写进 `.env*`/Artifact/Nginx/URL，禁止使用 `NEXT_PUBLIC_WEATHERAPI_KEY` |
| 示例文件 | `apps/website/.env.example` 只保留空的 `WEATHERAPI_KEY=` 和 server-only 说明，不填真实值 |
| 进程重启 | 新增或轮换 key 后完整重启宝塔/NSSM Node 进程，再检查 `http://127.0.0.1:<port>/api/query/healthz` |
| 健康语义 | `/api/query/healthz` 只检查本地路由/配置就绪，不请求 WeatherAPI.com、不返回 key；第三方故障不得触发整站重启循环 |
| Free 配额与缓存 | 每月调用不超过 100,000；current 缓存不超过 60 分钟，forecast 缓存不超过 24 小时 |
| 应用保护 | 每 IP：locations 20/分钟、weather 10/分钟；上游并发 4、队列 16；cache miss 预算 60/分钟、500/小时、2,500/UTC 日、75,000/UTC 月；进程内预算重启会清零，不能代替供应商控制台监控 |
| 进程模型 | 小机器只运行一个 Node 实例，不启用 cluster/PM2 多实例/多副本；横向扩容前必须把限流和配额迁移到持久、原子、共享 authority |
| Attribution | 公网页面显示 WeatherAPI.com attribution 和 Free 方案要求的免责声明 |
| Nginx 配置层级 | 从宝塔全局 Nginx 主配置入口编辑顶层 `http {}`；`log_format`、`limit_req_zone`、`limit_conn_zone` 不得放入站点 `server`/`location` |
| Nginx access log | `/api/query/` 使用仅含 `$uri` 的专用 access log，不使用 `$request`、`$request_uri` 或 `$args`；此结论只适用于该条 access log，不代表其他日志已脱敏 |
| 日志路径 | 相对路径 `logs/query-access.log` 必须通过宝塔实际 `nginx.exe -V`/prefix 或实际安装目录、启动工作目录和主配置确认，不假定绝对路径 |
| 其他日志审计 | 分别检查 Nginx `error_log`、Node stdout/stderr/异常/APM、CDN/WAF/负载均衡及其他 access log；完整 URL 若落盘，在对应层过滤/脱敏并设置保留期 |
| 外围限流 | 可选 `limit_req`/`limit_conn` 先灰度观察再启用，不替代应用缓存、并发控制或 WeatherAPI 月调用预算 |
| 生产端口 | 预构建 standalone + 宝塔为 3001，旧源码构建 + NSSM 为 3000；启动、healthz 与 `proxy_pass` 不得跨流程混用 |
| 上线实测 | 本地 healthz 就绪后，从页面完成一次 current/forecast 查询并确认出站访问；检查浏览器、响应及上述各日志源均未出现真实 key |

服务器设置与可复制 Nginx 配置见 `docs/website/DEPLOY_WINDOWS_BAOTA.md`。密钥仅在真正上线查询功能时由管理员直接填入宝塔/NSSM 环境，现在不需要提供。

## 8. 最小发布判断

| 判断项 | 要求 |
|---|---|
| 代码与内容 | 每次必跑命令全部通过 |
| 公开入口 | `PUBLIC_WEBSITE_ROUTES` 保持中文根路径；`PUBLIC_WEBSITE_LOCALE_ROUTES` 覆盖中文根路径和英文 `/en/*`，并与 sitemap、静态验收、浏览器验收一致 |
| 偏好恢复 | locale/theme 相关改动必须跑浏览器验收 |
| SEO | 新增公开页面必须有 canonical，并进入 sitemap 或明确不进入 sitemap |
| 文档 | 若新增验收流程或端口策略，需要同步 README、D2 报告或本 checklist |
| WeatherAPI 查询 | 上线前完成上一节全部边界；没有 server-only key、attribution 或完整日志审计时保持查询入口关闭 |
