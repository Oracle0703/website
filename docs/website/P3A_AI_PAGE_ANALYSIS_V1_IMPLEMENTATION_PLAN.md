# Website P3A AI Page Analysis V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current safe mock AI Page Analysis loop into a V1 MVP with structured brief input, a model adapter boundary, output schema validation, and a safe fallback path.

**Architecture:** Keep D10's capture harness and SSRF/redirect/size/auth/content boundaries. Split the current analysis helper into a clear pipeline shape inside `apps/website/lib/ai-page-analysis.ts`: validate request, capture page summary, run an injected model adapter or safe mock adapter, validate/normalize model output, then return the same frontend-friendly result schema. Frontend changes stay limited to the AI Page Analysis landing client: structured brief fields, clearer processing states, and stable error rendering.

**Tech Stack:** Next.js 14 App Router, TypeScript helper module, Node.js 22 native test runner, injected model adapter, existing website release scripts.

---

## 1. Scope

| 项目 | P3A 决策 |
|---|---|
| Brief | 从当前 demo 的单段 brief 构造升级为显式 audience/goal/problem 字段 |
| Capture | 复用 D10 `capturePageForAnalysis`；不引入浏览器爬虫 |
| Model adapter | 新增可注入 `AnalysisModelAdapter`，未配置真实模型时走 safe mock adapter |
| Output gate | 新增 `validateModelAnalysisOutput`，确保 scores/issues/recommendations/backlog 结构稳定 |
| API | `/api/analyze` 保持单 endpoint，返回成功或稳定错误码 |
| Frontend | URL mode 使用结构化 brief 调 API；screenshot/brief mode 仍是本地 demo |
| Docs | 更新 V1 product/tech spec、release checklist、P3A acceptance report |
| 非目标 | 不做登录、历史记录、PDF、截图上传、队列、付费、浏览器渲染抓取 |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `tests/website-ai-page-analysis-v1.test.js` | Create | P3A schema/model adapter/output gate/API pipeline 护栏 |
| `apps/website/lib/ai-page-analysis.ts` | Modify | model adapter 类型、safe mock adapter、output gate、pipeline integration |
| `apps/website/app/api/analyze/route.ts` | Modify | 注入 env-driven adapter 边界，保持 HTTP 错误映射 |
| `apps/website/components/landing/ai-page-analysis-landing-client.tsx` | Modify | 结构化 brief 表单、状态与错误展示 |
| `tests/website-ai-page-analysis-api.test.js` | Modify | D9 契约跟随结构化 brief 和 fallback 行为 |
| `tests/website-ai-page-analysis-capture.test.js` | Modify | D10 capture 契约继续通过 |
| `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` | Modify | V1 MVP 当前实现范围 |
| `docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md` | Modify | model adapter、output gate、fallback 规则 |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | 增加 P3A 条件必跑 |
| `docs/website/P3A_ACCEPTANCE_REPORT.md` | Create | P3A 验收报告 |

## 3. Tasks

### Task 1: RED Tests For P3A Schema And Output Gate

**Files:**
- Create: `tests/website-ai-page-analysis-v1.test.js`
- Modify: `apps/website/lib/ai-page-analysis.ts`

- [ ] **Step 1: Write failing tests**
  - Add tests that import `validateModelAnalysisOutput`, `createSafeMockAnalysisAdapter`, and `runAnalysisPipeline`.
  - Assert valid model-like JSON with all score keys, issue evidence/impact, recommendations, and backlog passes.
  - Assert missing issue evidence, missing score key, empty backlog, invalid confidence, and malformed JSON fail with `invalid_model_output`.
  - Assert `confidence < 0.65` passes but sets `needs_review: true`.

- [ ] **Step 2: Run RED**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js`
  - Expected: FAIL because `validateModelAnalysisOutput`, `createSafeMockAnalysisAdapter`, `runAnalysisPipeline`, and `invalid_model_output` are not exported yet.

- [ ] **Step 3: Extend error code and output gate types**
  - In `apps/website/lib/ai-page-analysis.ts`, extend `AnalysisErrorCode` with:
    - `analysis_timeout`
    - `invalid_model_output`
  - Export:
    - `AnalysisModelAdapter`
    - `RawModelAnalysisOutput`
    - `validateModelAnalysisOutput`
  - Keep existing `PageAnalysisResult` fields stable.

- [ ] **Step 4: Implement `validateModelAnalysisOutput`**
  - Accept unknown output and context `{ input, now, capturedTitle }`.
  - Require `scores` to contain every `ANALYSIS_SCORE_KEYS` key exactly once.
  - Require score values between 0 and 100 and non-empty reason.
  - Require at least one issue with `severity`, `evidence`, `impact`, `recommendation`.
  - Require at least one recommendation and backlog item.
  - Clamp confidence to 0..1 only if numeric; reject missing/non-numeric confidence.
  - Return `needs_review: true` when confidence is lower than `0.65`.

- [ ] **Step 5: Run GREEN**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js`
  - Expected: PASS for Task 1 tests.

