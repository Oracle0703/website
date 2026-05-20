# 私人网站 Phase 2 精修与产品化方案

## 1. 总目标

| 层级 | 定位 | 说明 |
|---|---|---|
| 对外 | 个人品牌官网 | 让访问者快速理解“我是谁、做什么、能交付什么” |
| 内容 | 技术与产品思考库 | 博客形成主题、系列、阅读路径，而不是孤立文章 |
| 作品 | 项目案例集 | Labs、Tracker、AI 页面分析、Knock、Dashboard 沉淀为作品案例 |
| 内部 | 运营控制台 | Dashboard 追踪内容、部署、日志、任务和系统健康 |
| 长期 | 小产品孵化器 | 从个人站中孵化可真实使用的工具或产品 |

核心闭环：

| 输入 | 系统 | 输出 |
|---|---|---|
| 想法 | Labs | 原型 |
| 原型 | Projects | 作品案例 |
| 实践过程 | Blog | 内容资产 |
| 运行状态 | Dashboard / Knock | 运营反馈 |
| 成熟方向 | AI Page Analysis / Tracker | 产品化 |

本阶段优先建设“内容 + 作品 + 工程可信度”，避免过早陷入复杂后端或商业化功能。

## 2. 信息架构

| 一级入口 | 二级内容 | 目标 |
|---|---|---|
| 首页 `/` | 个人定位、精选文章、精选作品、当前构建中项目 | 首屏建立认知 |
| 博客 `/blog` | 最新文章、系列、分类、标签、推荐阅读 | 内容消费 |
| 作品 `/projects` | AI 页面分析、Tracker、Knock、Dashboard、Timestamp Tool | 展示真实能力 |
| 实验室 `/labs` | 小工具、原型、可交互实验 | 展示探索能力 |
| 关于 `/about` | 技术栈、工作方式、价值观、时间线 | 建立人设 |
| 联系 `/contact` | 邮箱、社交链接、合作说明 | 转化 |
| 控制台 `/dashboard` | 任务、状态、日志、内容、部署 | 内部运营 |

边界：

| 问题 | 决策 |
|---|---|
| Labs 和 Projects 是否合并 | 不合并。Labs 表示实验，Projects 表示可展示案例 |
| 首页是否做营销落地页 | 不做。首页应服务个人认知、内容入口和作品入口 |
| Dashboard 是否公开展示 | 不公开，继续作为内部控制台 |

## 3. 首页精修方向

| 区块 | 内容 | 边界条件 |
|---|---|---|
| Hero | 一句话定位 + 2 个 CTA：看作品 / 看文章 | 不使用空泛口号，必须说明能力范围 |
| 当前构建中 | 展示最近正在推进的项目，例如 AI 页面分析助手 | 无数据时展示最近更新文章 |
| 精选作品 | 3 个项目卡片：AI 页面分析、Tracker、Knock | 项目未完成时标记 Prototype / MVP |
| 内容入口 | 最新文章 + 推荐系列 | 没有系列时退化为最新文章 |
| 能力标签 | Full-stack、AI App、Infra、Product Design | 最多 8 个，不堆关键词 |
| 联系入口 | 简洁说明可合作方向 | 不做大段营销文案 |

首页判断标准：访问者 10 秒内能理解这个网站展示的是“产品化网站、AI 工具、后台系统、内容系统和部署运维能力”。

## 4. 博客体系

| 功能 | 设计 |
|---|---|
| 文章状态 | 保留 `draft / scheduled / published / archived` |
| 分类 | Engineering、Product、AI、Ops、Labs、Personal |
| 系列 | 例如“个人网站搭建”“AI 产品化”“工程质量”“打卡系统设计” |
| 标签 | 用于细分检索，不作为主要导航 |
| 相关阅读 | 优先 `relatedPosts`，其次同系列，再同分类，再同标签 |
| 目录 | 保留当前 H2/H3 自动目录 |
| 文章页 CTA | 文章末尾推荐下一篇、相关项目或联系入口 |

建议新增 frontmatter：

```yaml
series:
  id: "ai-productization"
  title: "AI 产品化实践"
  order: 2
```

边界：

| 场景 | 处理 |
|---|---|
| 没有发布文章 | 博客页显示空状态 + 返回首页 |
| draft 被访问 | 404，不泄漏内容 |
| scheduled 未到时间 | 404，不进入 sitemap |
| 中文 slug | 保持支持，新文章推荐英文 slug |
| frontmatter 无效 | dev warning；production 不渲染 |
| 相关文章不存在 | 自动跳过，不阻塞页面 |
| 分类为空 | 不展示分类入口 |
| 图片缺 alt | 内容校验失败或 build warning |

## 5. Projects 作品系统

统一项目模型：

| 字段 | 示例 |
|---|---|
| 标题 | AI 页面分析与改版方案助手 |
| 状态 | Concept / Prototype / MVP / Live |
| 类型 | AI Tool / Dashboard / Infra / Frontend Tool |
| 解决的问题 | 页面改版讨论主观、缺少证据链 |
| 我的工作 | 产品设计、前端实现、Mock API、交互流程 |
| 技术栈 | Next.js、TypeScript、Tailwind |
| 亮点 | 生成流水线、结构化输出、Backlog 生成 |
| 当前限制 | 尚未接真实模型 |
| 下一步 | 文件上传、真实分析、导出 PDF |

