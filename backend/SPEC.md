# 后端接口规格（Go / API v1）

## 基础约定
- Base URL：`/api/v1`
- 数据格式：JSON（`application/json`）
- 时间格式：`YYYY-MM-DD`（日期），`YYYY-MM-DDTHH:mm:ssZ`（时间）
- 时区规则：默认按本地时区展示，服务端统一以 UTC 存储

## 统一响应结构
**成功**
```json
{ "data": { } }
```

**失败**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

## 分页规则
- 入参：`page`、`pageSize`
- 返回：`meta.page`、`meta.pageSize`、`meta.total`、`meta.totalPages`

## 认证与权限
- P0：单用户模式，无需认证
- P1：JWT（`Authorization: Bearer <token>`）

## 数据模型（摘要）
**BlogPost**
- `slug`, `title`, `summary`, `tags`, `date`, `updatedAt`, `cover`, `author`, `draft`

**LabProject**
- `id`, `title`, `summary`, `tags`, `status`, `demoUrl`, `repoUrl`, `createdAt`, `updatedAt`

**Habit**
- `id`, `name`, `description`, `frequency`, `targetCount`, `startDate`, `isArchived`

**CheckIn**
- `id`, `habitId`, `date`, `note`

## 接口清单
### Health
- `GET /api/v1/health`

### Blog（只读）
- `GET /api/v1/blog/posts`（支持 `tag`、`q`、`page`、`pageSize`）
- `GET /api/v1/blog/posts/{slug}`

### Labs（只读）
- `GET /api/v1/labs/projects`（支持 `tag`、`type`、`status`）
- `GET /api/v1/labs/projects/{id}`

### Tracker（读写）
- `GET /api/v1/tracker/habits`
- `POST /api/v1/tracker/habits`
- `GET /api/v1/tracker/habits/{id}`
- `PATCH /api/v1/tracker/habits/{id}`
- `DELETE /api/v1/tracker/habits/{id}`
- `POST /api/v1/tracker/habits/{id}/checkins`
- `DELETE /api/v1/tracker/habits/{id}/checkins/{date}`
- `GET /api/v1/tracker/habits/{id}/checkins?from=&to=`
- `GET /api/v1/tracker/stats?from=&to=`

## 状态码规范
- `200` 成功
- `201` 创建成功
- `204` 删除成功（无内容）
- `400` 参数错误
- `401` 未认证
- `404` 资源不存在
- `409` 冲突（如重复 slug）
- `500` 服务端错误

## 验收标准（DoD）
- P0 接口在本地可联调并返回统一结构
- 过滤与分页行为符合规则
- 错误码与错误信息可追踪
