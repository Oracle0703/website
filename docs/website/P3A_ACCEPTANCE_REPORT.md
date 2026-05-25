# Website P3A AI Page Analysis V1 Acceptance Report

## 1. 实现范围

| 项目 | 结果 |
|---|---|
| Branch | `codex/p3a-ai-analysis-v1` |
| API | `/api/analyze` 保持单 endpoint，health version 升级到 `v1` |
| 输入 | URL mode 使用 structured brief：Audience、Goal、Problem |
| Capture | 复用 D10 `capturePageForAnalysis`，保留 SSRF、redirect、size、auth、content、timeout 护栏 |
| Model adapter | 新增 `AnalysisModelAdapter`、`AnalysisModelInput` 和 route-level adapter factory |
| Output schema gate | 新增 `validateModelAnalysisOutput`，校验 scores、issues、recommendations、backlog 和 confidence |
| Safe fallback | 新增 `createSafeMockAnalysisAdapter`；未配置真实模型时返回 deterministic safe fallback |
| Pipeline | 新增 `runAnalysisPipeline`，统一 adapter 调用、timeout 映射和 output gate |
| Frontend | AI Page Analysis landing client 在 URL mode 展示 URL + structured brief 表单；screenshot/brief mode 仍为本地 demo |

## 2. 非目标

| 非目标 | 说明 |
|---|---|
| 登录 | P3A 不引入账号、身份、权限或会话系统 |
| 历史记录 | P3A 不保存输入、分析结果或用户历史 |
| PDF | P3A 不做导出能力 |
| 截图上传 | P3A 不处理用户上传文件 |
| 浏览器渲染抓取 | P3A 不引入无头浏览器爬虫，仅使用 HTML capture harness |
| 队列 | P3A 不引入后台任务队列 |
| 付费 | P3A 不做额度、账单或支付 |
| 真实模型 key | P3A 仅建立 adapter 边界，不提交或配置供应商凭据 |

## 3. 验证

| 命令 | 目的 | 当前要求 |
|---|---|---|
| `node --test tests/website-ai-page-analysis-v1.test.js` | P3A output gate、adapter、pipeline、route、frontend contract | 必须通过 |
| `node --test tests/website-ai-page-analysis-v1.test.js tests/website-ai-page-analysis-api.test.js tests/website-ai-page-analysis-capture.test.js` | P3A 与 D9/D10 API/capture 回归 | 必须通过 |
| `node --test tests/website-ai-page-analysis-v1.test.js tests/website-d4-english-content.test.js` | 结构化 brief 前端与英文内容护栏 | 必须通过 |
| `node --test tests/website-static-rendering-spike.test.js` | P3A 文档、release checklist、acceptance report 护栏 | 必须通过 |
| `npm test` | 根测试套件 | 发布前必须通过 |
| `npm run audit:website-english-content` | 英文 route surface 与 localized-source 审计 | 发布前必须通过 |
| `npm run validate:website-content` | 内容模型校验 | 发布前必须通过 |
| `npm run build:website` | Next.js production build | 发布前必须通过 |
| `git diff --check` | whitespace 检查 | 发布前必须通过 |

## 4. 剩余风险

| 风险 | 当前处理 | 后续建议 |
|---|---|---|
| Safe fallback 仍是 deterministic mock | 响应保留 `safe_mock_api: true`，前端 copy 不暗示真实模型 | P3B 或后续阶段接入真实 provider 前补供应商验收和成本护栏 |
| 模型供应商未接入 | route factory 已留出 adapter 边界 | 增加 provider-specific adapter、超时、重试、日志脱敏测试 |
| 分析没有历史记录 | P3A 保持无状态，降低隐私和权限复杂度 | V2/V3 再设计 retention、删除、分享和权限 |
| HTML capture 无法解析渲染后内容 | 仅抓取公开 HTML，避免浏览器爬虫安全面 | 后续如需渲染抓取，先做隔离执行和资源限制设计 |
| 前端尚未提供复制 Backlog | 当前先显示结构化结果 | Conversion loop 阶段增加复制、联系和项目转化动作 |

## 5. 发布判断

P3A 可发布的最低条件是：所有验证命令通过，`/api/analyze` 在无模型环境下走 safe fallback，坏模型输出不会进入前端渲染，`analysis_timeout` 和 `invalid_model_output` 有稳定 HTTP 映射，英文路由无可见中文泄漏。
