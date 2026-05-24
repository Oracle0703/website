# AI Page Analysis V1 Tech Spec

> D6 only defines the backend safety and schema gates. D6 不实现 `/api/analyze`，不新增模型 key、队列、数据库、登录或历史记录。

## 1. Scope

| 项目 | 规格 |
|---|---|
| 对应产品文档 | `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md` |
| V1 技术目标 | 将 URL 抓取、页面摘要、模型分析和结构化结果放进可测试边界 |
| D6 交付 | SSRF 规则、input schema、output schema、错误码、超时和非实现边界 |
| D6 不做 | 不接真实抓取服务，不调用模型，不保存历史，不上线 API |

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

## 5. Output Schema

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

## 6. Error Codes

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

## 7. Model Output Gate

| 规则 | 处理 |
|---|---|
| JSON parse 失败 | 返回 `invalid_model_output` |
| 必填数组为空 | 返回 `invalid_model_output` |
| `confidence < 0.65` | 返回成功但设置 `needs_review: true` |
| 缺少 evidence 或 impact | 该 issue 无效；若全部无效则 `invalid_model_output` |
| recommendation 不关联页面证据 | 降低置信度并标记人工复核 |
| 输出包含未抓取到的事实断言 | 标记 `needs_review: true` |

## 8. D6 Non-Implementation Boundary

| D6 不实现 | 原因 |
|---|---|
| 不新增 `/api/analyze` | 安全边界和 schema 先验收 |
| 不新增模型 key | 避免把凭据和成本引入当前阶段 |
| 不新增队列 | V1 超时和重试策略尚未实现 |
| 不新增数据库 | 历史记录、删除和权限属于后续阶段 |
| 不新增登录 | V1 先验证单次公开页面分析 |
| 不抓取登录后页面 | 认证数据和隐私风险过高 |

## 9. Verification Plan

| 类型 | 验收 |
|---|---|
| 单元测试 | URL parser、SSRF denylist、redirect guard、input schema、output schema |
| 集成测试 | `url_unreachable`、`auth_required_page`、`capture_timeout`、`analysis_timeout`、`invalid_model_output` |
| 浏览器测试 | 页面继续标记 Mock Pipeline limitation，不暗示 production-ready AI analysis |
| 发布检查 | D6 阶段只能更新规格和 mock 页面，不新增 API route |