首批项目：

| 项目 | 价值 |
|---|---|
| AI 页面分析助手 | 最适合产品化，是未来重点 |
| Tracker 打卡系统 | 产品规则、激励机制、反作弊设计 |
| Knock 日志监控 | 运维、安全、数据可视化能力 |
| Dashboard Console | 后台、OSS 数据、任务状态系统 |
| Timestamp Tool | 小而完整的工具体验 |

项目详情页结构：

| 区块 | 内容 |
|---|---|
| Hero | 项目名称、状态、简介、入口 |
| Problem | 为什么做 |
| Solution | 如何解决 |
| Demo | 截图、交互或视频 |
| Architecture | 简化架构图 |
| Implementation | 关键技术点 |
| Trade-offs | 取舍与限制 |
| Roadmap | 下一步 |

## 6. AI 页面分析助手产品化路线

| 阶段 | 目标 | 功能 |
|---|---|---|
| V0 | 展示型 Demo | 当前已有 Mock Pipeline |
| V1 | 可用 MVP | 输入 URL / Brief，返回结构化诊断 |
| V2 | 文件能力 | 上传截图，生成视觉层级建议 |
| V3 | 协作能力 | 保存历史记录、分享链接、导出 PDF |
| V4 | 工作流产品 | 生成 redesign backlog，连接任务系统 |

核心数据流：

| 步骤 | 输入 | 输出 |
|---|---|---|
| Capture | URL / Screenshot / Brief | 页面素材 |
| Parse | HTML / 文本 / 图片说明 | 页面结构 |
| Diagnose | 页面结构 + 业务目标 | 问题清单 |
| Recommend | 问题 + 优先级 | 改版方案 |
| Deliver | 方案 | Backlog / PDF / 分享页 |

边界：

| 场景 | 处理 |
|---|---|
| URL 无法访问 | 返回“无法抓取”，允许用户改用 Brief |
| 页面需要登录 | 明确提示暂不支持 |
| 输入太短 | 要求补充业务目标和受众 |
| 模型失败 | 展示可重试状态，不清空输入 |
| 结果置信度低 | 标记“需要人工复核” |
| 用户上传图片过大 | 限制大小并压缩 |
| 生成内容不稳定 | 保存原始输入和生成版本 |

## 7. Dashboard 运营后台

| 模块 | 作用 |
|---|---|
| Overview | 当前站点状态、最近部署、最近任务 |
| Content | 博客草稿、发布状态、缺失字段检查 |
| Deployments | 构建记录、版本、回滚入口 |
| Logs | dashboard-api / knock / website 日志摘要 |
| Tasks | 运营任务、内容任务、开发任务 |
| Settings | API Base、刷新偏好、访问模式 |

边界：

| 场景 | 处理 |
|---|---|
| API 不可用 | Dashboard 显示离线状态，不白屏 |
| token 过期 | 清 token 并回登录页 |
| OSS 读取失败 | 显示错误，不覆盖数据 |
| 多端同时写任务 | ETag 冲突提示刷新 |
| 无日志 | 显示空状态 |
| 未配置 ingest token | 后台展示 ingest disabled |

## 8. 工程质量路线

| 方向 | 具体动作 |
|---|---|
| Node 版本 | 固定 Node 22，补 `.nvmrc` 或 Volta 配置 |
| CI | 根测试、website build、dashboard-api test、knock test 分开跑 |
| 内容校验 | 增加 MDX frontmatter 校验脚本 |
| 图片策略 | 封面图用 `next/image`，MDX 内容图制定规则 |
| 性能 | 减少 cookie 导致的动态 SSR，能静态的页面静态化 |
| 安全 | dashboard / knock 所有公网入口必须鉴权 |
| 部署 | website / dashboard-api / knock 都有明确 runbook |
| 监控 | Knock + Dashboard 汇总线上状态 |

## 9. 推荐实施顺序

| 顺序 | 任务 | 原因 |
|---|---|---|
| 1 | 新增 Projects 数据模型和 `/projects` 页面 | 立刻提升网站表达力 |
| 2 | 精修博客详情页和文章系列能力 | 内容体系闭环 |
| 3 | 重构首页信息架构 | 把作品和内容串起来 |
| 4 | AI 页面分析助手 V1 设计 | 找到产品化主线 |
| 5 | Dashboard Content 模块 | 让内容运营进入后台 |
| 6 | 性能与静态化优化 | 提升工程质量 |
| 7 | Knock 接入 Dashboard 摘要 | 运维闭环 |

## 10. Phase 2 验收标准

| 维度 | 标准 |
|---|---|
| 表达力 | 首页能清晰传达个人定位、内容方向和作品能力 |
| 内容体系 | 博客有系列、分类、标签和推荐阅读路径 |
| 作品展示 | 至少 5 个项目以统一模型展示 |
| 工程质量 | 根测试、主站 build、dashboard-api test、dashboard-web build 通过 |
| 安全边界 | dashboard / knock 公开访问必须有鉴权说明和配置 |
| 可持续性 | 后续新增文章、项目、实验无需复制大段页面代码 |
