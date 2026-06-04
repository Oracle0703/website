# Website P3B Case Study Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade project detail pages from summary evidence into concise case studies that explain problem, constraints, decisions, implementation, result, and next steps without exposing private operational data.

**Architecture:** Keep the existing `ProjectView` localization model and add one structured `caseStudy` field to the project content layer. The detail page renders this field as a compact reusable case-study section between evidence/assets and implementation details. Public proof remains controlled through existing `ProjectAsset` and `evidence` fields, so Dashboard and Knock can document redacted proof without publishing sensitive logs, paths, IPs, or internal task data.

**Tech Stack:** Next.js 14 App Router, TypeScript project data module, React client detail component, Node.js 22 native test runner, existing English content audit and website release scripts.

---

## 1. Scope

| 项目 | P3B 决策 |
|---|---|
| 数据模型 | 新增 `ProjectCaseStudy`，包含 `problem`、`constraints`、`decisions`、`implementation`、`result`、`next` |
| 本地化 | `LocalizedProjectContent` 和 `ProjectView` 同步携带 `caseStudy`；中文项目使用项目本体内容，英文项目使用 `englishProjectContentBySlug` |
| 详情页 | 新增 `CaseStudySection`，按故事顺序展示问题、约束、决策、实现、结果、下一步 |
| 内容深度 | AI Page Analysis 写完整案例；Tracker、Knock、Dashboard、Timestamp Tool 补足可公开的案例结构 |
| 证据边界 | Dashboard/Knock 不公开原始日志、IP、内部路径、任务名、OSS key；只写脱敏运行摘要或架构级证据 |
| 转化路径 | 保留现有 Blog/Contact/项目链接，不在本阶段新增复杂 CTA 或账户能力 |
| 非目标 | 不伪造指标、不写商业结果、不引入 CMS、不把详情页改成长文博客、不新增截图资产基线 |

## 2. Files

| 文件 | 操作 | 责任 |
|---|---|---|
| `tests/website-projects.test.js` | Modify | 覆盖 `ProjectCaseStudy` 类型、所有项目 `caseStudy` 结构、脱敏边界 |
| `tests/website-d4-english-content.test.js` | Modify | 覆盖英文 `ProjectView.caseStudy` 无 CJK |
| `tests/website-detail-static-pages.test.js` | Modify | 覆盖详情页渲染 case study section 和 i18n label |
| `tests/website-browser-static.spec.ts` | Modify | 覆盖英文项目详情页可见 Case study 内容 |
| `tests/website-static-rendering-spike.test.js` | Modify | 覆盖 P3B 计划、验收报告和 release checklist |
| `apps/website/lib/projects.ts` | Modify | 新增类型、中文/英文 case study 内容、view 映射 |
| `apps/website/app/projects/[slug]/project-detail-client.tsx` | Modify | 新增 `CaseStudySection` UI |
| `apps/website/lib/i18n.ts` | Modify | 新增中英文 case study 标题和字段 label |
| `scripts/audit-website-english-content.mjs` | Modify | 登记 `projects.ts` 新 localized-source CJK 基线，英文 view 仍必须 0 CJK |
| `docs/website/RELEASE_CHECKLIST.md` | Modify | 增加 P3B 条件必跑 |
| `docs/website/P3B_ACCEPTANCE_REPORT.md` | Create | 记录 P3B 范围、验证、边界和剩余风险 |

## 3. Tasks

### Task 1: RED Tests For Case Study Model

**Files:**
- Modify: `tests/website-projects.test.js`
- Modify: `tests/website-d4-english-content.test.js`

- [ ] **Step 1: Write failing project model tests**
  - Assert `apps/website/lib/projects.ts` exports `ProjectCaseStudy`.
  - Assert `Project`, `LocalizedProjectContent`, and `ProjectView` include `caseStudy: ProjectCaseStudy`.
  - Import `getAllProjects()` and assert every project has `caseStudy.problem`, `constraints`, `decisions`, `implementation`, `result`, and `next`.
  - Assert every list has at least two non-empty items.
  - Assert Knock and Dashboard case-study content does not contain private markers such as raw IP addresses, Windows drive paths, `oss://`, `/var/log`, `CONTACT_SUBMISSIONS_DIR`, or `SECRET`.

