# 仓库实现问题修复记录（2026-05-18）

## 目标

本次修复聚焦 review 中确认的“不符合常理且有实际风险”的问题：测试红灯、OSS JSON 误覆盖、并发追加丢数据、公开运维日志面板缺少访问控制、原生依赖 Node 版本约束不清晰。

## 修复范围

| 优先级 | 项目 | 处理策略 | 验收方式 |
|---|---|---|---|
| P1 | 子应用 lockfile 破坏 monorepo 单锁文件约定 | 删除 `apps/ai-page-analysis/package-lock.json`，保留根锁文件 | `npm test` 通过 workspace 结构检查 |
| P1 | `dashboard-api` 读取 OSS 失败时误当空数据 | 只允许对象不存在时 fallback，其他读取错误返回 5xx | dashboard-api 路由测试覆盖 |
| P1 | `dashboard-api` logs/events 追加存在并发覆盖 | 使用 ETag / If-Match / If-None-Match 与有限重试 | dashboard-api 路由测试覆盖 |
| P1 | `knock` 暴露访问日志统计无鉴权 | 增加可选 Basic Auth，生产文档要求公开反代时配置 | knock 单元测试覆盖鉴权解析 |
| P2 | `dashboard-api` 更新不存在任务返回成功 | 改为返回 404 | dashboard-api 路由测试覆盖 |
| P2 | `knock` 原生依赖与 Node ABI 容易不匹配 | 增加 Node 版本约束与说明 | package/docs 检查 |

## 暂不处理

| 项目 | 原因 |
|---|---|
| 主站 cookie 导致动态 SSR | 需要重新设计语言/主题初始化策略，影响 SEO 与缓存策略，单独处理更稳妥 |
| 主站 `<img>` lint warning | 不是阻塞问题；MDX 图片是否接入 `next/image` 需要先定内容图片策略 |

## 实施记录

| 步骤 | 状态 | 说明 |
|---|---|---|
| 生成修复文档 | 已完成 | 当前文件 |
| 编写失败测试 | 已完成 | 覆盖 dashboard-api 与 knock 行为 |
| 修改实现 | 已完成 | 修复 OSS fallback、条件追加、任务 404、Knock 鉴权、Node 版本约束 |
| 运行验证 | 进行中 | 根测试、相关 workspace build/test |
