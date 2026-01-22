# 后端项目说明（Go）

## 背景与目标
为个人网站前端提供统一的数据与业务接口，覆盖博客、Labs 与打卡学习平台的核心需求，支持后续功能扩展与部署。

## 范围
- 博客：文章列表与详情的只读接口（与 MDX 内容对接）
- Labs：项目列表与详情的只读接口
- 打卡平台：习惯与打卡记录的读写接口
- 通用：健康检查与版本信息

## 技术栈与基础约定
- 语言：Go 1.22
- Web 框架：Gin
- 数据访问：GORM
- 数据库：开发期 SQLite，生产期 PostgreSQL
- 配置与环境变量：`.env` + 配置加载器
- 迁移：golang-migrate
- 日志：结构化日志（如 zap）

## 目录结构（计划）
```
backend/
  cmd/api/                 # 启动入口
  internal/handlers/       # HTTP 处理层
  internal/service/        # 业务逻辑层
  internal/store/          # 数据访问层
  internal/model/          # 数据模型
  migrations/              # 数据库迁移
  configs/                 # 配置文件
  scripts/                 # 脚本
```

## API 约定
- Base URL：`/api/v1`
- 数据格式：JSON
- 统一错误结构：`{ "error": { "code": "...", "message": "...", "details": {} } }`
- 分页参数：`page`、`pageSize`

## 环境变量（初始）
- `PORT`：服务端口
- `DATABASE_URL`：数据库连接字符串
- `CORS_ORIGINS`：允许的前端来源
- `ENV`：运行环境（dev/staging/prod）