- [ ] **Step 2: Write failing English case study audit tests**
  - Extend the English `ProjectView` test to check `caseStudy.problem`.
  - Check every `caseStudy` list item has no CJK.

- [ ] **Step 3: Run RED**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-projects.test.js tests/website-d4-english-content.test.js`
  - Expected: FAIL because `caseStudy` is not defined yet.

### Task 2: Implement Case Study Data

**Files:**
- Modify: `apps/website/lib/projects.ts`
- Modify: `scripts/audit-website-english-content.mjs`

- [ ] **Step 1: Add types**
  - Export:
    - `ProjectCaseStudy`
    - `caseStudy: ProjectCaseStudy` on `Project`
    - `caseStudy: ProjectCaseStudy` on `LocalizedProjectContent`

- [ ] **Step 2: Add Chinese case study content**
  - Add complete `caseStudy` content for all five projects.
  - Keep results factual:
    - AI Page Analysis result focuses on public demo, specs, schema gate, and safe fallback.
    - Tracker result focuses on public route, rule loop, and prototype boundary.
    - Knock result focuses on monitoring MVP shape and redacted proof.
    - Dashboard result focuses on status aggregation and conflict boundary.
    - Timestamp Tool result focuses on live Labs utility and reusable tool template.

- [ ] **Step 3: Add English case study content**
  - Add matching English content inside `englishProjectContentBySlug`.
  - Avoid CJK in the English block.

- [ ] **Step 4: Map localized case study**
  - Return `caseStudy: project.caseStudy` from `getChineseProjectContent`.
  - Ensure `getProjectView(project, "en")` returns the English `caseStudy`.

- [ ] **Step 5: Update localized-source audit threshold**
  - Raise only the `apps/website/lib/projects.ts` localized-source threshold to the measured P3B baseline.
  - Keep `project-view` audit at `0/0 CJK`.

- [ ] **Step 6: Run GREEN**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-projects.test.js tests/website-d4-english-content.test.js`
  - Expected: PASS.

### Task 3: RED Tests For Detail UI

**Files:**
- Modify: `tests/website-detail-static-pages.test.js`
- Modify: `tests/website-browser-static.spec.ts`

- [ ] **Step 1: Write failing static UI tests**
  - Assert `project-detail-client.tsx` defines `CaseStudySection`.
  - Assert it renders `copy.caseStudyTitle`, `copy.caseStudyProblemTitle`, `copy.caseStudyConstraintsTitle`, `copy.caseStudyDecisionsTitle`, `copy.caseStudyImplementationTitle`, `copy.caseStudyResultTitle`, and `copy.caseStudyNextTitle`.
  - Assert it consumes `project.caseStudy`.

- [ ] **Step 2: Write failing browser content tests**
  - Update English project detail checks to include `Case study`.
  - Update D5 project evidence test to expect `Case study`.

- [ ] **Step 3: Run RED**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-detail-static-pages.test.js`
  - Expected: FAIL because the detail component and i18n labels do not exist yet.

### Task 4: Implement Detail UI

**Files:**
- Modify: `apps/website/app/projects/[slug]/project-detail-client.tsx`
- Modify: `apps/website/lib/i18n.ts`

- [ ] **Step 1: Add i18n labels**
  - Chinese:
    - `caseStudyTitle: "案例研究"`
    - `caseStudyProblemTitle: "核心问题"`
    - `caseStudyConstraintsTitle: "约束"`
    - `caseStudyDecisionsTitle: "关键决策"`
    - `caseStudyImplementationTitle: "实现"`
    - `caseStudyResultTitle: "结果"`
    - `caseStudyNextTitle: "下一步"`
  - English:
    - `caseStudyTitle: "Case study"`
    - `caseStudyProblemTitle: "Problem"`
    - `caseStudyConstraintsTitle: "Constraints"`
    - `caseStudyDecisionsTitle: "Decisions"`
    - `caseStudyImplementationTitle: "Implementation"`
    - `caseStudyResultTitle: "Result"`
    - `caseStudyNextTitle: "Next"`

- [ ] **Step 2: Add `CaseStudySection`**
  - Render one paragraph for `caseStudy.problem`.
  - Render compact list groups for constraints, decisions, implementation, result, and next.
  - Use existing `panel-surface`, `evidence-card`, responsive grid, and text scale patterns.
  - Place it after `AssetSection` and before `Architecture` so evidence leads into implementation details.

- [ ] **Step 3: Run GREEN**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-detail-static-pages.test.js`
  - Expected: PASS.

