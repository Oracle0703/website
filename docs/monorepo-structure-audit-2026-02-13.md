# Monorepo 结构审计与规范建议（2026-02-13）

## 1. 审计范围

- 仓库根目录结构（`apps/`、`docs/`、`content/`、历史目录）
- npm workspaces 声明与落地目录一致性
- lockfile 策略一致性
- 文档与实际结构一致性

## 2. 当前结论

| 维度 | 结果 | 说明 |
|---|---|---|
| Monorepo 基线 | 符合 | 已使用 npm workspaces（`apps/*`、`packages/*`） |
| 目录清晰度 | 已提升 | 历史根目录 `frontend/`、`backend/`、`admin/` 已收敛 |
| 工作区一致性 | 已提升 | 新增 `packages/` 作为共享能力承载位 |
| 依赖锁策略 | 已统一 | 使用根目录 `package-lock.json`，移除子应用 lockfile |
| 文档一致性 | 已修复 | README 与 dashboard 计划文档已同步当前结构 |

## 3. 本次已实施变更

| 类别 | 变更内容 | 目的 |
|---|---|---|
| 目录治理 | 将 `backend/*.md` 迁移到 `docs/legacy/backend-go/` | 根目录职责收敛，保留历史信息 |
| 目录治理 | 将 `admin/backend/spec.md` 迁移到 `docs/legacy/admin/spec.md` | 历史方案归档 |
| 目录治理 | 删除根目录历史残留 `frontend/` | 移除非 workspace 目录噪音 |
| 结构补齐 | 新增 `packages/README.md` | 明确共享包的准入规范 |
| 依赖策略 | 删除 `apps/website/package-lock.json` | 统一单锁文件策略 |
| 脚本治理 | 根 `package.json` 增加各应用脚本别名 | 提升 monorepo 可操作性 |
| 测试治理 | 强化 `tests/workspaces.test.js` | 对目录收敛与策略进行自动校验 |
| 文档治理 | 更新 `README.md`、`docs/dashboard/PLAN.md`、`apps/website/AGENTS.md` | 保证“文档=现实” |

## 4. 结构规范（建议作为长期约定）

| 目录 | 约定 |
|---|---|
| `apps/*` | 仅放可部署应用（web/api/service） |
| `packages/*` | 仅放跨应用复用库或共享配置 |
| `docs/*` | 放规范、计划、架构、审计文档 |
| `docs/legacy/*` | 只归档历史草案/旧方案，不参与主流程 |
| `content/*` | 业务内容源（如博客） |

## 5. 后续优化建议（中等改造后）

| 优先级 | 建议 | 收益 | 成本 |
|---|---|---|---|
| P1 | 在 `packages/` 增加共享 tsconfig/eslint 配置包 | 降低多应用配置漂移 | 低 |
| P1 | 为 `apps/dashboard-web`、`apps/dashboard-api` 增加 CI lint/test | 提前发现回归 | 中 |
| P2 | 在根目录补充 `CONTRIBUTING.md`（分支、提交、MR模板） | 降低协作沟通成本 | 低 |
| P2 | 增加 monorepo 目录校验脚本并接入 CI | 防止结构回退 | 低 |
| P3 | 评估是否引入任务编排工具（如 turbo） | 提升增量构建效率 | 中-高 |

## 6. 验收清单

| 编号 | 验收项 | 状态 |
|---|---|---|
| A1 | 根目录无重复职责目录（frontend/backend/admin） | 已完成 |
| A2 | workspace 声明与目录一致（apps + packages） | 已完成 |
| A3 | 单 lockfile 策略落地 | 已完成 |
| A4 | 文档与目录结构一致 | 已完成 |
| A5 | 自动化测试覆盖结构约束 | 已完成 |
