# Website D7 Contact Form Spec

> D7 已实现最小联系表单闭环：真实站内 intake form、`POST /api/contact`、`GET /api/contact/healthz`、JSONL 落盘、可选 webhook 通知、反垃圾与隐私边界。D7 不新增数据库、登录、后台查看页或公开个人联系方式。

## 1. 实现状态

| 项目 | D7 implemented 决策 |
|---|---|
| 页面入口 | `/contact` 和 `/en/contact` 渲染真实 Contact form |
| 提交接口 | `POST /api/contact` 接收 JSON payload |
| 探活接口 | `GET /api/contact/healthz` 返回 `{ ok, service, version }`，不暴露提交数量 |
| 保存方式 | 默认 `.data/website-contact/submissions.jsonl`，可用 `CONTACT_SUBMISSIONS_DIR` 覆盖 |
| 通知方式 | `CONTACT_NOTIFICATION_WEBHOOK_URL` 存在时发送 webhook；未配置时只落盘 |
| 通知失败 | 保存成功但 webhook 失败时返回 `received_with_notification_failure` |
| 隐私边界 | 不保存原始 IP，只保存 `ipHash`；不公开提交内容 |
| 非目标 | 不新增数据库、CRM、登录、后台查看页、公开邮箱或假联系方式 |

## 2. 表单字段

| 字段 | 必填 | 规则 | 隐私说明 |
|---|---:|---|---|
| `name` | 是 | 2 到 60 个字符 | 仅用于称呼和后续沟通 |
| `contact` | 是 | 真实可回复渠道；拒绝 `example.com` 等占位域名 | 仅用于回复，不公开展示 |
| `project_goal` | 是 | 至少 20 个字符，拒绝低质量或重复输入 | 用于判断是否适合进入沟通 |
| `timeline` | 否 | 最长 120 个字符 | 用于判断交付节奏 |
| `budget_range` | 否 | 最长 120 个字符 | 可为空，不作为强制门槛 |
| `links` | 否 | 最多 3 个公开 HTTP/HTTPS URL | 不抓取登录后页面，不保存敏感文件 |
| `honeypot` | 否 | 正常用户不可见，必须为空 | anti-spam honeypot |

## 3. Anti-Spam Controls

| 控制 | 规则 | 失败处理 |
|---|---|---|
| honeypot | `honeypot` 非空直接拒绝 | 返回通用 `low_quality_input`，不暴露检测细节 |
| rate limit | 15 分钟内同 identity 最多 3 次 | 返回 `rate_limited`，提示稍后重试 |
| minimum input quality | `project_goal` 太短、重复字符过多或信息量不足时拒绝 | 返回 `low_quality_input` |
| duplicate submit | 24 小时内同联系渠道和相似目标只保留一次 | 返回 `duplicate_submit`，不重复通知 |
| link limit | URL 超过 3 个或包含非 HTTP/HTTPS 链接时拒绝 | 返回 `invalid_link` |
| placeholder contact | 拒绝占位域名或假联系方式 | 返回 `invalid_contact` |

## 4. Privacy, Retention, Deletion

| 项目 | 规则 |
|---|---|
| privacy notice | 表单旁说明保存字段、用途、retention 和 deletion |
| data minimization | 不收集身份证、银行卡、账号密码、私钥、生产日志等敏感信息 |
| IP 处理 | API 使用请求 IP 参与 hash；提交记录只保存 `ipHash` |
| retention | 默认保留 90 天；未进入合作的记录到期删除 |
| deletion | 用户可通过已确认的回复渠道请求删除对应提交记录 |
| logging | D7 仅依赖 API 响应和 JSONL；不要在日志中输出完整正文 |
| export | D7 不提供公开导出；后台调试导出必须脱敏 |

## 5. Failure States

The required English failure labels are: submit failure, duplicate submit, and notification failure.

| 状态 | 错误码 | 用户看到 | 系统行为 |
|---|---|---|---|
| 字段缺失 | `missing_required_field` | 指出缺失字段 | 不创建提交 |
| 联系渠道无效 | `invalid_contact` | 要求真实可回复渠道 | 不创建提交 |
| 输入质量不足 | `low_quality_input` | 提示补充目标、上下文和期望交付物 | 不通知 |
| 链接无效 | `invalid_link` | 提示最多 3 个 HTTP/HTTPS 链接 | 不创建提交 |
| 频率限制 | `rate_limited` | 提示稍后重试 | 不创建提交 |
| 重复提交 | `duplicate_submit` | 提示已收到相似内容 | 不重复通知 |
| 提交失败 | `submit_failure` | 保留用户输入，提示稍后重试 | 不创建提交 |
| 存储失败 | `storage_failure` | 显示未提交成功 | 不丢弃前端输入 |
| 通知失败 | `received_with_notification_failure` | 显示已收到但回复可能延迟 | 已落盘，等待人工补偿 |

## 6. API Contract

| 接口 | 用途 | 边界 |
|---|---|---|
| `POST /api/contact` | 接收表单提交 | 校验字段、反垃圾、频率、重复提交、保存 JSONL、可选通知 |
| `GET /api/contact` | 轻量探活 | 返回服务状态，不暴露提交数量或隐私信息 |
| `GET /api/contact/healthz` | 发布和监控探活 | 返回服务状态，不暴露提交数量或隐私信息 |

成功响应示例：

```json
{
  "status": "received",
  "submission_id": "contact_20260521_ab12cd34",
  "message": "Your request was received."
}
```

通知失败响应示例：

```json
{
  "status": "received_with_notification_failure",
  "submission_id": "contact_20260521_ab12cd34",
  "error": {
    "code": "notification_failure",
    "message": "The request was saved, but notification delivery failed."
  }
}
```

失败响应示例：

```json
{
  "status": "failed",
  "error": {
    "code": "submit_failure",
    "message": "Request body must be valid JSON."
  }
}
```

## 7. Release Requirements

| 类型 | 标准 |
|---|---|
| 单元测试 | 字段校验、honeypot、rate limit、minimum input quality、duplicate submit 全覆盖 |
| API 护栏 | route 不暴露提交数量；storage failure 和 notification failure 有独立状态 |
| 浏览器测试 | `/en/contact` 可见英文表单，提交失败不清空输入 |
| 内容审计 | 英文 Contact 主体无 CJK，无 `example.com`、`hello@example.com`、`mailto:hello` |
| 发布检查 | 更新 `RELEASE_CHECKLIST.md`，增加 D7 Contact API、`CONTACT_SUBMISSIONS_DIR` 和 webhook 隐私检查 |

## 8. D6 Historical Boundary

| 阶段 | 边界 |
|---|---|
| D6 不实现 | D6 只完成联系闭环决策和本规格前置，不新增 `POST /api/contact`、数据库、通知、后台查看页或公开邮箱 |
| D7 已实现 | D7 在上述边界明确后实现最小 Contact form 闭环，并继续保留不新增数据库、登录和后台查看页的约束 |
