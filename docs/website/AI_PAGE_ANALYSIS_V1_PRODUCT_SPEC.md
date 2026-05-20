# AI 页面分析助手 V1 产品规格

## 1. 产品定位

| 项目 | 定义 |
|---|---|
| 产品名 | AI 页面分析与改版方案助手 |
| V1 目标 | 输入 URL 与业务 Brief，生成结构化页面诊断、改版建议和可执行 Backlog |
| 使用对象 | 个人站维护者、独立开发者、早期产品负责人、运营/设计协作成员 |
| 核心价值 | 把主观的页面改版讨论转成可复核、可排序、可执行的改版任务 |
| 当前前提 | 现有 `/ai-page-analysis` 是可交互 Mock Demo；V1 规格定义真实 MVP 的产品边界 |

V1 不追求“自动完成 redesign”，而是先把页面分析讨论稳定成一套可重复的工作流：输入充分、诊断有证据、建议可落地、失败有边界。

## 2. V1 范围

| 功能 | V1 做法 | 成功标准 |
|---|---|---|
| URL 输入 | 用户输入公开可访问 URL | 能识别 URL 格式，能处理抓取失败 |
| Brief 输入 | 用户填写受众、目标、当前问题 | 输入不足时给出明确补充建议 |
| 页面素材解析 | 抽取标题、正文、主要区块、链接和基础 metadata | 能形成可供模型分析的结构化摘要 |
| 结构评分 | 输出信息架构、价值表达、行动路径、可信度、移动端可读性评分 | 每项评分带简短理由 |
| 问题清单 | 输出严重度、证据、影响、建议方向 | 问题可按优先级排序 |
| 改版建议 | 输出模块级改版方案 | 每条建议关联问题和目标 |
| Backlog | 生成可执行任务、优先级、Owner 类型、预估周期 | 可直接转入项目管理或手动执行 |
| 失败状态 | 覆盖 URL 不可访问、输入不足、模型超时、低置信度 | 不清空用户输入，可重试或修改 |

## 3. V1 不做

| 不做 | 原因 | 后续阶段 |
|---|---|---|
| 登录账户 | V1 先验证单次分析价值，避免引入身份系统复杂度 | V3 |
| 历史记录 | 需要存储、权限和数据删除策略 | V2/V3 |
| PDF 导出 | 先验证结构化结果是否有用 | V2 |
| 真实截图上传 | 涉及文件大小、存储、扫描和隐私边界 | V2 |
| 自动改写线上页面 | 风险过高，且需要 CMS/部署链路 | V4 |
| 多人协作评论 | 协作状态和通知模型暂不稳定 | V3 |
| 付费与额度 | 先建立分析质量和使用闭环 | V4 |

## 4. 用户流程

| 步骤 | 用户动作 | 系统动作 | 边界 |
|---|---|---|---|
| 1 | 输入 URL | 校验格式并准备抓取 | 非 HTTP/HTTPS 直接拒绝 |
| 2 | 填写 Brief | 校验 audience/goal/problem | 任一字段过短时提示补充 |
| 3 | 点击分析 | 创建分析任务并进入 processing | 禁止重复提交同一请求 |
| 4 | 等待结果 | 展示阶段进度：抓取、解析、诊断、生成 | 超时可重试 |
| 5 | 查看结果 | 展示评分、问题、建议、Backlog | 低置信度加醒目标记 |
| 6 | 继续行动 | 用户复制 Backlog 或跳转联系 | V1 不保存历史 |

## 5. 页面与状态设计

| 状态 | 页面表现 | 用户可操作 |
|---|---|---|
| Idle | URL + Brief 输入表单，展示示例输入 | 填写、使用示例、提交 |
| Validating | 校验输入格式和长度 | 修改输入 |
| Analyzing | 阶段式进度与日志 | 暂不支持取消，可等待 |
| Succeeded | 展示完整分析结果 | 复制 Backlog、重新分析 |
| Partial | 展示结果并标记 `needs_review: true` | 人工复核、补充 Brief 后重试 |
| Failed | 展示具体错误码和可恢复建议 | 修改输入、重试 |

## 6. 接口草案

### 6.1 `GET /api/healthz`

| 字段 | 说明 |
|---|---|
| 目的 | 给部署、监控和前端探活使用 |
| 成功响应 | `200 OK` |
| 失败响应 | 服务不可用时返回 `503` |

示例响应：

```json
{
  "ok": true,
  "service": "ai-page-analysis",
  "version": "v1"
}
```

### 6.2 `POST /api/analyze`

请求：

```json
{
  "mode": "url",
  "input": "https://example.com",
  "brief": {
    "audience": "中型团队负责人",
    "goal": "提升试用申请率",
    "problem": "首屏价值表达模糊"
  }
}
```

请求约束：

| 字段 | 类型 | 规则 |
|---|---|---|
| `mode` | `"url"` | V1 只支持 URL 模式 |
| `input` | string | 必须是 HTTP/HTTPS URL，长度不超过 2048 |
| `brief.audience` | string | 去空格后不少于 4 个字符 |
| `brief.goal` | string | 去空格后不少于 4 个字符 |
| `brief.problem` | string | 去空格后不少于 4 个字符 |