### Task 2: Model Adapter Boundary And Safe Fallback

**Files:**
- Modify: `tests/website-ai-page-analysis-v1.test.js`
- Modify: `apps/website/lib/ai-page-analysis.ts`

- [ ] **Step 1: Write failing adapter tests**
  - Test `createSafeMockAnalysisAdapter()` returns a valid raw output that passes `validateModelAnalysisOutput`.
  - Test `runAnalysisPipeline()` uses an injected adapter when provided.
  - Test adapter timeout-like errors map to `analysis_timeout`.
  - Test adapter malformed output maps to `invalid_model_output`.

- [ ] **Step 2: Run RED**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js`
  - Expected: FAIL because adapter and pipeline functions do not exist or are not wired.

- [ ] **Step 3: Implement adapter types**
  - Add:
    - `AnalysisModelInput` with normalized request, page summary, and language.
    - `AnalysisModelAdapter = (input: AnalysisModelInput) => Promise<unknown>`.
    - `createSafeMockAnalysisAdapter()` that converts current deterministic mock content into raw model-like output.

- [ ] **Step 4: Implement `runAnalysisPipeline`**
  - Inputs: normalized request, page capture summary, `{ now, modelAdapter }`.
  - Use `modelAdapter ?? createSafeMockAnalysisAdapter()`.
  - Catch timeout-like errors as `analysis_timeout`.
  - Pass adapter output into `validateModelAnalysisOutput`.
  - Return `{ ok: true, value }` or `{ ok: false, error }`.

- [ ] **Step 5: Wire `analyzePageRequest` to `runAnalysisPipeline`**
  - Keep validation, SSRF, rate gate, and capture order unchanged.
  - Add optional `modelAdapter` to `analyzePageRequest` options.
  - After capture, call `runAnalysisPipeline` instead of `createMockPageAnalysis` directly.
  - Keep `capture: false` tests working by creating a minimal page summary from input hostname.

- [ ] **Step 6: Run GREEN**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js tests/website-ai-page-analysis-api.test.js tests/website-ai-page-analysis-capture.test.js`
  - Expected: PASS.

### Task 3: API Route Adapter Selection

**Files:**
- Modify: `apps/website/app/api/analyze/route.ts`
- Modify: `tests/website-ai-page-analysis-v1.test.js`

- [ ] **Step 1: Write failing route contract tests**
  - Add static tests that verify the route imports or uses an adapter factory boundary.
  - Assert the route does not read model API keys in client code.
  - Assert missing model env falls back to safe mock behavior.

- [ ] **Step 2: Run RED**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js`
  - Expected: FAIL because route-level adapter boundary is not explicit yet.

- [ ] **Step 3: Add server-only adapter factory**
  - In `apps/website/app/api/analyze/route.ts`, create a local `createRouteModelAdapter()` function.
  - If no supported model env is configured, return `undefined` so helper uses safe mock.
  - Do not expose env values in responses or logs.
  - Keep first real provider as a documented stub boundary if credentials are absent.

- [ ] **Step 4: Run GREEN**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js`
  - Expected: PASS.

### Task 4: Frontend Structured Brief UI

**Files:**
- Modify: `apps/website/components/landing/ai-page-analysis-landing-client.tsx`
- Modify: `apps/website/lib/i18n.ts` if shared copy is needed
- Modify: `tests/website-ai-page-analysis-v1.test.js`
- Modify: `tests/website-d4-english-content.test.js`

- [ ] **Step 1: Write failing frontend contract tests**
  - Assert the AI Page Analysis client contains separate audience, goal, and problem controls for URL mode.
  - Assert `/api/analyze` request body sends `brief: { audience, goal, problem }`.
  - Assert error rendering includes `invalid_model_output` and `analysis_timeout` recovery copy.
  - Assert English route copy has no CJK in visible English strings.

