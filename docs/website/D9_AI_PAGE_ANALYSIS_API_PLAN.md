# Website D9 AI Page Analysis API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the AI Page Analysis demo into a safe, testable Mock API loop without adding real crawling, model keys, storage, login, or billing.

**Architecture:** Keep `/ai-page-analysis` as the public product surface, add a focused `apps/website/lib/ai-page-analysis.ts` module for schema validation, SSRF guard, rate limiting, and deterministic mock analysis output, then expose it through `POST /api/analyze`. The frontend calls the API for URL mode while continuing to label the result as a safe mock pipeline.

**Tech Stack:** Next.js 14 App Router, TypeScript helper module, Node.js 22 test runner, existing React client component, npm workspace scripts.

---

## 1. Scope

| 项目 | D9 决策 |
|---|---|
| API | 新增 `POST /api/analyze`，并提供 `GET /api/analyze` 与 `GET /api/analyze/healthz` 探活 |
| 输入 | V1 API 只接受 URL mode、HTTP/HTTPS URL、brief audience/goal/problem |
| 安全 | 在任何 mock 分析前执行 URL parser、协议白名单、localhost、内网 IP、cloud metadata denylist |
| 分析结果 | 生成稳定结构化 mock output：scores、issues、recommendations、backlog、source、confidence |
| 前端 | URL mode 调用 `/api/analyze`，成功结果映射到现有展示结构，失败时保留输入并显示错误 |
| 文案 | 明确 D9 是 Safe Mock API，不抓取真实网页、不调用真实模型、不保存历史 |
| 非目标 | 不接真实 fetch、OpenAI/model key、数据库、队列、登录、PDF、截图上传或历史记录 |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `tests/website-ai-page-analysis-api.test.js` | Create | D9 RED/GREEN 护栏 |
| `apps/website/lib/ai-page-analysis.ts` | Create | input schema、SSRF guard、rate gate、mock output |
| `apps/website/app/api/analyze/route.ts` | Create | API health probe 和 POST HTTP 映射 |
| `apps/website/app/api/analyze/healthz/route.ts` | Create | 显式 healthz 探活 |
| `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | Modify | URL mode 调用 D9 API，并保留 safe mock 标签 |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | 增加 D9 AI Page Analysis API 条件必跑 |
| `docs/website/D9_ACCEPTANCE_REPORT.md` | Create | D9 验收报告 |

## 3. Tasks

### Task 1: RED Tests

**Files:**
- Create: `tests/website-ai-page-analysis-api.test.js`

- [x] **Step 1: 写失败测试**
  - 断言 `validateAnalysisRequest`、`validateAnalysisUrlSafety`、`createMockPageAnalysis`、`analyzePageRequest` 存在；
  - 断言 HTTP/HTTPS URL + brief 可被规范化；
  - 断言 `ftp:`、`localhost`、`127.0.0.1`、`10.0.0.1`、`169.254.169.254`、`metadata.google.internal` 和解析后的内网 IP 会被拒绝；
  - 断言 mock output schema 稳定且每条 issue 有 evidence 和 impact；
  - 断言 API route、frontend fetch、D9 docs 和 release checklist 已接线。

- [x] **Step 2: 运行 RED**
  - Run: `npm test -- tests/website-ai-page-analysis-api.test.js`
  - Expected: fail because D9 helper, route, UI fetch, checklist row, and acceptance report do not exist yet.

### Task 2: Analysis Helper

**Files:**
- Create: `apps/website/lib/ai-page-analysis.ts`
- Test: `tests/website-ai-page-analysis-api.test.js`

- [x] **Step 1: 实现 input schema**
  - `validateAnalysisRequest(payload)` 返回 `{ ok: true, value }` 或 `{ ok: false, error }`；
  - `mode` 必须是 `"url"`；
  - `input` 必须是 HTTP/HTTPS URL，长度不超过 2048；
  - `brief.audience`、`brief.goal`、`brief.problem` trim 后分别满足最小长度；
  - `language` 只接受 `"zh"` 或 `"en"`，缺省为 `"zh"`。

- [x] **Step 2: 实现 SSRF guard**
  - `validateAnalysisUrlSafety(url, { resolvedAddresses })` 检查 hostname 和可选 DNS 解析结果；
  - 拒绝 localhost、本机 IP、RFC1918、link-local、multicast、reserved IP、cloud metadata host；
  - 拒绝带 username/password 的 URL，避免凭据进入日志或后续抓取链。

- [x] **Step 3: 实现 mock output**
  - `createMockPageAnalysis(input, { now })` 输出稳定 schema；
  - score key 覆盖 `value_proposition`、`information_architecture`、`conversion_path`、`trust_signal`、`mobile_readability`；
  - issue 必须包含 severity、evidence、impact、recommendation；
  - backlog 必须包含 task、owner、priority、eta。

- [x] **Step 4: 实现 lightweight gate**
  - `createAnalysisRequestGate()` 创建内存 gate；
  - `checkAnalysisRequestGate(gate, { identityKey, now })` 在 15 分钟内最多接受 5 次；
  - `analyzePageRequest(payload, options)` 串起 validation、guard、gate 和 mock output。

### Task 3: API Routes

**Files:**
- Create: `apps/website/app/api/analyze/route.ts`
- Create: `apps/website/app/api/analyze/healthz/route.ts`
- Test: `tests/website-ai-page-analysis-api.test.js`

- [x] **Step 1: 新增 HTTP 映射**
  - `GET /api/analyze` 返回 `{ ok: true, service: "ai-page-analysis", version: "d9" }`；
  - `POST /api/analyze` 解析 JSON，调用 `analyzePageRequest`；
  - validation/SSRF 错误返回 400，rate limit 返回 429，mock 成功返回 200。

- [x] **Step 2: 新增 healthz**
  - `GET /api/analyze/healthz` 返回相同 service/version；
  - route 使用 `dynamic = "force-dynamic"`，避免健康状态被误静态化。

### Task 4: Frontend Integration And Docs

**Files:**
- Modify: `apps/website/components/landing/ai-page-analysis-landing-client.tsx`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/D9_ACCEPTANCE_REPORT.md`

