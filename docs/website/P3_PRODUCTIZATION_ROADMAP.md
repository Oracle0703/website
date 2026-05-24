# P3 Personal Website Productization Roadmap

目标：把个人网站从“作品展示 + 博客 + Demo”推进到“可证明能力、可承接需求、可持续运营的小型个人产品系统”。

## 1. 当前基线

| 模块 | 当前状态 | P3 意义 |
|---|---|---|
| 首页 | 已有证据链、项目入口、内容入口、联系入口 | 可以继续强化第一屏的可信度和行动路径 |
| Projects | 已有 evidence、asset、architecture、tradeoffs、roadmap 字段 | 可以从“项目卡片”升级为“案例研究” |
| Blog | 已有 published/draft/series 校验和静态详情页 | 可以发展成专题内容系统 |
| Contact | 已有 intake form、校验、限流、JSONL 存储和 ops 清理 | 可以进入更明确的需求分流和后续运营 |
| AI Page Analysis | 已有 safe mock API、capture harness、SSRF/redirect/size/auth/content/timeout 边界 | 最适合作为网站的核心产品化入口 |
| Dashboard | 已有 tasks/logs/status/events/state 与 dashboard-web smoke | 可以承接内容运营与联系请求状态 |

## 2. P3 总策略

| 策略 | 说明 |
|---|---|
| 先产品化一个核心入口 | 优先把 AI Page Analysis 从 mock demo 推向真实可用 MVP |
| 让作品页承担信任证明 | 每个项目要能说明问题、约束、决策、实现、取舍、结果和下一步 |
| 让内容进入运营闭环 | 博客不是孤立文章，要与项目、工具和 dashboard 状态联动 |
| 保持安全与维护边界 | 不急于做账户、支付、CMS 编辑器和复杂后台写入 |

## 3. 阶段拆解

| 阶段 | 名称 | 目标 | 完成信号 |
|---|---|---|---|
| P3-A | AI Page Analysis V1 MVP | 真实 URL capture + 模型分析 + 稳定结构化结果 | 用户输入公开 URL 和 brief 后能得到可用诊断与 backlog |
| P3-B | Case Study 深化 | 重点项目升级为案例研究 | 访客能理解每个项目的背景、约束、技术判断和证据 |
| P3-C | Content Operations | 内容健康度进入 dashboard | Dashboard 能展示博客发布、草稿、metadata、series coverage |
| P3-D | Conversion Loop | 联系请求进入轻运营闭环 | Contact intake 可分流、可追踪、可清理、可复盘 |

## 4. P3-A - AI Page Analysis V1 MVP

### 4.1 范围

| 功能 | 做法 | 边界 |
|---|---|---|
| URL capture | 复用 D10 capture harness，抓取 title、summary、正文摘要 | 仍不使用浏览器爬虫，不分析登录后页面 |
| Brief 输入 | 从当前单字段扩展到 audience、goal、problem | 输入不足直接返回可恢复错误 |
| 模型分析 | 接入服务端模型调用，输出 scores/issues/recommendations/backlog | 必须做 output schema 校验，不接受自由文本直出 |
| 结果展示 | 前端渲染真实 API 返回结构，保留 low confidence 状态 | V1 不保存历史 |
| 错误体验 | 显示 invalid_url、auth_required_page、insufficient_page_content、capture_timeout、analysis_timeout 等错误 | 不清空用户输入 |

### 4.2 任务

| 顺序 | 任务 | 验收 |
|---:|---|---|
| 1 | 定义 `AnalysisBrief`、`AnalysisResult`、`AnalysisError` server schema | node:test 覆盖合法/非法输入 |
| 2 | 把 safe mock pipeline 拆成 `capture -> analyze -> normalize` 三段 | 单元测试可分别覆盖 |
| 3 | 增加模型调用 adapter，支持 env 开关回退 safe mock | 未配置模型时仍返回 mock，不影响构建 |
| 4 | 增加 output schema 校验与 `invalid_model_output` 错误 | 模型脏输出不会进入前端 |
| 5 | 前端 brief 表单改为结构化字段 | 中英文 copy、错误提示和 loading 状态完整 |
| 6 | 更新产品/技术规格与 release checklist | 文档无占位词 |

### 4.3 不做

| 不做 | 原因 |
|---|---|
| 登录和历史记录 | 会引入账户、存储、删除和权限复杂度 |
| PDF 导出 | 等结果结构和用户价值稳定后再做 |
| 截图上传 | 需要文件存储、扫描、大小限制和隐私策略 |
| 浏览器渲染爬虫 | SSRF、资源加载、成本和队列问题更复杂，单独设计 |

### 4.4 验证

| 命令 | 目标 |
|---|---|
| `npm test` | schema、capture、pipeline、前端契约测试 |
| `npm run audit:website-english-content` | 英文页面无 CJK 泄漏 |
| `npm run build:website` | Next production build |
| `git diff --check` | patch 格式 |

## 5. P3-B - Case Study 深化

### 5.1 范围

| 内容 | 做法 |
|---|---|
| 项目故事结构 | 每个重点项目增加 Problem、Constraints、Decision、Implementation、Result、Next |
| 证据资产 | AI Page Analysis、Tracker 至少保留 mock；Dashboard/Knock 先用 redacted diagram 或 none reason |
| 技术细节 | 项目详情页补“为什么这样做”和“没有做什么” |
| 转化路径 | 每个 case study 底部连接到相关文章、AI demo、contact intake |

