# Website D7 Contact Form Acceptance Report

## 1. Scope

| 项目 | 结论 |
|---|---|
| Contact 页面 | 已从 D6 前置联系路径升级为真实站内 Contact form |
| API | 已新增 `POST /api/contact`，并提供 `GET /api/contact` 与 `GET /api/contact/healthz` 探活 |
| 保存 | 已实现 JSONL 落盘，默认 `.data/website-contact/submissions.jsonl`，可用 `CONTACT_SUBMISSIONS_DIR` 覆盖 |
| 通知 | 已支持可选 `CONTACT_NOTIFICATION_WEBHOOK_URL` webhook |
| 失败状态 | 已覆盖 validation、rate limit、duplicate submit、storage failure、notification failure |
| 隐私 | 不保存原始 IP，只保存 `ipHash`；不公开提交内容 |
| 非目标 | 未新增数据库、登录、后台查看页、公开邮箱或假联系方式 |

## 2. Implemented Files

| 文件 | 内容 |
|---|---|
| `apps/website/lib/contact-form.ts` | 表单校验、错误码、rate limit、duplicate submit、submission 构造、JSONL 保存、webhook 通知 |
| `apps/website/app/api/contact/route.ts` | Contact API health probe 和表单提交处理 |
| `apps/website/app/api/contact/healthz/route.ts` | 显式 healthz 探活接口 |
| `apps/website/app/contact/contact-client.tsx` | 真实 intake form、提交状态、失败保留输入、成功显示 submission id |
| `apps/website/lib/i18n.ts` | Contact form 双语文案、privacy、retention、deletion、错误码映射 |
| `docs/website/D7_CONTACT_FORM_SPEC.md` | D7 已实现规格和发布边界 |
| `docs/website/RELEASE_CHECKLIST.md` | D7 Contact API 发布护栏 |

## 3. Behavior

| 场景 | 处理 |
|---|---|
| 字段缺失 | 返回 `missing_required_field` |
| 占位联系渠道 | 返回 `invalid_contact` |
| 项目目标太短或低质量 | 返回 `low_quality_input` |
| 链接超过 3 个或非 HTTP/HTTPS | 返回 `invalid_link` |
| honeypot 被填写 | 返回 `low_quality_input` |
| 15 分钟内同 identity 超过 3 次 | 返回 `rate_limited` |
| 24 小时内同 contact + 相似 goal | 返回 `duplicate_submit` |
| 存储失败 | 返回 `storage_failure`，前端保留输入 |
| webhook 通知失败 | 返回 `received_with_notification_failure`，提交仍保留 |
| 没有 webhook | 仍写入 JSONL，不伪造外部通知 |

## 4. Verification

| 命令 | D7 验收目标 |
|---|---|
| `npm test` | 通过，115/115；覆盖 Contact form 模块、API route、UI 结构、D7 文档和 release checklist |
| `npm run audit:website-english-content` | 通过；`/en/contact` 主体无 CJK |
| `npm run validate:website-content` | 通过，13 files checked |
| `npm run build:website` | 通过，Next.js 生成 48 个 static/SSG 页面，`/api/contact` 与 `/api/contact/healthz` 为 dynamic route |
| `npm run verify:website-static` | 通过，18 个公开静态入口 |
| `npm run verify:website-browser` | 通过，64/64；Contact form 可见，失败不清空输入 |
| `git diff --check` | 通过，无 whitespace error |

## 5. Remaining Risks

| 风险 | 当前边界 |
|---|---|
| JSONL 清理 | D7 记录 retention policy，但没有实现自动清理任务 |
| 通知补偿 | webhook 失败会返回明确状态，但没有后台队列 |
| 多实例限流 | 当前 gate 是进程内内存状态，多实例部署需要共享存储或边缘限流 |
| 提交查看 | D7 不提供后台查看页；运维查看必须在服务器侧访问 JSONL 并脱敏 |

## 6. Next Step

| 优先级 | 建议 |
|---|---|
| P1 | 部署前设置私有 `CONTACT_SUBMISSIONS_DIR`，确保不在公开静态目录内 |
| P1 | 若启用 `CONTACT_NOTIFICATION_WEBHOOK_URL`，先在预览环境验证 notification failure 行为 |
| P2 | 后续 D8 可补 retention cleanup、通知补偿队列和轻量运维手册 |