- [ ] **Step 2: Run RED**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js tests/website-d4-english-content.test.js`
  - Expected: FAIL because current frontend builds demo brief from one text input.

- [ ] **Step 3: Add structured brief state**
  - Keep URL input as current primary input.
  - Add state fields:
    - `audience`
    - `goal`
    - `problem`
  - Seed examples from existing demo copy.
  - Keep screenshot/brief demo modes local and clearly labeled.

- [ ] **Step 4: Update submit payload**
  - URL mode sends:
    - `mode: "url"`
    - `input`
    - `language`
    - `brief: { audience, goal, problem }`
  - Keep failed submission input and brief state intact.

- [ ] **Step 5: Update copy and error mapping**
  - Add visible labels for Audience, Goal, Problem in zh/en.
  - Add recovery messages for `analysis_timeout` and `invalid_model_output`.
  - Continue labeling output as safe fallback when model env is absent.

- [ ] **Step 6: Run GREEN**
  - Run: `node --test tests/website-ai-page-analysis-v1.test.js tests/website-d4-english-content.test.js`
  - Expected: PASS.

### Task 5: Docs And Release Checklist

**Files:**
- Modify: `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md`
- Modify: `docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/P3A_ACCEPTANCE_REPORT.md`
- Modify: `tests/website-static-rendering-spike.test.js`

- [ ] **Step 1: Write failing docs tests**
  - Assert product spec mentions model adapter, output schema gate, safe fallback, and no history/PDF/screenshots.
  - Assert tech spec mentions `AnalysisModelAdapter`, `invalid_model_output`, `analysis_timeout`, and fallback behavior.
  - Assert release checklist has a P3A row.
  - Assert acceptance report exists and has scope, non-goals, verification, and residual risks.

- [ ] **Step 2: Run RED**
  - Run: `node --test tests/website-static-rendering-spike.test.js`
  - Expected: FAIL until docs are updated.

- [ ] **Step 3: Update product spec**
  - Clarify P3A implements model adapter boundary and output gate.
  - Keep non-goals: login, history, PDF, screenshot upload, browser crawler, payment.

- [ ] **Step 4: Update tech spec**
  - Add model adapter section.
  - Add output validation section with required arrays and confidence rules.
  - Add fallback behavior when model env is absent.

- [ ] **Step 5: Update release checklist**
  - Add P3A conditional row:
    - model adapter changes
    - output schema changes
    - frontend brief changes
    - required commands

- [ ] **Step 6: Create acceptance report**
  - Include implemented scope, commands, non-goals, and residual risks.

- [ ] **Step 7: Run GREEN**
  - Run: `node --test tests/website-static-rendering-spike.test.js`
  - Expected: PASS.

### Task 6: Full Verification

**Files:**
- All P3A files

- [ ] **Step 1: Run unit tests**
  - Run: `npm test`
  - Expected: all tests pass.

- [ ] **Step 2: Run English audit**
  - Run: `npm run audit:website-english-content`
  - Expected: route surfaces and English views have 0 CJK; localized-source remains within documented threshold.

- [ ] **Step 3: Run content validation**
  - Run: `npm run validate:website-content`
  - Expected: content validation passed.

- [ ] **Step 4: Run website build**
  - Run: `npm run build:website`
  - Expected: Next production build passes.

- [ ] **Step 5: Run whitespace check**
  - Run: `git diff --check`
  - Expected: no output.

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| Model env absent | Use safe mock adapter; response must not pretend model is live |
| Model timeout | `analysis_timeout`, HTTP 504 |
| Model returns malformed JSON/object | `invalid_model_output`, HTTP 502 |
| Model output missing evidence/impact | `invalid_model_output` |
| Model output has confidence below 0.65 | Success with `needs_review: true` |
| Capture fails | Existing D10 errors remain unchanged |
| Brief field too short | `input_too_short`, HTTP 400 |
| User retries after failure | Keep URL and brief fields intact |
| Screenshot/brief modes | Stay local demo; do not call `/api/analyze` |

## 5. Commit Guidance

| Commit | Suggested message | Contents |
|---|---|---|
| 1 | `website: add ai analysis output gate` | Task 1 |
| 2 | `website: add ai analysis model adapter boundary` | Task 2 and Task 3 |
| 3 | `website: structure ai analysis brief UI` | Task 4 |
| 4 | `docs: record p3a ai analysis v1 acceptance` | Task 5 |

