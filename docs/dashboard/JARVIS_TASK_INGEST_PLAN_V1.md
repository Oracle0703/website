# Jarvis → Dashboard Ingest Plan (v1)

目标：让 Jarvis（我）在完成/创建/推进任务时，把“任务类别 + 概要/内容”提交到一个 API；API 再把数据按规则落到 OSS 的不同文件；`dashboard-web` 读取这些文件，展示：正在做什么 / 做了什么 / 即将做什么。

约束：
- 不区分 dev/prod（单一前缀）。
- 不在聊天里传密钥；密钥只放环境变量。
- OSS bucket 私有；权限最小化。

---

## 1) OSS 目录结构（单前缀，稳定 key）

统一使用 `OSS_PREFIX=dashboard/`（已有默认）。

建议 key：
- `dashboard/state.json`
  - 当前状态（now/next/recent），供首页秒开
- `dashboard/events/YYYY-MM-DD.json`
  - 事件流（append-only，数组）；用于时间线/审计
- `dashboard/tasks.json`
  - 任务列表（可选，沿用现有 tasks）
- `dashboard/status.json`
  - 状态文本（沿用现有 status）
- `dashboard/meta/schema.json`（可选）
  - 数据结构版本与字段说明

说明：事件流按天分片，避免单文件无限膨胀。

---

## 2) 事件模型（API 传什么）

### 2.1 Event

```json
{
  "id": "uuid-or-idempotency-key",
  "ts": "2026-02-24T06:20:00.000Z",
  "type": "task.started",
  "category": "mr|deploy|ops|content|idle|cron",
  "title": "短标题",
  "summary": "一句话摘要",
  "details": {
    "repo": "website",
    "branch": "pr",
    "paths": ["docs/..."],
    "commit": "abcd123",
    "url": "https://...",
    "extra": {}
  }
}
```

### 2.2 事件类型（最小集）

- `task.created`
- `task.started`
- `task.progress`
- `task.completed`
- `task.failed`
- `note`

---

## 3) API 设计（dashboard-api 新增）

### 3.1 写入接口（Jarvis 调用）

`POST /ingest/event`

- Auth：新增环境变量 `INGEST_TOKEN`，用 Bearer token 保护写入。
  - Header：`Authorization: Bearer <INGEST_TOKEN>`
- Idempotency：支持 `Idempotency-Key`（可选）
  - 服务端将其作为 event.id；若同 id 已存在，返回 200 但不重复写。

请求体：Event（见上）。

写入规则：
1) 追加到 `events/YYYY-MM-DD.json`（按 ts 的日期）
2) 依据 type 更新 `state.json`（例如 started -> now；completed -> recentDone）

### 3.2 读取接口（dashboard-web 调用，沿用现有 admin JWT）

- `GET /state`
- `GET /events?days=7&limit=200`

现有：`/auth/login`、`/tasks`、`/logs`、`/status` 保持不破坏。

---

## 4) state.json 结构（dashboard-web 首页要用）

```json
{
  "updatedAt": "2026-02-24T06:20:00.000Z",
  "now": {
    "title": "...",
    "summary": "...",
    "category": "mr",
    "since": "...",
    "links": []
  },
  "next": [
    {"title": "...", "summary": "...", "category": "ops"}
  ],
  "recent": {
    "done": [
      {"title": "...", "ts": "...", "commit": "..."}
    ],
    "failed": []
  }
}
```

更新策略（v1，简单可预期）：
- `task.started` 覆盖 `now`
- `task.progress` 仅更新 `now.summary` 与 `updatedAt`
- `task.completed` 将 `now` 推入 `recent.done[0..N]`，并清空/置空 `now`
- `task.failed` 推入 `recent.failed`，并清空/置空 `now`

保留数量：`recent.done`/`recent.failed` 各最多 20 条。

---

## 5) 权限/安全

- OSS 权限：RAM 子账号仅允许 `dashboard/*` 前缀读写。
- 写入 token：`INGEST_TOKEN`（只给 Jarvis/自动化写入方）。
- 读接口：继续用 `ADMIN_PASSWORD` + JWT（给 dashboard-web 用户）。
- 日志：任何接口都不打印 env 明文。

---

## 6) 验收清单（你审核用）

- [ ] `POST /ingest/event` 能写入 `events/YYYY-MM-DD.json`
- [ ] `GET /state` 返回结构稳定，dashboard-web 可直接渲染
- [ ] 幂等：同 `Idempotency-Key` 重放不重复写
- [ ] 不破坏现有 dashboard-web 登录与 tasks/logs/status
- [ ] 单元测试覆盖 ingest + state 更新（至少 2-3 个）

---

## 7) 实施顺序（建议）

- MR A（本次）：只提交此 plan 文档，先让你 review 结构与接口。
- MR B：实现 ingest/state/events + tests。
- MR C：dashboard-web 增加 State + Timeline 页面（如果你需要）。
