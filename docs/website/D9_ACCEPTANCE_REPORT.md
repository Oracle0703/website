# Website D9 AI Page Analysis API Acceptance Report

## 1. Scope

| 项目 | 结论 |
|---|---|
| API | 新增 `/api/analyze` 和 `/api/analyze/healthz` |
| 输入 | 只接受 URL mode、HTTP/HTTPS URL、brief audience/goal/problem |
| 安全 | 在 mock 分析前执行 URL parser、协议白名单、凭据拒绝、localhost、内网 IP 和 cloud metadata denylist |
| 输出 | 返回稳定结构化 Safe Mock API 结果：scores、issues、recommendations、backlog、source、confidence |
| 前端 | `/ai-page-analysis` 的 URL mode 走 `/api/analyze`，screenshot/brief mode 保持本地 mock |
| 非目标 | 不抓取真实网页、不调用真实模型、不保存历史、不新增数据库、登录、队列、PDF 或截图上传 |

## 2. API Contract

| 端点 | 行为 |
|---|---|
| `GET /api/analyze` | 返回 `{ ok: true, service: "ai-page-analysis", version: "d9" }` |
| `GET /api/analyze/healthz` | 返回显式 healthz 信息 |
| `POST /api/analyze` | 校验输入和 URL 安全后返回 Safe Mock API 分析结果 |

## 3. Safety Rules

| 场景 | 处理 |
|---|---|
| 非 HTTP/HTTPS | `invalid_url`，HTTP 400 |
| URL 带 username/password | `invalid_url`，HTTP 400 |
| `localhost`、`127.0.0.1`、`::1` | `invalid_url`，HTTP 400 |
| RFC1918、link-local、reserved、multicast IP | `invalid_url`，HTTP 400 |
| `169.254.169.254` 或 `metadata.google.internal` | `invalid_url`，HTTP 400 |
| DNS 解析结果含内网地址 | `invalid_url`，HTTP 400 |
| brief 字段过短 | `input_too_short`，HTTP 400 |
| 15 分钟内高频提交 | `rate_limited`，HTTP 429 |

## 4. Verification

| 命令 | D9 验收目标 |
|---|---|
| `npm test` | 通过，125/125；覆盖 input schema、SSRF guard、mock output、rate gate、route、前端接线和文档 |
| `npm run audit:website-english-content` | 通过；英文页面主体无 CJK，AI 页面双语源码在既有阈值内 |
| `npm run build:website` | 通过；Next.js 生成 48 个 static/SSG 页面，`/api/analyze` 和 healthz 为 dynamic route |
| `git diff --check` | 通过，无 whitespace error |

## 5. Remaining Risks

| 风险 | 当前边界 |
|---|---|
| 真实抓取 | D9 不发起真实 fetch；D10 需要补 DNS resolve、redirect guard、下载上限和超时 |
| 模型接入 | D9 不使用模型 key；真实模型输出需要单独 schema gate 和低置信度策略 |
| 多实例限流 | D9 gate 是进程内状态；多实例部署需要共享限流 |
| 历史记录 | D9 不存储分析历史；后续若新增历史必须设计删除、权限和隐私边界 |
