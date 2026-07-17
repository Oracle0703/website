# Website D10 AI Page Analysis Capture Harness Implementation Plan

> Historical plan: current production behavior is default-off, address-pinned capture as documented in `AI_PAGE_ANALYSIS_SECURITY_BOUNDARY.md`. The original default-capture statements below describe the D10 milestone and are not the current deployment contract.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a testable capture harness for AI Page Analysis so `/api/analyze` can validate DNS, redirects, HTML size, login-page signals, and content sufficiency before returning the existing safe mock analysis result.

**Architecture:** Keep D9's Safe Mock API and deterministic mock analysis. Add capture-specific pure helpers and dependency injection to `apps/website/lib/ai-page-analysis.ts` so tests can simulate DNS and fetch behavior without touching the public network. The API route stays thin and calls `analyzePageRequest`.

**Tech Stack:** Next.js 14 App Router, TypeScript helper module, Node.js 22 test runner, injected resolver/fetcher functions, existing D9 API and frontend.

---

## 1. Scope

| 项目 | D10 决策 |
|---|---|
| DNS resolve | 在 capture 前解析 hostname，并对解析出的 IP 再跑 SSRF guard |
| Redirect guard | 最多 3 次 redirect；每次重新校验协议、host 和解析 IP |
| Fetch harness | 支持注入 fetcher；默认不发送 cookie、Authorization 或用户自定义 header |
| Size limit | HTML 上限 2 MB，超过返回 `page_too_large` |
| Auth page | 检测登录页信号，返回 `auth_required_page` |
| Content extraction | 从 HTML 提取 title 和正文摘要；内容不足返回 `insufficient_page_content` |
| Timeout | 捕获 `AbortError` 或 timeout-like 错误，返回 `capture_timeout` |
| API 结果 | D10 成功时仍返回 D9 mock output，但 `source.title` 来自 capture summary |
| 非目标 | 不接真实模型、不做截图、不保存历史、不做队列、不引入浏览器爬虫 |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `tests/website-ai-page-analysis-capture.test.js` | Create | D10 capture RED/GREEN 护栏 |
| `apps/website/lib/ai-page-analysis.ts` | Modify | capture helper、resolver/fetcher DI、错误码扩展 |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | 增加 D10 capture 条件必跑 |
| `docs/website/D10_ACCEPTANCE_REPORT.md` | Create | D10 验收报告 |

## 3. Tasks

### Task 1: RED Tests

**Files:**
- Create: `tests/website-ai-page-analysis-capture.test.js`

- [x] **Step 1: 写失败测试**
  - 断言 `capturePageForAnalysis`、`extractPageSummary`、`createDefaultAnalysisFetcher` 存在；
  - 断言 DNS 解析到内网 IP 时返回 `invalid_url`；
  - 断言 redirect 到 metadata/private URL 时返回 `invalid_url`；
  - 断言 redirect 超过 3 次返回 `url_unreachable`；
  - 断言 HTML 超过 2 MB 返回 `page_too_large`；
  - 断言登录页信号返回 `auth_required_page`；
  - 断言正文不足返回 `insufficient_page_content`；
  - 断言 timeout-like 错误返回 `capture_timeout`；
  - 断言 D10 docs 和 release checklist 接线。

- [x] **Step 2: 运行 RED**
  - Run: `npm test -- tests/website-ai-page-analysis-capture.test.js`
  - Expected: fail because D10 capture helpers and docs do not exist yet.

### Task 2: Capture Helpers

**Files:**
- Modify: `apps/website/lib/ai-page-analysis.ts`
- Test: `tests/website-ai-page-analysis-capture.test.js`

- [x] **Step 1: 扩展错误码**
  - 增加 `url_unreachable`、`auth_required_page`、`insufficient_page_content`、`page_too_large`、`capture_timeout`；
  - `statusForError` 映射为 422、413、504。

- [x] **Step 2: 实现 resolver/fetcher 接口**
  - `AnalysisResolver = (hostname) => Promise<string[]>`；
  - `AnalysisFetcher = (url, init) => Promise<{ status, headers, text }>`；
  - `createDefaultAnalysisFetcher()` 使用 global `fetch`，设置 user-agent，不带 cookie/authorization。

- [x] **Step 3: 实现 `extractPageSummary`**
  - 去除 script/style/noscript；
  - 提取 `<title>` 和 body text；
  - compact whitespace；
  - 正文少于 120 字符返回 `insufficient_page_content`。

- [x] **Step 4: 实现 `capturePageForAnalysis`**
  - validate URL safety；
  - resolver 返回地址后再次 safety check；
  - fetch HTML；
  - 处理 HTTP 401/403 为 `auth_required_page`；
  - 处理 3xx redirect，最多 3 次；
  - redirect 目标重新 validate + resolve；
  - response text 超过 2 MB 返回 `page_too_large`；
  - timeout-like 异常返回 `capture_timeout`；
  - 其他 fetch 异常返回 `url_unreachable`。

### Task 3: Analyze Pipeline Integration

**Files:**
- Modify: `apps/website/lib/ai-page-analysis.ts`
- Test: `tests/website-ai-page-analysis-capture.test.js`

- [x] **Step 1: 将 capture 接入 `analyzePageRequest`**
  - `analyzePageRequest(payload, { resolver, fetcher, capture })` 支持 DI；
  - 默认执行 capture harness；
  - 测试可通过 `capture: false` 保留 D9 单元测试稳定性；
  - 成功 capture 后，mock output 的 `source.title` 使用 capture summary title。

### Task 4: Docs

**Files:**
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/D10_ACCEPTANCE_REPORT.md`

- [x] **Step 1: 更新文档**
  - release checklist 增加 D10 AI Page Analysis Capture Harness 条件；
  - acceptance report 记录 scope、error mapping、risks 和 verification。

### Task 5: Verification

**Files:**
- All D10 files

- [x] **Step 1: 完整验证**
  - `npm test`
  - `npm run audit:website-english-content`
  - `npm run build:website`
  - `git diff --check`

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| DNS 解析为空 | `url_unreachable` |
| DNS 解析到内网或 metadata | `invalid_url` |
| redirect 到非 HTTP/HTTPS | `invalid_url` |
| redirect 到内网或 metadata | `invalid_url` |
| redirect 超过 3 次 | `url_unreachable` |
| HTTP 401/403 | `auth_required_page` |
| HTML 超过 2 MB | `page_too_large` |
| HTML 正文不足 | `insufficient_page_content` |
| `AbortError` 或 timeout-like 错误 | `capture_timeout` |
| fetch 其他异常 | `url_unreachable` |
| 真实模型输出 | D10 不涉及，继续返回 safe mock output |
