import type { Locale } from "./i18n";

export type ProjectStatus = "concept" | "prototype" | "mvp" | "live";

export type ProjectType =
  | "ai-tool"
  | "dashboard"
  | "infra"
  | "frontend-tool"
  | "product-system";

export type ProjectEvidence = {
  label: string;
  value: string;
};

export type ProjectArchitectureStep = {
  title: string;
  description: string;
};

export type ProjectDecision = {
  decision: string;
  rationale: string;
  impact: string;
};

export type ProjectAsset =
  | {
      kind: "screenshot" | "mock" | "diagram";
      src: string;
      alt: string;
      caption: string;
    }
  | {
      kind: "doc";
      label: string;
      href: string;
      description: string;
    }
  | {
      kind: "none";
      reason: string;
      nextAssetStep: string;
    };

export type ProjectDemo =
  | {
      status: "available";
      label: string;
      href: string;
      description: string;
      external?: boolean;
    }
  | {
      status: "unavailable";
      reason: string;
    };

export type ProjectSourceEntry = {
  label: string;
  href: string;
  description: string;
};

export type ProjectEntry = {
  demo: ProjectDemo;
  source: ProjectSourceEntry;
};

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  status: ProjectStatus;
  type: ProjectType;
  summary: string;
  problem: string;
  solution: string;
  role: string[];
  stack: string[];
  highlights: string[];
  evidence: ProjectEvidence[];
  asset: ProjectAsset;
  gallery: ProjectAsset[];
  architecture: string;
  architectureSteps: ProjectArchitectureStep[];
  decisions: ProjectDecision[];
  tradeoffs: string[];
  roadmap: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
  entry: ProjectEntry;
  featured?: boolean;
};

export type LocalizedProjectContent = {
  title: string;
  subtitle: string;
  summary: string;
  problem: string;
  solution: string;
  role: string[];
  highlights: string[];
  evidence: ProjectEvidence[];
  asset: ProjectAsset;
  gallery: ProjectAsset[];
  architecture: string;
  architectureSteps: ProjectArchitectureStep[];
  decisions: ProjectDecision[];
  tradeoffs: string[];
  roadmap: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
  entry: ProjectEntry;
};

export type ProjectView = {
  slug: string;
  updatedAt: string;
  status: ProjectStatus;
  type: ProjectType;
  stack: string[];
  featured?: boolean;
} & LocalizedProjectContent;

