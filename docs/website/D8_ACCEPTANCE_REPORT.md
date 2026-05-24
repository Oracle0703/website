# Website D8 Contact Operations Acceptance Report

## 1. Scope

| 项目 | 结论 |
|---|---|
| retention cleanup | 新增 JSONL retention cleanup helper，默认 90 天 |
| dry run | `npm run contact:ops -- --cleanup --dry-run` 只报告，不修改文件 |
| storage guard | 新增 `unsafe_storage_directory` 护栏，拒绝保存到 public、`.next`、app、components、lib |
| malformed lines | cleanup 保留无法解析或缺少有效 `receivedAt` 的行，并计数 |
| 运维入口 | 新增 `npm run contact:ops -- --check-storage` 和 cleanup dry run |
| 非目标 | 未新增数据库、登录、后台查看页、自动定时任务或通知补偿队列 |

## 2. Commands

| 命令 | 用途 |
|---|---|
| `npm run contact:ops -- --check-storage` | 校验 `CONTACT_SUBMISSIONS_DIR` 是否安全 |
| `npm run contact:ops -- --cleanup --dry-run` | 预览 retention cleanup 影响 |
| `npm run contact:ops -- --cleanup` | 执行 retention cleanup |
| `npm run contact:ops -- --cleanup --retention-days=120 --dry-run` | 用自定义 retention window 预览清理 |

## 3. Safety Rules

| 场景 | 处理 |
|---|---|
| 目录在 `apps/website/public` 内 | 拒绝，返回 `unsafe_storage_directory` |
| 目录在 `apps/website/.next` 内 | 拒绝，避免污染构建产物 |
| 目录在源码目录内 | 拒绝，避免提交隐私数据 |
| `submissions.jsonl` 不存在 | cleanup 返回 missing file，不创建文件 |
| JSONL 行无法解析 | 保留该行并计入 `malformedCount` |
| `receivedAt` 无效 | 保留该行并计入 `malformedCount` |

## 4. Verification

| 命令 | D8 验收目标 |
|---|---|
| `npm test` | 通过，119/119；覆盖 storage guard、retention cleanup、ops script 和文档护栏 |
| `npm run contact:ops -- --check-storage` | 通过，默认 `.data/website-contact` 目录安全 |
| `npm run contact:ops -- --cleanup --dry-run` | 通过；当前没有 `submissions.jsonl`，返回 `missingFile: true`，未创建文件 |
| `npm run build:website` | 通过，Next.js 生成 48 个 static/SSG 页面，Contact API route 仍为 dynamic |
| `git diff --check` | 通过，无 whitespace error |

## 5. Remaining Risks

| 风险 | 当前边界 |
|---|---|
| 自动定时 | D8 提供手动命令，不创建 cron 或自动任务 |
| 并发写入 | cleanup 没有文件锁；生产执行前应避开高提交窗口 |
| 多实例部署 | storage guard 和 cleanup 只覆盖当前文件目录；多实例共享存储需要后续单独设计 |
| 通知补偿 | D8 不实现队列，只保留 D7 的 `received_with_notification_failure` 状态 |
