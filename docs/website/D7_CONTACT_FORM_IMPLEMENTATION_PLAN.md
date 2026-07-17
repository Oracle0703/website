# Website D7 Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a low-risk contact form that turns the D6 contact-loop decision into a real on-site intake path without fake email, login, database, or public personal-channel assumptions.

**Architecture:** Keep the website on Next.js App Router. Add a small pure validation/gating module, a `POST /api/contact` route, a `GET /api/contact/healthz` probe, and a client-side form on `/contact`. Persist submissions as JSONL in a configurable server-side directory and make notification delivery optional through an environment webhook.

**Tech Stack:** Next.js 14 App Router, TypeScript, React client component, Node.js `fs/promises`, Node.js `crypto`, current Node test suite, Playwright browser verifier.

---

## 1. Scope

| 项目 | 决策 |
|---|---|
| 表单字段 | `name`、`contact`、`project_goal`、`timeline`、`budget_range`、`links`、`honeypot` |
| 反垃圾 | honeypot、同 IP/联系渠道 rate limit、同联系渠道和相似内容 duplicate submit |
| 保存 | 开发默认写入 `.data/website-contact/submissions.jsonl`；生产必须设置发布目录外的绝对 `CONTACT_SUBMISSIONS_DIR` |
| 通知 | HTTPS `CONTACT_NOTIFICATION_WEBHOOK_URL` 存在时发送且不跟随重定向；失败返回 `received_with_notification_failure` |
| 隐私 | 不公开提交内容；不保存原始 IP，只保存 hash；默认 retention policy 为 90 天 |
| 非目标 | 不新增数据库、登录、后台查看页、真实邮箱、公开社交链接或 CRM |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `apps/website/lib/contact-form.ts` | Create | 表单输入校验、错误码、rate limit、duplicate submit、submission 构造、文件保存、通知 webhook |
| `apps/website/app/api/contact/route.ts` | Create | `GET` healthz、`POST` 表单提交 API |
| `apps/website/app/contact/contact-client.tsx` | Modify | 渲染 D7 表单、提交状态、失败不清空输入 |
| `apps/website/lib/i18n.ts` | Modify | D7 表单双语文案和错误文案 |
| `tests/website-contact-form.test.js` | Create | 单元与结构测试 |
| `tests/website-home-refinement.test.js` | Modify | Contact 页面表单结构护栏 |
| `tests/website-browser-static.spec.ts` | Modify | Contact 英文内容、表单、失败保留输入 browser 护栏 |
| `tests/website-static-rendering-spike.test.js` | Modify | D7 计划和验收文档护栏 |
| `docs/website/D7_CONTACT_FORM_SPEC.md` | Modify | 从 D6 前置规格更新为 D7 已实现规格 |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | Contact API 发布条件 |
| `docs/website/D7_ACCEPTANCE_REPORT.md` | Create | D7 验收报告 |

## 3. Tasks

### Task 1: RED Tests

**Files:**
- Create: `tests/website-contact-form.test.js`
- Modify: `tests/website-home-refinement.test.js`
- Modify: `tests/website-browser-static.spec.ts`
- Modify: `tests/website-static-rendering-spike.test.js`

- [x] **Step 1: 写失败测试**
  - 校验模块导出 `validateContactFormSubmission`、`createContactSubmissionGate`、`checkContactSubmissionGate`；
  - API route 暴露 `GET` 和 `POST`；
  - Contact client 渲染表单、honeypot、`fetch("/api/contact")`；
  - D7 文档和 release checklist 记录实现边界。

- [x] **Step 2: 运行 RED**
  - Run: `npm test -- tests/website-contact-form.test.js tests/website-home-refinement.test.js tests/website-static-rendering-spike.test.js`
  - Expected: fail because D7 module, API route, form UI, and D7 report do not exist yet.

### Task 2: Contact Validation And Gate

**Files:**
- Create: `apps/website/lib/contact-form.ts`
- Test: `tests/website-contact-form.test.js`

- [x] **Step 1: 实现输入校验**
  - 必填字段缺失返回 `missing_required_field`；
  - `project_goal` 少于 20 个字符或低质量输入返回 `low_quality_input`；
  - `links` 超过 3 个或非 HTTP/HTTPS 返回 `invalid_link`；
  - honeypot 非空返回 `low_quality_input`；
  - 联系字段包含占位域名返回 `invalid_contact`。

- [x] **Step 2: 实现 rate limit 和 duplicate submit**
  - 15 分钟窗口内同 identity 最多 3 次；
  - 24 小时内同 contact + 相似 goal 返回 `duplicate_submit`；
  - 不保存原始 IP，只使用 hash key。

### Task 3: API Route And Storage

**Files:**
- Create: `apps/website/app/api/contact/route.ts`
- Modify: `apps/website/lib/contact-form.ts`
- Test: `tests/website-contact-form.test.js`

- [x] **Step 1: 实现 `GET /api/contact/healthz`**
  - 返回 `{ ok: true, service: "website-contact", version: "d7" }`；
  - 不暴露提交数量或隐私数据。

- [x] **Step 2: 实现 `POST /api/contact`**
  - 解析 JSON；
  - 调用 validation 和 gate；
  - 写入 JSONL；
  - 可选发送 webhook；
  - storage failure 返回 `storage_failure`；
  - notification failure 返回 `received_with_notification_failure`。

### Task 4: Contact Page UI

**Files:**
- Modify: `apps/website/app/contact/contact-client.tsx`
- Modify: `apps/website/lib/i18n.ts`
- Test: `tests/website-home-refinement.test.js`
- Browser: `tests/website-browser-static.spec.ts`

- [x] **Step 1: 渲染 D7 表单**
  - 字段：name、contact、project goal、timeline、budget range、links、honeypot；
  - 显示 privacy notice、retention、deletion；
  - 提交中禁用按钮；
  - 失败不清空输入；
  - 成功显示 submission id。

- [x] **Step 2: 更新双语文案**
  - 中文和英文 Contact 主体不使用假邮箱；
  - `/en/contact` 无 CJK；
  - 错误码映射到用户可理解文案。

### Task 5: Docs And Release Guardrails

**Files:**
- Modify: `docs/website/D7_CONTACT_FORM_SPEC.md`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/D7_ACCEPTANCE_REPORT.md`
- Modify: `tests/website-static-rendering-spike.test.js`

- [x] **Step 1: 更新规格**
  - 标记 D7 已实现的最小闭环；
  - 保留数据库、登录、后台查看页为非目标。

- [x] **Step 2: 更新 release checklist**
  - Contact API 改动必须跑 `npm test`、build、static verifier、browser verifier；
  - 真实通知渠道改动必须检查隐私和失败状态。

### Task 6: Verification

**Files:**
- All D7 files

- [x] **Step 1: 完整验证**
  - `npm test`
  - `npm run audit:website-english-content`
  - `npm run validate:website-content`
  - `npm run build:website`
  - `npm run verify:website-static`
  - `npm run verify:website-browser`
  - `git diff --check`

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| Bot 填 honeypot | 返回通用 `low_quality_input` |
| 重复点击提交 | 前端禁用按钮；后端 duplicate submit 兜底 |
| API 返回错误 | 表单输入保留，显示对应错误 |
| 存储失败 | 返回 `storage_failure`，前端不清空输入 |
| 通知失败 | 返回 `received_with_notification_failure`，提示已收到但回复可能延迟 |
| 没有 webhook | 表单仍可提交并落盘，不伪造通知 |
| 英文页面 | 表单和错误文案必须无 CJK |
| 占位联系信息 | 拒绝 `hello@example.com`、`example.com` 等占位域名 |
