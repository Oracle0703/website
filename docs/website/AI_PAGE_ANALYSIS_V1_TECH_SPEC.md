# AI Page Analysis V1 Tech Spec

> P3A implements the V1 MVP boundary for `/api/analyze`: capture harness, model adapter, output schema gate, and safe fallback. It still does not add model keys, queues, databases, login, or history.

Historical note: D6 only defines the backend safety and schema gates; P3A is the implementation stage that turns those gates into the V1 MVP.

## 1. Scope

| 项目 | 规格 |
|---|---|
| 对应产品文档 | `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` |
| V1 技术目标 | 将 URL 抓取、页面摘要、model adapter、output schema gate 和结构化结果放进可测试边界 |
| P3A 交付 | SSRF 规则、capture harness、`AnalysisModelAdapter`、`validateModelAnalysisOutput`、safe fallback、错误码和前端 structured brief |
| P3A 不做 | 不接真实模型 key，不保存历史，不新增队列，不新增登录，不做截图上传或浏览器渲染抓取 |

## 2. Input Schema

| 字段 | 类型 | 规则 |
|---|---|---|
| `mode` | `"url"` | V1 只接受 URL 模式 |
| `input` | string | HTTP/HTTPS URL，长度 1 到 2048，必须通过 URL parser |
| `brief.audience` | string | trim 后 4 到 240 个字符 |
| `brief.goal` | string | trim 后 4 到 240 个字符 |
| `brief.problem` | string | trim 后 4 到 500 个字符 |
| `language` | `"zh"` 或 `"en"` | 可选；默认按当前 route locale |

拒绝规则：

| 场景 | 错误码 |
|---|---|
| 非 HTTP/HTTPS | `invalid_url` |
| URL 超长或无法解析 | `invalid_url` |
| Brief 字段太短 | `input_too_short` |
| 重复提交窗口命中 | `rate_limited` |

## 3. URL Safety And SSRF Guard

| 风险 | 必须规则 |
|---|---|
| SSRF | 所有抓取请求必须先经过 allow/deny 校验，禁止用户控制任意协议、header 和 redirect 目标 |
| localhost | 禁止 `localhost`、`127.0.0.0/8`、`::1` 和本机 hostname |
| 内网地址 | 禁止 RFC1918、link-local、loopback、multicast、reserved IP 段 |
| cloud metadata | 禁止 `169.254.169.254`、`metadata.google.internal`、AWS/GCP/Azure metadata endpoints |
| DNS rebinding | 解析后校验 IP；redirect 后重新校验目标 host 和 IP |
| redirect | 最多 3 次；每次只允许 HTTP/HTTPS，并重新执行 SSRF guard |
| timeout | DNS、连接、首字节、总下载分别设置超时；总 capture timeout 不超过 10 秒 |
| size limit | HTML 下载大小上限 2 MB，超限返回 `page_too_large` |
| auth page | 不提交 cookie、Authorization 或用户自定义 header；登录页返回 `auth_required_page` |

## 4. Capture Pipeline

| 阶段 | 输入 | 输出 | 失败 |
|---|---|---|---|
| validate | raw request | normalized input | `invalid_url`、`input_too_short` |
| resolve | URL host | resolved IP and redirect policy | `invalid_url` |
| fetch | normalized URL | HTML snapshot | `url_unreachable`、`capture_timeout`、`page_too_large` |
| extract | HTML snapshot | page summary | `insufficient_page_content` |
| analyze | page summary + brief | model output draft | `analysis_timeout` |
| parse | model output draft | output schema | `invalid_model_output` |

## 5. Model Adapter Boundary

| API | 职责 |
|---|---|
| `AnalysisModelInput` | 包含 normalized request、page summary 和 language |
| `AnalysisModelAdapter` | 接收 `AnalysisModelInput` 并返回 unknown raw output |
| `createSafeMockAnalysisAdapter` | 在未配置真实模型时生成 deterministic raw output |
| `runAnalysisPipeline` | 调用 adapter、处理 timeout、执行 output schema gate 并返回 `PageAnalysisResult` |

Route-level adapter selection stays inside `apps/website/app/api/analyze/route.ts`. If no supported model environment is configured, `createRouteModelAdapter()` returns a safe fallback adapter. Environment values are not returned to the client or logged.

## 6. Output Schema