- [x] **Step 1: 前端接入 API**
  - URL mode 在 pipeline 结束时 `fetch("/api/analyze")`；
  - 请求体包含 `mode: "url"`、`input`、`brief` 和当前 locale；
  - 成功结果映射为现有 `DemoOutput`；
  - 失败时保留输入，显示错误码和可恢复提示；
  - screenshot/brief mode 保持本地 mock，不超出 D9 URL API 范围。

- [x] **Step 2: 更新文档**
  - release checklist 增加 D9 AI Page Analysis API 条件；
  - acceptance report 记录 scope、commands、risks 和 verification。

### Task 5: Verification

**Files:**
- All D9 files

- [x] **Step 1: 完整验证**
  - `npm test`
  - `npm run audit:website-english-content`
  - `npm run build:website`
  - `git diff --check`

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| JSON body 无法解析 | `submit_failure`，HTTP 400 |
| `mode !== "url"` | `invalid_mode`，HTTP 400 |
| URL 为空、超长或无法 parse | `invalid_url`，HTTP 400 |
| URL 带凭据 | `invalid_url`，HTTP 400 |
| 非 HTTP/HTTPS | `invalid_url`，HTTP 400 |
| localhost 或内网 IP | `invalid_url`，HTTP 400 |
| cloud metadata host/IP | `invalid_url`，HTTP 400 |
| DNS 解析结果含内网地址 | `invalid_url`，HTTP 400 |
| brief 任一字段过短 | `input_too_short`，HTTP 400 |
| 15 分钟内重复高频提交 | `rate_limited`，HTTP 429 |
| 前端 API 失败 | 保留输入，显示错误；不清空结果之外的表单状态 |
| screenshot/brief mode | 继续本地 mock，不调用 API |