成功响应：

```json
{
  "analysis_id": "ana_20260518_001",
  "status": "succeeded",
  "needs_review": false,
  "confidence": 0.82,
  "source": {
    "url": "https://example.com",
    "title": "Example",
    "captured_at": "2026-05-18T10:00:00.000Z"
  },
  "scores": [
    {
      "key": "value_proposition",
      "label": "价值表达",
      "score": 62,
      "reason": "首屏描述有产品类别，但缺少明确结果承诺。"
    }
  ],
  "issues": [
    {
      "severity": "high",
      "evidence": "首屏 CTA 与业务目标不一致",
      "impact": "用户难以判断下一步应该申请试用还是阅读介绍",
      "recommendation": "将主 CTA 调整为围绕试用申请的单一动作"
    }
  ],
  "recommendations": [
    {
      "module": "hero",
      "action": "重写首屏标题和 CTA",
      "priority": "P0",
      "expected_outcome": "降低首屏理解成本，提升试用入口可见度"
    }
  ],
  "backlog": [
    {
      "task": "重写 Hero 标题、副标题和主 CTA",
      "owner": "product/design",
      "priority": "P0",
      "eta": "0.5d"
    }
  ]
}
```

失败响应：

```json
{
  "status": "failed",
  "error": {
    "code": "url_unreachable",
    "message": "目标页面暂时无法访问，请检查 URL 或稍后重试。"
  }
}
```

## 7. 错误与边界条件

| 场景 | 错误码 | HTTP | 页面响应 |
|---|---|---:|---|
| URL 格式错误 | `invalid_url` | 400 | 标记 URL 输入框，提示仅支持 HTTP/HTTPS |
| URL 无法访问 | `url_unreachable` | 422 | 保留输入，建议重试或换 URL |
| 页面需要登录 | `auth_required_page` | 422 | 提示 V1 不支持登录后页面 |
| 页面内容过少 | `insufficient_page_content` | 422 | 建议补充 Brief 或使用更完整页面 |
| Brief 输入太短 | `input_too_short` | 400 | 指出缺失字段 |
| 抓取超时 | `capture_timeout` | 504 | 允许重试 |
| 模型超时 | `analysis_timeout` | 504 | 允许重试，不清空输入 |
| 模型返回不可解析 | `invalid_model_output` | 502 | 展示失败，记录分析 ID |
| 结果置信度低 | 无错误，`needs_review: true` | 200 | 展示结果并提示人工复核 |
| 频繁提交 | `rate_limited` | 429 | 提示稍后再试 |

## 8. 质量与安全边界

| 维度 | V1 规则 |
|---|---|
| URL 安全 | 只允许 HTTP/HTTPS；后端必须防 SSRF，禁止访问本机、内网和云元数据地址 |
| 输入隐私 | V1 不保存历史；日志只记录必要错误信息和分析 ID |
| 结果可信度 | 每条问题必须带 evidence 和 impact，不能只给抽象建议 |
| 幻觉控制 | 模型只能基于抓取摘要与 Brief 输出；低置信度必须标记 |
| 重试 | 抓取或模型超时允许重试；输入校验错误不自动重试 |
| 国际化 | V1 默认中文输出，后续可按页面语言或用户选择扩展 |

## 9. 结果结构评分维度

| Key | 中文名 | 评分关注 |
|---|---|---|
| `value_proposition` | 价值表达 | 首屏是否说明对象、问题、结果 |
| `information_architecture` | 信息架构 | 页面结构是否易扫读、层级是否清晰 |
| `conversion_path` | 行动路径 | CTA 是否明确、路径是否干扰少 |
| `trust_signal` | 可信度 | 是否有证据、案例、数据、风险说明 |
| `mobile_readability` | 移动端可读性 | 内容密度、按钮可点性、顺序是否合理 |

评分只作为排序和讨论辅助，不作为绝对质量判断。

## 10. 验收标准

| 类型 | 标准 |
|---|---|
| 产品 | 用户能从 URL + Brief 得到完整诊断、建议和 Backlog |
| 失败体验 | 所有错误码都有明确文案和下一步动作 |
| 工程 | `GET /api/healthz` 和 `POST /api/analyze` 边界清晰，可单独测试 |
| 安全 | URL 抓取具备 SSRF 防护设计，不访问内网地址 |
| 可维护 | 输出 schema 稳定，前端可基于结构化字段渲染 |
| 演进 | 不与 V2 历史记录、截图上传、PDF 导出冲突 |

## 11. 后续阶段

| 阶段 | 方向 | 关键新增 |
|---|---|---|
| V2 | 文件与导出能力 | 截图上传、PDF 导出、结果分享 |
| V3 | 协作与历史 | 登录、历史记录、分享链接、评论 |
| V4 | 工作流产品 | 生成 redesign backlog，连接任务系统 |