### Task 5: Docs And Release Guardrails

**Files:**
- Modify: `tests/website-static-rendering-spike.test.js`
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Create: `docs/website/P3B_ACCEPTANCE_REPORT.md`

- [ ] **Step 1: Write failing docs tests**
  - Assert P3B implementation plan exists and names `caseStudy`, redacted proof, English audit, and `verify:website-browser`.
  - Assert P3B acceptance report exists with scope, non-goals, verification, residual risks, and next stage.
  - Assert release checklist contains a P3B conditional row.

- [ ] **Step 2: Run RED**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-static-rendering-spike.test.js`
  - Expected: FAIL until acceptance report and checklist are updated.

- [ ] **Step 3: Update release checklist**
  - Add a P3B scope row under usage scope.
  - Add a conditional run row for ProjectCaseStudy/model/detail UI/content changes.

- [ ] **Step 4: Create P3B acceptance report**
  - Record implemented scope, non-goals, verification commands, data/privacy boundaries, and recommended P3-C next step.

- [ ] **Step 5: Run GREEN**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; node --test tests/website-static-rendering-spike.test.js`
  - Expected: PASS.

### Task 6: Full Verification

**Files:**
- All P3B files

- [ ] **Step 1: Run unit tests**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; npm test`
  - Expected: all tests pass.

- [ ] **Step 2: Run English audit**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; npm run audit:website-english-content`
  - Expected: route surfaces and English views have 0 CJK; localized-source remains within the P3B documented threshold.

- [ ] **Step 3: Run content validation**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; npm run validate:website-content`
  - Expected: content validation passes.

- [ ] **Step 4: Run website build**
  - Run: `$env:Path='F:\an\nvm\v22.22.0;' + $env:Path; npm run build:website`
  - Expected: Next production build passes.

- [ ] **Step 5: Run whitespace check**
  - Run: `git diff --check`
  - Expected: no output.

## 4. Edge Cases

| 场景 | 处理 |
|---|---|
| 项目没有真实业务指标 | 只写阶段性工程结果、公开路由、规格、测试和边界，不写转化率、收入、用户增长 |
| Dashboard/Knock 涉及敏感数据 | 不公开原始截图；内容只描述脱敏摘要、架构边界和下一步资产计划 |
| 英文内容混入中文 | `ProjectView.caseStudy` 进入 D4 英文审计，必须 0 CJK |
| 详情页移动端拥挤 | 使用单列优先和 `sm:grid-cols-2`，避免多层卡片嵌套 |
| 与现有 evidence/roadmap 重复 | `caseStudy` 讲叙事链路；`evidence` 保留短证据；`roadmap` 保留未来清单 |
| 用户从案例进入合作 | 保留 Contact 和项目链接路径，不新增未验证的联系入口 |
| 后续新增项目 | 测试要求每个项目都有完整 `caseStudy` 结构 |

## 5. Commit Guidance

| Commit | Suggested message | Contents |
|---|---|---|
| 1 | `website: add project case study model` | Tasks 1-2 |
| 2 | `website: render project case studies` | Tasks 3-4 |
| 3 | `docs: record p3b case study acceptance` | Task 5 |