```json
{
  "analysis_id": "ana_20260521_001",
  "status": "succeeded",
  "needs_review": false,
  "confidence": 0.82,
  "source": {
    "url": "https://example.org",
    "title": "Example",
    "captured_at": "2026-05-21T10:00:00.000Z"
  },
  "scores": [
    {
      "key": "value_proposition",
      "label": "Value proposition",
      "score": 62,
      "reason": "The hero names the category but not the measurable outcome."
    }
  ],
  "issues": [
    {
      "severity": "high",
      "evidence": "The primary CTA does not match the stated goal.",
      "impact": "Visitors cannot tell whether to request a trial or read more.",
      "recommendation": "Use one primary CTA tied to the conversion goal."
    }
  ],
  "recommendations": [
    {
      "module": "hero",
      "action": "Rewrite headline and CTA",
      "priority": "P0",
      "expected_outcome": "Reduce comprehension cost and clarify the next action."
    }
  ],
  "backlog": [
    {
      "task": "Rewrite hero headline, subcopy, and primary CTA",
      "owner": "product/design",
      "priority": "P0",
      "eta": "0.5d"
    }
  ]
}
```

## 7. Error Codes

| 错误码 | HTTP | 含义 | 用户恢复 |
|---|---:|---|---|
| `invalid_url` | 400 | URL 无法解析、协议不支持或命中 SSRF denylist | 修改 URL |
| `input_too_short` | 400 | Brief 信息不足 | 补充受众、目标和问题 |
| `rate_limited` | 429 | 提交过频或重复提交 | 稍后再试 |
| `url_unreachable` | 422 | 目标页面无法访问 | 检查 URL 或换页面 |
| `auth_required_page` | 422 | 页面需要登录或被权限阻挡 | 使用公开页面 |
| `insufficient_page_content` | 422 | 抽取内容不足以分析 | 补充 Brief 或换页面 |
| `page_too_large` | 413 | HTML 超过抓取上限 | 使用更具体页面 |
| `capture_timeout` | 504 | 抓取阶段超时 | 重试 |
| `analysis_timeout` | 504 | 模型分析超时 | 重试 |
| `invalid_model_output` | 502 | 模型输出不能解析成 output schema | 记录分析 ID，允许稍后重试 |

## 8. Model Output Gate

| 规则 | 处理 |
|---|---|
| JSON parse 失败 | 返回 `invalid_model_output` |
| score keys 缺失、重复或不是完整 `ANALYSIS_SCORE_KEYS` | 返回 `invalid_model_output` |
| score 非 0 到 100 数字或缺少 reason | 返回 `invalid_model_output` |
| issues 缺少 severity、evidence、impact 或 recommendation | 返回 `invalid_model_output` |
| recommendations/backlog 为空或缺少必填字段 | 返回 `invalid_model_output` |
| confidence 缺失、非数字或不在 0 到 1 | 返回 `invalid_model_output` |
| `confidence < 0.65` | 返回成功但设置 `needs_review: true` |

`validateModelAnalysisOutput` accepts object output or JSON string output. It normalizes only validated fields into `PageAnalysisResult`; malformed output never reaches frontend rendering.

## 9. Safe Fallback Behavior

| 场景 | 行为 |
|---|---|
| model env absent | Use `createSafeMockAnalysisAdapter()` and return deterministic output |
| unsupported provider configured | Return undefined adapter and let helper use safe fallback |
| adapter timeout-like error | Map to `analysis_timeout`, HTTP 504 |
| adapter malformed output | Map to `invalid_model_output`, HTTP 502 |
| successful fallback | Keep `safe_mock_api: true` so UI does not imply a live model |

## 10. P3A Non-Implementation Boundary

| P3A 不实现 | 原因 |
|---|---|
| 不新增模型 key | 先固化 adapter 和 schema gate，避免凭据、成本和供应商耦合 |
| 不新增队列 | 当前请求仍是同步 MVP，队列属于后续稳定性阶段 |
| 不新增数据库 | 历史记录、删除和权限属于后续阶段 |
| 不新增登录 | V1 先验证单次公开页面分析 |
| 不做 PDF 或截图上传 | 文件安全、存储和导出属于 V2 |
| 不使用浏览器渲染爬虫 | 当前仅使用 HTML capture harness，降低安全面和运行成本 |
| 不抓取登录后页面 | 认证数据和隐私风险过高 |

## 11. Verification Plan

| 类型 | 验收 |
|---|---|
| 单元测试 | URL parser、SSRF denylist、redirect guard、input schema、output schema gate、adapter fallback |
| 集成测试 | `url_unreachable`、`auth_required_page`、`capture_timeout`、`analysis_timeout`、`invalid_model_output` |
| 前端测试 | URL mode sends structured brief；英文 route visible copy no CJK |
| 发布检查 | `npm test`、`npm run audit:website-english-content`、`npm run validate:website-content`、`npm run build:website`、`git diff --check` |
