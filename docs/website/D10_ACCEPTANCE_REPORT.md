# Website D10 AI Page Analysis Capture Harness Acceptance Report

> Historical acceptance record: current production behavior is default-off, address-pinned capture as documented in `AI_PAGE_ANALYSIS_SECURITY_BOUNDARY.md`. The D10 result below predates that hardening.

## 1. Scope

| 项目 | 结论 |
|---|---|
| DNS resolve | capture 前解析 hostname，并对解析出的 IP 复跑 SSRF guard |
| Redirect guard | 最多 3 次 redirect，每次重新校验协议、host 和解析 IP |
| Fetch harness | 新增可注入 fetcher；默认 fetch 不发送 cookie、Authorization 或用户自定义 header |
| Size limit | HTML 上限 2 MB，超过返回 `page_too_large` |
| Auth page | HTTP 401/403 或 password/login 信号返回 `auth_required_page` |
| Content extraction | 提取 title 和正文摘要；正文不足返回 `insufficient_page_content` |
| API pipeline | `/api/analyze` 成功 capture 后仍返回 Safe Mock API 结果，但 `source.title` 使用 capture title |
| 非目标 | 不接真实模型、不做截图、不保存历史、不做队列、不引入浏览器爬虫 |

## 2. Error Mapping

| 场景 | 错误码 | HTTP |
|---|---|---:|
| DNS 解析为空或失败 | `url_unreachable` | 422 |
| DNS 解析到内网或 metadata | `invalid_url` | 400 |
| redirect 到非 HTTP/HTTPS、内网或 metadata | `invalid_url` | 400 |
| redirect 超过 3 次 | `url_unreachable` | 422 |
| HTTP 401/403 或登录页信号 | `auth_required_page` | 422 |
| HTML 超过 2 MB | `page_too_large` | 413 |
| HTML 正文不足 | `insufficient_page_content` | 422 |
| timeout-like 错误 | `capture_timeout` | 504 |
| fetch 其他异常 | `url_unreachable` | 422 |

## 3. Verification

| 命令 | D10 验收目标 |
|---|---|
| `npm test` | 通过，132/132；覆盖 capture extraction、DNS SSRF、redirect guard、size/auth/content/timeout、pipeline title 和文档接线 |
| `npm run audit:website-english-content` | 通过；英文页面主体无 CJK，AI 页面双语源码在既有阈值内 |
| `npm run build:website` | 通过；Next.js 生成 48 个 static/SSG 页面，`/api/analyze` 和 healthz 为 dynamic route |
| `git diff --check` | 通过，无 whitespace error |

## 4. Remaining Risks

| 风险 | 当前边界 |
|---|---|
| 真实网页差异 | D10 提供 fetch harness，但不保证所有复杂网页可解析 |
| JavaScript 渲染页面 | 不引入浏览器爬虫；需要 JS 渲染的页面可能返回内容不足 |
| 模型接入 | D10 仍返回 safe mock output；真实模型输出 gate 留给后续阶段 |
| 多实例限流 | 仍使用 D9 进程内 gate；生产多实例需要共享限流 |