export const projects: Project[] = [
  {
    slug: "ai-page-analysis",
    title: "AI 页面分析与改版方案助手",
    subtitle: "从页面输入到结构化诊断和改版 backlog 的 AI 产品原型",
    updatedAt: "2026-07-16",
    status: "prototype",
    type: "ai-tool",
    summary:
      "一个面向产品、运营和设计讨论的页面分析工具，用结构化评分、问题拆解和改版建议降低主观争论。",
    problem:
      "页面改版常停留在个人审美和碎片意见上，缺少面向目标受众、业务目标和页面结构的统一证据链。",
    solution:
      "URL 模式通过服务端安全抓取公开 HTML，再以可控的 Safe Mock 生成结构化评分、问题和 backlog；截图说明与 Brief 模式继续在浏览器内运行固定 mock。",
    role: ["产品范围定义", "信息架构设计", "Next.js 前端实现", "Mock 分析流水线", "交互状态设计"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Structured Output"],
    highlights: ["分析步骤可解释", "输出结构适合转任务", "失败与低置信度状态可扩展"],
    evidence: [
      { label: "可体验 Demo", value: "公开页面已覆盖输入、流水线、评分、问题、建议和 backlog" },
      { label: "安全抓取", value: "URL 路径已实现 DNS 与重定向逐跳校验、大小限制、超时和内网地址拦截" },
      { label: "双语展示", value: "中文根路径和英文 /en 路径共用同一 locale-aware 页面组件" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/ai-page-analysis-product-mock.svg",
      alt: "AI 页面分析助手的 product mock，展示 URL 输入、评分、问题和 backlog 结构",
      caption:
        "Product mock：URL 可经过安全抓取，但评分和建议仍来自 Safe Mock；当前未接入真实模型。"
    },
    gallery: [
      {
        kind: "doc",
        label: "查看安全抓取技术规格",
        href: "https://github.com/Oracle0703/website/blob/main/docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md",
        description: "公开规格记录 URL 校验、SSRF、错误码、输出 schema 和模型边界。"
      }
    ],
    architecture:
      "客户端负责三种输入模式与交互状态；URL 模式调用 Next.js API 完成受限网页抓取，再生成可复现的 Safe Mock 结果，截图说明和 Brief 模式则留在浏览器内。",
    architectureSteps: [
      { title: "浏览器输入", description: "统一承载 URL、截图说明和业务 Brief 三种输入与流水线状态。" },
      { title: "按模式分流", description: "URL 请求 POST /api/analyze；截图说明和 Brief 使用客户端固定 mock。" },
      { title: "安全 URL 抓取", description: "服务端逐跳检查 DNS 与重定向，拒绝内网和 metadata 地址，并限制响应大小与超时。" },
      { title: "Safe Mock 输出", description: "抓取标题与 Brief 进入确定性结果生成器，输出评分、问题、建议和 backlog，不调用真实模型。" },
      { title: "结果界面", description: "客户端呈现进度、失败状态和结构化交付结果。" }
    ],
    decisions: [
      {
        decision: "把安全抓取与模型生成拆成两个边界",
        rationale: "公开 URL 抓取需要先独立解决 SSRF、重定向、体积和超时风险。",
        impact: "可以验证真实页面输入链路，同时明确评分与建议仍是 Safe Mock。"
      },
      {
        decision: "只有 URL 模式进入服务端 API",
        rationale: "截图说明和 Brief 不需要网络抓取，留在浏览器可减少服务端负担与数据暴露。",
        impact: "三种模式共享体验，但运行路径和能力边界在页面中清楚区分。"
      },
      {
        decision: "暂不保存分析历史",
        rationale: "首版优先验证输入与输出结构，不引入账户、数据库和额外隐私责任。",
        impact: "部署保持轻量，但用户刷新后无法复盘或比较历史结果。"
      }
    ],
    tradeoffs: [
      "真实 URL 抓取已落地，但结果生成继续使用 Safe Mock，避免把演示误写成真实模型分析。",
      "不保存历史记录，减少隐私和账户系统复杂度，但也牺牲了复盘能力。",
      "截图说明和 Brief 留在浏览器内，减少服务端输入面，但目前不解析真实图片文件。"
    ],
    roadmap: ["接入模型分析并稳定结构化输出", "增加低置信度复核", "增加结果分享、PDF 导出和历史记录"],
    limitations: ["当前未接真实模型", "暂不保存历史记录", "尚未支持登录后页面分析"],
    nextSteps: ["接入真实模型分析", "补模型输出校验与复核状态", "增加分享页和 PDF 导出"],
    links: [{ label: "查看页面", href: "/ai-page-analysis" }],
    entry: {
      demo: {
        status: "available",
        label: "体验公开 Demo",
        href: "/ai-page-analysis",
        description: "体验 URL 安全抓取、客户端 mock 流程和结构化结果界面。"
      },
      source: {
        label: "查看核心实现",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/lib/ai-page-analysis.ts",
        description: "查看 URL 校验、抓取边界、请求频率限制和 Safe Mock 输出实现。"
      }
    },
    featured: true
  },
  {
    slug: "tracker",
    title: "修行打卡系统",
    subtitle: "无需账户的本地优先习惯追踪工具",
    updatedAt: "2026-07-16",
    status: "mvp",
    type: "product-system",
    summary:
      "一个可直接使用的轻量习惯工具，支持自定义习惯、每日打卡、连续天数、七日统计和 JSON 备份。",
    problem:
      "普通打卡工具容易只记录完成与否，缺少对目标、连续性、激励和反作弊边界的系统化设计。",
    solution:
      "以日常打卡为核心，在浏览器本地保存记录并提供严格校验的导入导出，让个人习惯具备可观察、可迁移的反馈链路。",
    role: ["产品规则设计", "前端页面实现", "交互流程设计", "激励机制梳理"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    highlights: ["无需登录即可使用", "本地数据可导入导出", "输入与备份边界经过严格校验"],
    evidence: [
      { label: "公开入口", value: "Tracker 页面已进入中英文公开路由、sitemap 和浏览器验收" },
      { label: "可用闭环", value: "支持创建习惯、今日打卡、连续天数、七日统计以及删除和重置确认" },
      { label: "数据边界", value: "记录只持久化到当前浏览器，可通过版本化 JSON 手动备份和迁移" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/tracker-product-mock.svg",
      alt: "修行打卡系统的 product mock，展示目标、打卡、连续性和复盘模块",
      caption:
        "Product mock：说明 Tracker 的目标、打卡和反馈结构；实际页面使用 localStorage 持久化，不包含账户或云同步。"
    },
    gallery: [
      {
        kind: "doc",
        label: "查看本地优先功能说明",
        href: "https://github.com/Oracle0703/website/blob/main/docs/website/LOCAL_FIRST_FEATURES.md",
        description: "公开文档记录 v1 schema、容量限制、导入校验、备份方式和隐私边界。"
      }
    ],
    architecture:
      "交互界面在浏览器运行，版本化 v1 schema 保存到 localStorage；导入路径限制大小、字段、日期、重复项和数量，服务器不保存习惯记录。",
    architectureSteps: [
      { title: "客户端界面", description: "创建习惯、打卡、撤销、删除和重置都在浏览器中完成。" },
      { title: "v1 schema 校验", description: "统一校验名称、日期、重复项、记录数量和导入文件大小。" },
      { title: "localStorage", description: "版本化数据以明文保存在当前浏览器，不上传到网站服务器。" },
      { title: "本地统计与备份", description: "由本地记录计算连续天数和七日统计，并通过 JSON 完成手动导入导出。" }
    ],
    decisions: [
      {
        decision: "采用无需账户的 local-first 数据模型",
        rationale: "个人习惯数据不需要为了基本打卡功能进入服务器和账户系统。",
        impact: "部署成本和隐私暴露更低，但不会自动跨设备同步。"
      },
      {
        decision: "备份文件进入严格校验路径",
        rationale: "导入 JSON 会覆盖本地状态，必须限制版本、字段、日期、重复项和容量。",
        impact: "迁移更可控；不合法文件会被拒绝且不会覆盖现有数据。"
      },
      {
        decision: "统计聚焦连续天数和最近七日",
        rationale: "首版优先提供容易理解、能由本地记录直接复算的反馈。",
        impact: "核心闭环清晰，但月度趋势和更长周期复盘仍在 roadmap。"
      }
    ],
    tradeoffs: [
      "不做账户和数据库让使用与部署更轻，但数据不会自动跨设备同步。",
      "localStorage 提供真实持久化和零服务端成本，但清理浏览器数据前必须手动导出备份。",
      "统计保持在七日和连续天数，优先保证规则可解释与数据可迁移。"
    ],
    roadmap: ["增加月度回顾视图", "补 CSV 导出", "评估可选加密同步的成本与隐私边界"],
    limitations: ["数据只保存在当前浏览器", "没有账户、提醒或云同步", "备份文件需要用户自行保管"],
    nextSteps: ["增加月度回顾", "补更多可迁移格式", "继续验证本地优先隐私文案"],
    links: [{ label: "进入打卡", href: "/tracker" }],
    entry: {
      demo: {
        status: "available",
        label: "打开 Tracker",
        href: "/tracker",
        description: "无需登录即可创建习惯和打卡；数据只保存在当前浏览器。"
      },
      source: {
        label: "查看本地数据实现",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/lib/tracker-local.ts",
        description: "查看 schema、解析、序列化、校验、streak 和七日统计逻辑。"
      }
    },
    featured: true
  },
  {
    slug: "knock",
    title: "Knock 访问日志监控",
    subtitle: "轻量访问日志、事件记录和安全边界验证服务",
    updatedAt: "2026-07-16",
    status: "mvp",
    type: "infra",
    summary:
      "一个服务端日志监控模块，用于记录访问事件、解析日志并验证公网入口的基础鉴权边界。",
    problem:
      "个人项目上线后容易缺少最小可用的访问观察能力，出现异常访问、配置错误或公开入口风险时不易定位。",
    solution:
      "用 Node 服务收集、解析和展示关键访问事件，并通过可选 Basic Auth 控制监控入口访问。",
    role: ["Node 服务实现", "日志解析", "Basic Auth 接入", "运行文档维护"],
    stack: ["Node.js", "TypeScript", "better-sqlite3", "node:test"],
    highlights: ["部署成本低", "鉴权配置清晰", "适合接入 Dashboard 汇总"],
    evidence: [
      { label: "MVP 形态", value: "已覆盖访问事件记录、日志解析和基础鉴权入口" },
      { label: "测试边界", value: "Node 22 和原生模块 ABI 是当前本地验证前提" },
      { label: "运营价值", value: "可作为 Dashboard Console 的运行摘要来源" }
    ],
    asset: {
      kind: "none",
      reason: "访问日志可能包含 IP、请求路径和运行时间线，当前不公开原始监控截图。",
      nextAssetStep: "先生成脱敏运行摘要或架构图，再作为公开资产补充到项目详情。"
    },
    gallery: [
      {
        kind: "doc",
        label: "查看 Knock 运行说明",
        href: "https://github.com/Oracle0703/website/blob/main/docs/knock/README.md",
        description: "公开文档记录日志输入、配置、鉴权要求、构建测试和 Windows 部署入口。"
      }
    ],
    architecture:
      "Knock 增量读取 Nginx access log，解析后写入本机 SQLite；Express API 聚合时间窗口、状态码和可疑请求，并由 Basic Auth 保护监控界面。",
    architectureSteps: [
      { title: "Nginx access log", description: "服务按已保存的文件 offset 增量读取日志，并识别截断或轮转。" },
      { title: "解析与标记", description: "解析请求字段并标记可疑访问，批量写入同一事务。" },
      { title: "SQLite WAL", description: "本机数据库保存请求记录、索引和可配置保留周期的数据。" },
      { title: "Express API", description: "按 1h、24h 或 7d 窗口输出概览、时间序列、Top IP、Top Path 和可疑请求。" },
      { title: "受保护的监控界面", description: "静态 dashboard 调用同源 API；对外暴露时要求 Basic Auth 或等效访问控制。" }
    ],
    decisions: [
      {
        decision: "增量读取日志而不是重复扫描完整文件",
        rationale: "offset state 可以在轮询时只处理新增字节，并对截断或轮转做 best-effort 恢复。",
        impact: "单机持续采集开销更低，但 state 文件和日志路径必须保持一致。"
      },
      {
        decision: "使用 SQLite WAL 保存监控数据",
        rationale: "个人服务器需要低维护、可查询且无需独立数据库服务的存储。",
        impact: "部署简单并支持聚合查询，但仍是单机、单写入形态。"
      },
      {
        decision: "监控入口使用 Basic Auth 边界",
        rationale: "访问日志包含 IP、路径和 user-agent，不能作为无保护的公开页面。",
        impact: "可覆盖个人运维入口，但不能替代完整的多用户权限与审计系统。"
      }
    ],
    tradeoffs: [
      "SQLite 降低部署和维护成本，但不适合高并发或多实例写入。",
      "Basic Auth 足够覆盖个人项目监控入口，但不是完整权限系统。",
      "保留周期清理随 ingest 执行，配置简单，但停用 ingest 时不会独立运行清理任务。"
    ],
    roadmap: ["接入 Dashboard 摘要卡片", "补日志轮转与保留周期运行观测", "完善部署健康检查和告警信号"],
    limitations: ["完整测试依赖 Node 22 ABI", "当前仍是单机 SQLite 形态"],
    nextSteps: ["接入 Dashboard 摘要", "验证日志轮转恢复", "完善部署健康检查"],
    links: [],
    entry: {
      demo: {
        status: "unavailable",
        reason: "监控页面依赖真实访问日志并可能暴露 IP、请求路径和运行时间线，因此不提供公开 Demo。"
      },
      source: {
        label: "查看 Knock 源码",
        href: "https://github.com/Oracle0703/website/tree/main/apps/knock",
        description: "查看日志解析、增量 ingest、SQLite schema、聚合 API、鉴权和静态 dashboard。"
      }
    }
  },
  {
    slug: "dashboard-console",
    title: "Dashboard Console",
    subtitle: "内部运营控制台与任务、日志、事件状态管理",
    updatedAt: "2026-07-16",
    status: "mvp",
    type: "dashboard",
    summary:
      "一个面向个人网站运营的控制台，聚合任务、日志、事件和系统状态，帮助项目进入可维护状态。",
    problem:
      "内容、部署、日志和任务散落在不同位置，长期维护时难以快速判断系统当前状态与下一步优先级。",
    solution:
      "通过 dashboard-api 读写任务和事件数据，dashboard-web 展示可操作的状态视图，并保留 OSS 与 ETag 冲突边界。",
    role: ["API 设计", "OSS 存储接入", "冲突处理", "控制台信息架构"],
    stack: ["Node.js", "TypeScript", "React", "OSS"],
    highlights: ["读写路径有错误边界", "任务状态可追踪", "适合扩展内容运营模块"],
    evidence: [
      { label: "状态聚合", value: "任务、日志、事件和系统状态被收敛到统一控制台模型" },
      { label: "冲突边界", value: "OSS 与 ETag 冲突作为设计约束被保留" },
      { label: "扩展方向", value: "后续可承接内容运营、部署记录和 Knock 摘要" }
    ],
    asset: {
      kind: "none",
      reason: "内部控制台可能包含任务、日志、OSS 对象和部署状态，不适合直接公开截图。",
      nextAssetStep: "先裁剪敏感字段或制作公开架构图，再进入项目资产展示。"
    },
    gallery: [
      {
        kind: "doc",
        label: "查看 Dashboard 架构计划",
        href: "https://github.com/Oracle0703/website/blob/main/docs/dashboard/PLAN.md",
        description: "公开文档记录 monorepo 结构、OSS 数据布局、API surface、ETag 规则和测试要求。"
      }
    ],
    architecture:
      "控制台由 dashboard-api 负责任务和事件读写，dashboard-web 渲染运营状态视图；存储层暂以 OSS 对象和 ETag 边界处理并发冲突。",
    architectureSteps: [
      { title: "dashboard-web", description: "Next.js 客户端完成管理员登录，并读取当前状态和最近事件。" },
      { title: "双鉴权入口", description: "管理员 API 使用 JWT；自动事件 ingest 使用独立 INGEST_TOKEN。" },
      { title: "dashboard-api", description: "Express 路由提供 state、events、tasks、logs 和 status 的读写边界。" },
      { title: "OSS JSON 文档", description: "状态、任务、每日事件和日志按固定 key 保存到对象存储。" },
      { title: "ETag 冲突处理", description: "任务和追加数组使用条件写入与有限重试，冲突时返回明确错误或重试。" }
    ],
    decisions: [
      {
        decision: "把 dashboard-web 与 dashboard-api 分开部署",
        rationale: "界面迭代和运营数据读写具有不同运行边界，API 也需要被自动事件入口调用。",
        impact: "前后端职责清楚，但部署时必须正确配置 API base、CORS 和反向代理。"
      },
      {
        decision: "管理员与自动 ingest 使用不同令牌",
        rationale: "自动任务只需要写事件，不应该获得管理员读取和修改控制台数据的权限。",
        impact: "权限面更小，但运维时需要分别管理 JWT secret、管理员密码和 INGEST_TOKEN。"
      },
      {
        decision: "以 OSS JSON 和 ETag 处理低频运营数据",
        rationale: "个人项目的数据量和写入频率可以优先换取低成本、易备份的对象存储。",
        impact: "无需常驻数据库，但并发写入必须显式处理 412/409 冲突。"
      }
    ],
    tradeoffs: [
      "先做运营只读和状态管理，避免直接编辑 MDX 带来的内容破坏风险。",
      "OSS 对象存储便于低成本部署，但并发编辑需要更严格冲突处理。",
      "控制台聚合能力优先于复杂权限，权限与审计需要后续增强。"
    ],
    roadmap: ["增加 Content 只读模块", "接入部署记录和健康状态", "补权限、审计和 Knock 运行摘要"],
    limitations: ["当前不直接编辑 MDX", "权限与审计仍需继续增强"],
    nextSteps: ["增加 Content 只读模块", "接入部署记录", "聚合 Knock 运行摘要"],
    links: [],
    entry: {
      demo: {
        status: "unavailable",
        reason: "控制台包含内部任务、事件、日志和部署状态，并依赖管理员鉴权，因此不开放公共 Demo。"
      },
      source: {
        label: "查看 Dashboard 源码",
        href: "https://github.com/Oracle0703/website/tree/main/apps/dashboard-api",
        description: "从 API 实现进入仓库，可同时查看配套的 dashboard-web 客户端和测试。"
      }
    }
  },
  {
    slug: "timestamp-tool",
    title: "时间戳转换工具",
    subtitle: "内置于 Labs 的小而完整的前端工具体验",
    updatedAt: "2026-07-16",
    status: "live",
    type: "frontend-tool",
    summary:
      "一个用于时间戳、日期格式和时区信息转换的交互工具，展示 Labs 中可直接使用的小工具方向。",
    problem:
      "开发和排障时经常需要快速转换时间戳，但很多工具干扰多、状态反馈弱，难以融入个人工作流。",
    solution:
      "把常用转换、复制反馈和边界提示放在一个轻量页面中，作为实验室中可持续扩展的工具模板。",
    role: ["前端实现", "输入校验", "交互反馈", "Labs 工具整合"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Intl API"],
    highlights: ["直接可用", "交互反馈完整", "适合作为后续工具模板"],
    evidence: [
      { label: "已上线入口", value: "工具已作为 Labs 页面的一部分可直接访问" },
      { label: "浏览器能力", value: "使用 Intl API 处理日期、时区和本地格式展示" },
      { label: "模板价值", value: "输入、校验、结果和复制反馈可复用于后续小工具" }
    ],
    asset: {
      kind: "none",
      reason: "工具可以公开访问，但仓库目前没有与当前版本一致、经人工检查的公开截图。",
      nextAssetStep: "在浏览器验收后截取当前工具界面，再替换 none 状态。"
    },
    gallery: [
      {
        kind: "doc",
        label: "查看实现复盘草稿",
        href: "https://github.com/Oracle0703/website/blob/main/content/blog/2026-02-11-timestamp-tool-retrospective-timezone-precision-ux.mdx",
        description: "仓库草稿记录时区、秒/毫秒精度、复制反馈和输入边界的设计考虑。"
      }
    ],
    architecture:
      "工具以客户端组件承载输入、转换、校验和反馈状态，依赖浏览器 Intl API 完成日期和时区格式化，不需要后端服务。",
    architectureSteps: [
      { title: "浏览器输入", description: "接收日期时间或数字时间戳，并显式选择秒或毫秒单位。" },
      { title: "Date 转换", description: "在时间与 Unix timestamp 之间转换，并拒绝无效日期或非有限数值。" },
      { title: "本地与 UTC 展示", description: "同一时间值按本地或 UTC 字段格式化，可展开对照结果。" },
      { title: "复制反馈", description: "优先使用 Clipboard API，失败时回退到临时 textarea 复制。" }
    ],
    decisions: [
      {
        decision: "把秒与毫秒单位做成显式选择",
        rationale: "10 位和 13 位时间戳容易被误判，隐式猜测会产生难以发现的日期错误。",
        impact: "输入多一步选择，但结果的精度语义清楚且可复核。"
      },
      {
        decision: "同一数值支持本地与 UTC 对照",
        rationale: "时间戳本身与时区无关，歧义通常来自展示方式。",
        impact: "转换逻辑保持简单，用户可以按需检查两种显示。"
      },
      {
        decision: "全部计算留在浏览器",
        rationale: "Date 转换和复制不需要服务器，也不需要保存用户输入。",
        impact: "工具打开即用且没有 API 成本，但暂不提供批量或持久化任务。"
      }
    ],
    tradeoffs: [
      "单页客户端实现让工具打开即用，但不适合处理批量或持久化任务。",
      "优先覆盖高频时间戳场景，暂不把时区数据库和复杂日历规则拉入首版。",
      "作为 Labs 工具保持轻量，避免为了一个小功能引入共享表单框架。"
    ],
    roadmap: ["增加批量转换", "支持更多时区比较", "抽取 Labs 工具页通用组件"],
    limitations: ["当前仅覆盖时间戳场景", "未提供批量转换"],
    nextSteps: ["增加批量输入", "支持更多时区比较", "沉淀通用工具页面组件"],
    links: [{ label: "打开工具", href: "/labs" }],
    entry: {
      demo: {
        status: "available",
        label: "打开时间戳工具",
        href: "/labs#timestamp-tool",
        description: "直接在浏览器中转换日期、秒/毫秒时间戳，并比较本地时间与 UTC。"
      },
      source: {
        label: "查看工具源码",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/app/labs/timestamp-tool.tsx",
        description: "查看转换、时区显示、实时刷新和 Clipboard fallback 的实现。"
      }
    },
    featured: true
  }
];

const englishProjectContentBySlug: Record<string, LocalizedProjectContent> = {
  "ai-page-analysis": {
    title: "AI Page Analysis and Redesign Assistant",
    subtitle: "An AI product prototype that turns page input into diagnosis and redesign backlog",
    summary:
      "A page analysis tool for product, marketing, and design discussions, using structured scoring and evidence-based recommendations to reduce subjective redesign debates.",
    problem:
      "Page redesign decisions often depend on personal taste and scattered comments, without a shared evidence chain tied to audience, business goals, and page structure.",
    solution:
      "The URL mode safely captures public HTML on the server, then uses a controlled Safe Mock for structured scores, issues, and backlog. Screenshot notes and brief modes continue through fixed browser-side mock output.",
    role: ["Product scope", "Information architecture", "Next.js frontend", "Mock analysis pipeline", "Interaction states"],
    highlights: ["Explainable analysis steps", "Outputs shaped for task planning", "Extensible failure and low-confidence states"],
    evidence: [
      { label: "Interactive demo", value: "The public page covers input, pipeline, scoring, issues, recommendations, and backlog" },
      { label: "Safe capture", value: "The URL path validates DNS and every redirect, limits response size and time, and rejects private addresses" },
      { label: "Bilingual surface", value: "Chinese root routes and English /en routes share one locale-aware client component" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/ai-page-analysis-product-mock.svg",
      alt: "Product mock for the AI page analysis assistant showing URL input, scores, issues, and backlog",
      caption:
        "Product mock: URLs can pass through safe capture, while scores and recommendations still come from a Safe Mock with no live model integration."
    },
    gallery: [
      {
        kind: "doc",
        label: "Read the safe-capture technical spec",
        href: "https://github.com/Oracle0703/website/blob/main/docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md",
        description: "The public spec records URL validation, SSRF protection, error codes, output schema, and model boundaries."
      }
    ],
    architecture:
      "The client owns the three input modes and interaction state. URL mode calls a Next.js API for bounded page capture before generating reproducible Safe Mock output; screenshot notes and briefs stay in the browser.",
    architectureSteps: [
      { title: "Browser input", description: "One client experience owns URL, screenshot-note, and product-brief input plus pipeline state." },
      { title: "Mode routing", description: "URLs call POST /api/analyze; screenshot notes and briefs use the fixed client-side mock." },
      { title: "Safe URL capture", description: "The server checks DNS and every redirect, rejects private and metadata addresses, and bounds response size and time." },
      { title: "Safe Mock output", description: "Captured title and brief feed deterministic scores, issues, recommendations, and backlog without calling a live model." },
      { title: "Result interface", description: "The client presents progress, explicit failures, and structured delivery output." }
    ],
    decisions: [
      {
        decision: "Separate safe capture from model generation",
        rationale: "Public URL capture needs its own SSRF, redirect, response-size, and timeout boundary before model work is considered.",
        impact: "The real input path is testable while the page remains explicit that analysis output is still a Safe Mock."
      },
      {
        decision: "Send only URL mode through the server API",
        rationale: "Screenshot notes and briefs do not need network capture, so keeping them in the browser reduces server scope and data exposure.",
        impact: "All modes share one experience while their runtime and capability boundaries stay visible."
      },
      {
        decision: "Do not persist analysis history yet",
        rationale: "The prototype validates input and output shape without adding accounts, a database, or more privacy obligations.",
        impact: "Deployment stays light, but refreshes cannot restore or compare earlier results."
      }
    ],
    tradeoffs: [
      "Real URL capture is implemented, while result generation remains a Safe Mock so the demo does not overstate model capability.",
      "No saved history keeps privacy and account scope small, but removes review and comparison workflows.",
      "Screenshot notes and briefs stay in the browser, reducing server input scope but not parsing real image files yet."
    ],
    roadmap: ["Integrate model analysis with stable structured output", "Add low-confidence review states", "Add share pages, PDF export, and analysis history"],
    limitations: ["No live model integration yet", "No saved history yet", "Logged-in page analysis is not supported"],
    nextSteps: ["Integrate real model analysis", "Validate model output and review states", "Add share pages and PDF export"],
    links: [{ label: "Open demo", href: "/ai-page-analysis" }],
    entry: {
      demo: {
        status: "available",
        label: "Try the public demo",
        href: "/ai-page-analysis",
        description: "Try safe URL capture, browser-side mock modes, and the structured result interface."
      },
      source: {
        label: "Inspect the core implementation",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/lib/ai-page-analysis.ts",
        description: "Review URL validation, capture limits, request gating, and Safe Mock result generation."
      }
    }
  },
  tracker: {
    title: "Practice Tracker",
    subtitle: "A local-first habit tracker that works without an account",
    summary:
      "A usable lightweight habit tool with custom habits, daily check-ins, streaks, seven-day statistics, and JSON backups.",
    problem:
      "Many trackers only record whether a task was completed, without enough structure for goals, streaks, incentives, and anti-abuse boundaries.",
    solution:
      "Use daily check-ins as the core loop, persist records in the browser, and provide strictly validated import and export so progress remains observable and portable.",
    role: ["Product rule design", "Frontend implementation", "Interaction flow", "Incentive model"],
    highlights: ["Works without sign-in", "Portable local backups", "Strict input and backup validation"],
    evidence: [
      { label: "Public route", value: "The Tracker page is covered by bilingual public routes, sitemap, and browser verification" },
      { label: "Usable loop", value: "Create habits, check in or undo, inspect streaks and seven-day stats, then delete or reset with confirmation" },
      { label: "Data boundary", value: "Records persist only in the current browser and move through a versioned JSON backup" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/tracker-product-mock.svg",
      alt: "Product mock for the Practice Tracker showing goals, check-ins, streaks, and review modules",
      caption:
        "Product mock: it explains the Tracker structure. The live page persists to localStorage without accounts or cloud sync."
    },
    gallery: [
      {
        kind: "doc",
        label: "Read the local-first feature notes",
        href: "https://github.com/Oracle0703/website/blob/main/docs/website/LOCAL_FIRST_FEATURES.md",
        description: "The public notes document the v1 schema, capacity limits, import validation, backups, and privacy boundary."
      }
    ],
    architecture:
      "The interactive client stores a versioned v1 schema in localStorage. Imports are bounded and validate fields, dates, duplicates, and counts; the server never stores habit records.",
    architectureSteps: [
      { title: "Client interface", description: "Habit creation, check-in, undo, delete, and reset all run in the browser." },
      { title: "v1 schema validation", description: "One boundary validates names, dates, duplicates, record counts, and imported file size." },
      { title: "localStorage", description: "Versioned plain-text data stays in the current browser and is not uploaded to the site server." },
      { title: "Local stats and backup", description: "Local records produce streak and seven-day stats and move through manual JSON import and export." }
    ],
    decisions: [
      {
        decision: "Use an account-free local-first data model",
        rationale: "Basic personal check-ins do not need habit records to enter a server or account system.",
        impact: "Deployment and privacy exposure stay small, but data does not sync across devices automatically."
      },
      {
        decision: "Put backup files through strict validation",
        rationale: "Imported JSON replaces local state, so version, fields, dates, duplicates, and capacity must be bounded first.",
        impact: "Migration is predictable; invalid files are rejected without overwriting current data."
      },
      {
        decision: "Focus statistics on streaks and the latest seven days",
        rationale: "The first release favors feedback that is easy to explain and recalculate from local records.",
        impact: "The core loop stays clear while monthly and longer-term review remains on the roadmap."
      }
    ],
    tradeoffs: [
      "Skipping accounts and a database keeps use and deployment light, but removes automatic cross-device sync.",
      "localStorage provides real persistence at zero server cost, but users must export before clearing browser data.",
      "Statistics stay focused on seven-day completion and active streaks so the rules remain explainable and portable."
    ],
    roadmap: ["Add a monthly review", "Offer CSV export", "Evaluate the cost and privacy boundary of optional encrypted sync"],
    limitations: ["Data stays in the current browser", "No account, reminders, or cloud sync", "Users must protect their own backup files"],
    nextSteps: ["Add a monthly review", "Support more portable formats", "Keep refining local-first privacy copy"],
    links: [{ label: "Open tracker", href: "/tracker" }],
    entry: {
      demo: {
        status: "available",
        label: "Open Tracker",
        href: "/tracker",
        description: "Create a habit and check in without signing in; data stays in the current browser."
      },
      source: {
        label: "Inspect the local data model",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/lib/tracker-local.ts",
        description: "Review schema parsing, serialization, validation, streaks, and seven-day statistics."
      }
    }
  },
  knock: {
    title: "Knock Access Log Monitor",
    subtitle: "A lightweight service for access logs, event tracking, and security boundary checks",
    summary:
      "A server-side monitoring module for recording access events, parsing logs, and validating basic authentication boundaries on public endpoints.",
    problem:
      "Personal projects often go live without minimal access visibility, making abnormal traffic, configuration mistakes, and exposed endpoints hard to diagnose.",
    solution:
      "Collect, parse, and present key access events through a Node service, with optional Basic Auth for the monitoring surface.",
    role: ["Node service implementation", "Log parsing", "Basic Auth integration", "Runbook maintenance"],
    highlights: ["Low deployment cost", "Clear authentication configuration", "Ready to feed Dashboard summaries"],
    evidence: [
      { label: "MVP shape", value: "The module covers access event recording, log parsing, and a basic authenticated surface" },
      { label: "Test boundary", value: "Node 22 and the native module ABI are explicit local verification constraints" },
      { label: "Operations value", value: "It can become a runtime summary source for Dashboard Console" }
    ],
    asset: {
      kind: "none",
      reason: "Access logs can expose IPs, request paths, and runtime timelines, so raw monitoring screenshots are not public.",
      nextAssetStep: "Publish a redacted runtime summary or architecture diagram before adding a visual asset."
    },
    gallery: [
      {
        kind: "doc",
        label: "Read the Knock runbook",
        href: "https://github.com/Oracle0703/website/blob/main/docs/knock/README.md",
        description: "The public runbook records log input, configuration, authentication requirements, build tests, and Windows deployment."
      }
    ],
    architecture:
      "Knock reads Nginx access logs incrementally and writes parsed records to local SQLite. An Express API aggregates time windows, status codes, and suspicious requests, with Basic Auth protecting the monitoring surface.",
    architectureSteps: [
      { title: "Nginx access log", description: "The service reads from a saved file offset and detects truncation or rotation on a best-effort basis." },
      { title: "Parse and classify", description: "Request fields and suspicious signals are parsed and written inside one transaction." },
      { title: "SQLite WAL", description: "A local database stores indexed requests and data covered by the configured retention window." },
      { title: "Express API", description: "The API returns overview, time series, top IP, top path, and suspicious-request data for 1h, 24h, or 7d windows." },
      { title: "Protected monitor", description: "A static dashboard calls the same-origin API; public exposure requires Basic Auth or equivalent access control." }
    ],
    decisions: [
      {
        decision: "Read appended log bytes instead of rescanning the file",
        rationale: "Offset state lets each polling pass process only new data and recover best-effort from truncation or rotation.",
        impact: "Continuous single-machine ingest stays inexpensive, but the state file and configured log path must remain aligned."
      },
      {
        decision: "Store monitoring data in SQLite WAL mode",
        rationale: "A personal server benefits from queryable local storage without operating a separate database service.",
        impact: "Deployment is simple and aggregation stays fast enough for this scope, but the design remains single-machine and single-writer."
      },
      {
        decision: "Protect the monitoring surface with Basic Auth",
        rationale: "Access logs expose IPs, paths, and user agents and must not become an unprotected public page.",
        impact: "The boundary fits a personal operations surface but is not a multi-user permission and audit system."
      }
    ],
    tradeoffs: [
      "SQLite keeps deployment simple, but it is not meant for high-concurrency or multi-writer deployments.",
      "Basic Auth is enough for a personal monitoring surface, but it is not a full permissions system.",
      "Retention cleanup runs with ingest, which is simple but means cleanup does not run independently when ingest is disabled."
    ],
    roadmap: ["Connect Dashboard summary cards", "Observe log rotation and retention at runtime", "Improve deployment health checks and alert signals"],
    limitations: ["Full tests depend on the Node 22 native module ABI", "Still a single-machine SQLite setup"],
    nextSteps: ["Connect Dashboard summaries", "Verify log-rotation recovery", "Improve deployment health checks"],
    links: [],
    entry: {
      demo: {
        status: "unavailable",
        reason: "The monitor depends on real access logs and can expose IPs, request paths, and runtime timelines, so there is no public demo."
      },
      source: {
        label: "Inspect the Knock source",
        href: "https://github.com/Oracle0703/website/tree/main/apps/knock",
        description: "Review log parsing, incremental ingest, SQLite schema, aggregation API, authentication, and the static dashboard."
      }
    }
  },
  "dashboard-console": {
    title: "Dashboard Console",
    subtitle: "An internal operations console for tasks, logs, events, and system status",
    summary:
      "An operations console for the personal website that brings tasks, logs, events, and system state into one maintainable view.",
    problem:
      "Content, deployments, logs, and tasks are scattered across tools, making it hard to understand current system state and the next priority.",
    solution:
      "Use dashboard-api to read and write tasks and events, while dashboard-web presents actionable state views with OSS and ETag conflict boundaries.",
    role: ["API design", "OSS storage integration", "Conflict handling", "Console information architecture"],
    highlights: ["Clear read/write error boundaries", "Trackable task state", "Expandable into content operations"],
    evidence: [
      { label: "State aggregation", value: "Tasks, logs, events, and system status are shaped into one console model" },
      { label: "Conflict boundary", value: "OSS and ETag conflicts remain explicit design constraints" },
      { label: "Expansion path", value: "The console can host content operations, deployment records, and Knock summaries" }
    ],
    asset: {
      kind: "none",
      reason: "The internal console can include tasks, logs, object storage state, and deployment signals that should not be exposed directly.",
      nextAssetStep: "Redact sensitive fields or publish an architecture diagram before showing it as a public asset."
    },
    gallery: [
      {
        kind: "doc",
        label: "Read the Dashboard architecture plan",
        href: "https://github.com/Oracle0703/website/blob/main/docs/dashboard/PLAN.md",
        description: "The public plan records the monorepo shape, OSS data layout, API surface, ETag rules, and test requirements."
      }
    ],
    architecture:
      "dashboard-api owns task and event reads and writes while dashboard-web renders operational status views. The storage layer currently uses OSS objects with ETag checks for conflict boundaries.",
    architectureSteps: [
      { title: "dashboard-web", description: "The Next.js client handles administrator sign-in and reads current state and recent events." },
      { title: "Two authentication paths", description: "Administrator API calls use JWT, while automated event ingest uses a separate INGEST_TOKEN." },
      { title: "dashboard-api", description: "Express routes define read and write boundaries for state, events, tasks, logs, and status." },
      { title: "OSS JSON documents", description: "State, tasks, daily events, and daily logs use stable object-storage keys." },
      { title: "ETag conflict handling", description: "Task and append-array writes use conditional requests and bounded retry, returning explicit conflicts when needed." }
    ],
    decisions: [
      {
        decision: "Deploy dashboard-web and dashboard-api separately",
        rationale: "Interface work and operations-data writes have different runtime boundaries, and automated ingest also needs the API.",
        impact: "Responsibilities stay clear, while deployment must configure API base, CORS, and reverse proxying correctly."
      },
      {
        decision: "Use different credentials for administrators and ingest",
        rationale: "Automated jobs only need to append events and should not receive administrator read or mutation access.",
        impact: "The permission surface is smaller, with JWT secrets, the administrator password, and INGEST_TOKEN managed separately."
      },
      {
        decision: "Use OSS JSON plus ETags for low-frequency operations data",
        rationale: "The project's data volume and write rate favor inexpensive, backup-friendly object storage over a resident database.",
        impact: "No database service is required, but concurrent writes must handle 412 and 409 conflicts explicitly."
      }
    ],
    tradeoffs: [
      "Read-only operations and state management come before direct MDX editing to reduce content corruption risk.",
      "OSS storage is inexpensive to deploy, but concurrent editing needs strict conflict handling.",
      "Aggregation is prioritized before complex permissions; audit and access control need another pass."
    ],
    roadmap: ["Add a read-only Content module", "Connect deployment records and health status", "Add permissions, audit trails, and Knock summaries"],
    limitations: ["Does not edit MDX directly", "Permissions and audit trails need more work"],
    nextSteps: ["Add a read-only Content module", "Connect deployment records", "Aggregate Knock runtime summaries"],
    links: [],
    entry: {
      demo: {
        status: "unavailable",
        reason: "The console contains internal tasks, events, logs, and deployment state and requires administrator authentication, so it has no public demo."
      },
      source: {
        label: "Inspect the Dashboard source",
        href: "https://github.com/Oracle0703/website/tree/main/apps/dashboard-api",
        description: "Start with the API implementation, then inspect the companion dashboard-web client and tests in the same repository."
      }
    }
  },
  "timestamp-tool": {
    title: "Timestamp Conversion Tool",
    subtitle: "A small but complete frontend tool inside Labs",
    summary:
      "An interactive tool for converting timestamps, date formats, and timezone information, showing how Labs can host directly useful utilities.",
    problem:
      "Development and debugging often require quick timestamp conversion, but many tools are noisy, weak on feedback, and hard to fit into a personal workflow.",
    solution:
      "Put common conversions, copy feedback, and boundary hints into one lightweight page that can become a template for future Labs tools.",
    role: ["Frontend implementation", "Input validation", "Interaction feedback", "Labs integration"],
    highlights: ["Immediately usable", "Complete interaction feedback", "Reusable as a future tool template"],
    evidence: [
      { label: "Live entry", value: "The tool is accessible as part of the Labs page" },
      { label: "Browser capability", value: "Intl API handles date, timezone, and local format display" },
      { label: "Template value", value: "Input, validation, result, and copy feedback can be reused by future small tools" }
    ],
    asset: {
      kind: "none",
      reason: "The tool is public, but the repository does not currently contain a reviewed screenshot that matches the current release.",
      nextAssetStep: "Capture the current tool after browser verification, then replace the none state."
    },
    gallery: [
      {
        kind: "doc",
        label: "Read the implementation retrospective draft",
        href: "https://github.com/Oracle0703/website/blob/main/content/blog/2026-02-11-timestamp-tool-retrospective-timezone-precision-ux.mdx",
        description: "This repository draft records decisions around timezone display, seconds and milliseconds, copy feedback, and input boundaries."
      }
    ],
    architecture:
      "The tool uses a client component for input, conversion, validation, and feedback state. It relies on the browser Intl API for date and timezone formatting, with no backend service required.",
    architectureSteps: [
      { title: "Browser input", description: "Accept a date-time or numeric timestamp with an explicit seconds or milliseconds unit." },
      { title: "Date conversion", description: "Convert between time and Unix timestamps while rejecting invalid dates and non-finite numeric input." },
      { title: "Local and UTC display", description: "Format the same instant using local or UTC fields, with an optional comparison line." },
      { title: "Copy feedback", description: "Use the Clipboard API first and fall back to a temporary textarea when needed." }
    ],
    decisions: [
      {
        decision: "Make seconds and milliseconds an explicit choice",
        rationale: "Ten- and thirteen-digit timestamps are easy to confuse, while implicit guessing can produce hard-to-spot date errors.",
        impact: "Input needs one more choice, but precision stays clear and verifiable."
      },
      {
        decision: "Offer local and UTC views of the same value",
        rationale: "A timestamp is timezone-independent; ambiguity usually comes from how that instant is displayed.",
        impact: "Conversion logic stays simple while users can inspect both representations when needed."
      },
      {
        decision: "Keep every calculation in the browser",
        rationale: "Date conversion and copying need neither a server nor persisted user input.",
        impact: "The tool opens with no API cost, but it does not yet cover batch or persisted workflows."
      }
    ],
    tradeoffs: [
      "A single client-side tool opens quickly, but it is not designed for batch or persisted workflows.",
      "The first version covers common timestamp needs instead of adding timezone databases and complex calendar rules.",
      "Keeping it lightweight avoids pulling a shared form framework into one small Labs utility."
    ],
    roadmap: ["Add batch conversion", "Support more timezone comparisons", "Extract shared Labs tool page components"],
    limitations: ["Currently focused on timestamps only", "No batch conversion yet"],
    nextSteps: ["Add batch input", "Support more timezone comparisons", "Extract shared tool-page components"],
    links: [{ label: "Open tool", href: "/labs" }],
    entry: {
      demo: {
        status: "available",
        label: "Open the timestamp tool",
        href: "/labs#timestamp-tool",
        description: "Convert dates and seconds or milliseconds in the browser, then compare local time with UTC."
      },
      source: {
        label: "Inspect the tool source",
        href: "https://github.com/Oracle0703/website/blob/main/apps/website/app/labs/timestamp-tool.tsx",
        description: "Review conversion, timezone display, live refresh, and the Clipboard fallback."
      }
    }
  }
};

function getChineseProjectContent(project: Project): LocalizedProjectContent {
  return {
    title: project.title,
    subtitle: project.subtitle,
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    role: project.role,
    highlights: project.highlights,
    evidence: project.evidence,
    asset: project.asset,
    gallery: project.gallery,
    architecture: project.architecture,
    architectureSteps: project.architectureSteps,
    decisions: project.decisions,
    tradeoffs: project.tradeoffs,
    roadmap: project.roadmap,
    limitations: project.limitations,
    nextSteps: project.nextSteps,
    links: project.links,
    entry: project.entry
  };
}

export function getProjectView(project: Project, locale: Locale): ProjectView {
  const localized =
    locale === "en"
      ? englishProjectContentBySlug[project.slug] ?? getChineseProjectContent(project)
      : getChineseProjectContent(project);

  return {
    slug: project.slug,
    updatedAt: project.updatedAt,
    status: project.status,
    type: project.type,
    stack: project.stack,
    featured: project.featured,
    ...localized
  };
}

export function getProjectViews(locale: Locale) {
  return projects.map((project) => getProjectView(project, locale));
}

export function getFeaturedProjectViews(locale: Locale) {
  return getFeaturedProjects().map((project) => getProjectView(project, locale));
}

export function getAllProjects() {
  return projects;
}

export function getFeaturedProjects() {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === decodeURIComponent(slug)) ?? null;
}
