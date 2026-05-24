# Website D8 Contact Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the D7 Contact form for private, low-maintenance operations by adding retention cleanup, storage-directory safety checks, and an executable operations command.

**Architecture:** Keep the current JSONL storage model. Add pure operations helpers to `apps/website/lib/contact-form.ts`, expose them through a small Node script in `scripts/`, and document the release/ops workflow without adding a database, login, queue, or admin UI.

**Tech Stack:** Node.js 22, Next.js App Router, TypeScript helpers, Node test runner, PowerShell-friendly npm scripts.

---

## 1. Scope

| 项目 | 决策 |
|---|---|
| Retention | 默认 90 天，清理 `submissions.jsonl` 中超过 retention window 的有效记录 |
| Dry run | cleanup 支持 dry run，先报告将删除多少，不修改文件 |
| Malformed lines | 遇到无法解析的 JSONL 行默认保留并计数，避免误删 |
| Storage guard | 拒绝 `CONTACT_SUBMISSIONS_DIR` 指向公开目录、构建目录或源码目录 |
| Ops script | 新增 `npm run contact:ops -- --check-storage` 和 `npm run contact:ops -- --cleanup --dry-run` |
| 非目标 | 不新增数据库、登录、后台查看页、自动定时任务、通知补偿队列 |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `tests/website-contact-ops.test.js` | Create | D8 RED/GREEN 护栏 |
| `apps/website/lib/contact-form.ts` | Modify | retention 常量、目录安全校验、JSONL cleanup helper |
| `scripts/manage-website-contact-submissions.mjs` | Create | CLI 运维入口 |
| `package.json` | Modify | 增加 `contact:ops` script |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | 增加 D8 Contact Operations 条件必跑 |
| `docs/website/D8_ACCEPTANCE_REPORT.md` | Create | D8 验收报告 |

## 3. Tasks

### Task 1: RED Tests

**Files:**
- Create: `tests/website-contact-ops.test.js`

- [x] **Step 1: 写失败测试**
  - 断言 `CONTACT_RETENTION_DAYS`、`validateContactSubmissionsDirectory`、`cleanupContactSubmissionsFile` 存在；
  - 断言公开目录、构建目录和源码目录会被 storage guard 拒绝；
  - 断言 cleanup dry run 不改文件，正式 cleanup 删除过期记录并保留 malformed lines；
  - 断言 `contact:ops`、D8 docs 和 release checklist 存在。

- [x] **Step 2: 运行 RED**
  - Run: `npm test -- tests/website-contact-ops.test.js`
  - Expected: fail because D8 helpers, ops script, package script, and D8 report do not exist yet.

### Task 2: Contact Operations Helpers

**Files:**
- Modify: `apps/website/lib/contact-form.ts`
- Test: `tests/website-contact-ops.test.js`

- [x] **Step 1: 实现 storage guard**
  - `validateContactSubmissionsDirectory(directory, root)` 返回 `{ ok: true }` 或 `{ ok: false, code, message }`；
  - 拒绝 `apps/website/public`、`apps/website/.next`、`apps/website/app`、`apps/website/components`、`apps/website/lib` 之内的目录；
  - `appendContactSubmission` 写入前调用 guard，失败时抛出错误并由 API 映射为 `storage_failure`。

- [x] **Step 2: 实现 cleanup**
  - `cleanupContactSubmissionsFile({ filePath, now, retentionDays, dryRun })` 读取 JSONL；
  - 删除 `receivedAt` 早于 cutoff 的有效记录；
  - 保留 malformed lines 并计数；
  - 文件不存在时返回 0 计数，不创建文件；
  - dry run 不写文件。

### Task 3: Ops Script And Docs

**Files:**
- Create: `scripts/manage-website-contact-submissions.mjs`
- Modify: `package.json`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/D8_ACCEPTANCE_REPORT.md`

- [x] **Step 1: 新增 CLI**
  - `--check-storage` 只校验目录安全；
  - `--cleanup` 执行 cleanup；
  - `--dry-run` 不写文件；
  - `--retention-days=90` 覆盖 retention window；
  - 输出 JSON summary，方便人工或 CI 读取。

- [x] **Step 2: 更新文档**
  - release checklist 增加 D8 Contact Operations 条件；
  - acceptance report 记录 scope、commands、risks 和 verification。

### Task 4: Verification

**Files:**
- All D8 files

- [x] **Step 1: 完整验证**
  - `npm test`
  - `npm run contact:ops -- --check-storage`
  - `npm run contact:ops -- --cleanup --dry-run`
  - `npm run build:website`
  - `git diff --check`

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| `submissions.jsonl` 不存在 | cleanup 返回 0，不创建文件 |
| JSONL 有坏行 | 保留坏行并计数，避免误删 |
| `receivedAt` 缺失或非法 | 视为 malformed，保留 |
| dry run | 只报告，不写文件 |
| 目录指向 public | guard 拒绝，API 返回 `storage_failure` |
| 目录指向 `.next` | guard 拒绝，避免构建产物被污染 |
| 多实例部署 | D8 不解决共享锁；文档保留风险 |