### 5.2 任务

| 顺序 | 任务 | 验收 |
|---:|---|---|
| 1 | 扩展 Project model：`caseStudy` 字段 | Project tests 覆盖所有项目都有完整结构或明确 none |
| 2 | 更新 Project detail UI | 移动端不拥挤，信息块顺序合理 |
| 3 | 为 AI Page Analysis 写第一篇完整案例 | 中英内容均可展示 |
| 4 | 为 Tracker/Dashboard 补 redacted proof | 不暴露敏感任务、日志、IP、内部路径 |
| 5 | 更新截图验收 | browser verification 通过 |

### 5.3 边界

| 边界 | 说明 |
|---|---|
| 不伪造指标 | 没有真实转化/用户数据时不写夸张结果 |
| 不暴露内部运行数据 | Dashboard/Knock 截图必须脱敏或改用架构图 |
| 不把详情页变成长文博客 | 重点是决策证据，深度文章仍放 Blog |

## 6. P3-C - Content Operations

### 6.1 范围

| 功能 | 做法 |
|---|---|
| 内容快照脚本 | 生成 `dashboard/content-summary.json` |
| API | dashboard-api 增加 `GET /content/summary` |
| Dashboard 页面 | dashboard-web 增加 `/content` 只读页面 |
| 内容健康度 | 展示 published/draft/missing metadata/series coverage/latest posts/issues |

### 6.2 任务

| 顺序 | 任务 | 验收 |
|---:|---|---|
| 1 | 编写 `scripts/content-summary.mjs` | 输出稳定 JSON schema |
| 2 | 增加 content summary 测试 | 覆盖 published、draft、missing metadata、duplicate slug、series coverage |
| 3 | dashboard-api 增加只读 endpoint | 覆盖存在、缺失、无效 schema、未登录 |
| 4 | dashboard-web 增加 Content 页面 | `npm run build:dashboard-web` 通过 |
| 5 | 更新 dashboard docs | 明确 V1 不编辑 MDX |

### 6.3 边界

| 不做 | 原因 |
|---|---|
| Dashboard 直接编辑 MDX | 写 repo 文件需要 git/review/deploy/CMS 全链路 |
| 自动发布文章 | 发布应继续走 git 和 build 验证 |
| 上传附件 | 附件管理和引用校验单独设计 |

## 7. P3-D - Conversion Loop

### 7.1 范围

| 功能 | 做法 |
|---|---|
| Contact 分流 | 根据目标、预算、时间线和链接质量给出状态 |
| 提交状态 | 返回 `received`、`needs_more_context`、`likely_fit`、`not_fit` 等内部分类 |
| 运维视图 | dashboard 后续可展示 submissions summary，而不是公开列表 |
| 通知 | 可接 webhook，但失败必须不影响保存 |

### 7.2 任务

| 顺序 | 任务 | 验收 |
|---:|---|---|
| 1 | 为 contact submission 增加 `classification` 字段 | 单元测试覆盖不同输入质量 |
| 2 | 增加 ops summary 命令 | 不输出敏感联系方式明文，支持日期范围 |
| 3 | dashboard-api 增加只读 contact summary | 需要 admin JWT |
| 4 | dashboard-web 增加 Contact Ops 页面或卡片 | 无敏感字段泄漏 |
| 5 | 更新 privacy/retention 文档 | 删除、保留、通知失败边界清楚 |

### 7.3 边界

| 不做 | 原因 |
|---|---|
| 公开展示联系请求 | 涉及隐私 |
| 自动拒绝用户 | 只做内部分类，不对外展示判断 |
| 保存原始 IP | 当前隐私策略不保存 raw IP |

## 8. 推荐执行顺序

| 优先级 | 阶段 | 原因 |
|---|---|---|
| P0 | P3-A AI Page Analysis V1 MVP | 已有 D9/D10 技术基线，最容易形成产品差异 |
| P1 | P3-B Case Study 深化 | 提升陌生访客信任和项目转化 |
| P1 | P3-C Content Operations | 让长期内容进入可运营状态 |
| P2 | P3-D Conversion Loop | 在联系请求增加后再做更有价值 |

## 9. 总体验收

| 维度 | 标准 |
|---|---|
| 产品 | 网站至少有一个真实可用工具入口，而不是只有展示页 |
| 信任 | 重点项目有可复核 case study 和明确边界 |
| 内容 | Dashboard 能展示内容健康度，不靠人工记忆 |
| 转化 | Contact intake 能保存、清理、分类和复盘 |
| 工程 | 每个阶段有测试、构建、英文审计和 release checklist |

## 10. 下一步建议

先执行 P3-A，原因是它的技术前置已经完成最多。建议下一份计划命名为：

```text
docs/website/P3A_AI_PAGE_ANALYSIS_V1_IMPLEMENTATION_PLAN.md
```

该计划应拆成：

| Task | 内容 |
|---:|---|
| 1 | schema 与错误码 |
| 2 | pipeline 分层 |
| 3 | model adapter |
| 4 | frontend brief/result state |
| 5 | docs 与 release checklist |
| 6 | full verification |
