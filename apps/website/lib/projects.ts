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
  architecture: string;
  tradeoffs: string[];
  roadmap: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
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
  architecture: string;
  tradeoffs: string[];
  roadmap: string[];
  limitations: string[];
  nextSteps: string[];
  links: Array<{ label: string; href: string; external?: boolean }>;
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
    updatedAt: "2026-05-18",
    status: "prototype",
    type: "ai-tool",
    summary:
      "一个面向产品、运营和设计讨论的页面分析工具，用结构化评分、问题拆解和改版建议降低主观争论。",
    problem:
      "页面改版常停留在个人审美和碎片意见上，缺少面向目标受众、业务目标和页面结构的统一证据链。",
    solution:
      "先用可控的 mock pipeline 固化输入、分析、建议和 backlog 输出格式，再逐步接入真实抓取、视觉理解和模型生成能力。",
    role: ["产品范围定义", "信息架构设计", "Next.js 前端实现", "Mock 分析流水线", "交互状态设计"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Structured Output"],
    highlights: ["分析步骤可解释", "输出结构适合转任务", "失败与低置信度状态可扩展"],
    evidence: [
      { label: "可体验 Demo", value: "公开页面已覆盖输入、流水线、评分、问题、建议和 backlog" },
      { label: "产品规格", value: "V1 规格记录 URL 抓取、Brief、错误码、SSRF 和输出 schema 边界" },
      { label: "双语展示", value: "中文根路径和英文 /en 路径共用同一 locale-aware 页面组件" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/ai-page-analysis-product-mock.svg",
      alt: "AI 页面分析助手的 product mock，展示 URL 输入、评分、问题和 backlog 结构",
      caption:
        "Product mock：用于公开说明页面分析工作流，不代表已接入真实抓取或模型能力。"
    },
    architecture:
      "当前采用单页 React client demo：输入模式、流水线状态、mock output 和本地化 copy 在组件内闭环；后续 V1 会把抓取、模型调用和结果 schema 下沉到 API。",
    tradeoffs: [
      "先用 mock pipeline 验证信息架构和输出格式，避免过早引入抓取、模型成本和安全风险。",
      "不保存历史记录，减少隐私和账户系统复杂度，但也牺牲了复盘能力。",
      "页面展示完整链路而非真实生产分析，文案必须明确 demo 与真实能力边界。"
    ],
    roadmap: ["补 URL 抓取服务和 SSRF 防护", "接入模型分析并稳定结构化输出", "增加结果分享、PDF 导出和历史记录"],
    limitations: ["当前未接真实模型", "暂不保存历史记录", "尚未支持登录后页面分析"],
    nextSteps: ["实现 URL 抓取服务", "接入真实模型分析", "增加分享页和 PDF 导出"],
    links: [{ label: "查看页面", href: "/ai-page-analysis" }],
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
    architecture:
      "交互界面在浏览器运行，版本化 v1 schema 保存到 localStorage；导入路径限制大小、字段、日期、重复项和数量，服务器不保存习惯记录。",
    tradeoffs: [
      "不做账户和数据库让使用与部署更轻，但数据不会自动跨设备同步。",
      "localStorage 提供真实持久化和零服务端成本，但清理浏览器数据前必须手动导出备份。",
      "统计保持在七日和连续天数，优先保证规则可解释与数据可迁移。"
    ],
    roadmap: ["增加月度回顾视图", "补 CSV 导出", "评估可选加密同步的成本与隐私边界"],
    limitations: ["数据只保存在当前浏览器", "没有账户、提醒或云同步", "备份文件需要用户自行保管"],
    nextSteps: ["增加月度回顾", "补更多可迁移格式", "继续验证本地优先隐私文案"],
    links: [{ label: "进入打卡", href: "/tracker" }],
    featured: true
  },
  {
    slug: "knock",
    title: "Knock 访问日志监控",
    subtitle: "轻量访问日志、事件记录和安全边界验证服务",
    updatedAt: "2026-05-18",
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
    architecture:
      "Knock 以 Node 服务接收和解析访问事件，使用本地 SQLite 存储轻量运行数据，并通过可选 Basic Auth 控制监控入口。",
    tradeoffs: [
      "SQLite 降低部署和维护成本，但不适合高并发或多实例写入。",
      "Basic Auth 足够覆盖个人项目监控入口，但不是完整权限系统。",
      "日志留存策略尚未自动化，需要避免无界增长。"
    ],
    roadmap: ["接入 Dashboard 摘要卡片", "增加日志保留和清理策略", "完善部署健康检查和告警信号"],
    limitations: ["完整测试依赖 Node 22 ABI", "当前仍是单机 SQLite 形态"],
    nextSteps: ["接入 Dashboard 摘要", "增加保留策略", "完善部署健康检查"],
    links: []
  },
  {
    slug: "dashboard-console",
    title: "Dashboard Console",
    subtitle: "内部运营控制台与任务、日志、事件状态管理",
    updatedAt: "2026-05-18",
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
    architecture:
      "控制台由 dashboard-api 负责任务和事件读写，dashboard-web 渲染运营状态视图；存储层暂以 OSS 对象和 ETag 边界处理并发冲突。",
    tradeoffs: [
      "先做运营只读和状态管理，避免直接编辑 MDX 带来的内容破坏风险。",
      "OSS 对象存储便于低成本部署，但并发编辑需要更严格冲突处理。",
      "控制台聚合能力优先于复杂权限，权限与审计需要后续增强。"
    ],
    roadmap: ["增加 Content 只读模块", "接入部署记录和健康状态", "补权限、审计和 Knock 运行摘要"],
    limitations: ["当前不直接编辑 MDX", "权限与审计仍需继续增强"],
    nextSteps: ["增加 Content 只读模块", "接入部署记录", "聚合 Knock 运行摘要"],
    links: []
  },
  {
    slug: "timestamp-tool",
    title: "时间戳转换工具",
    subtitle: "内置于 Labs 的小而完整的前端工具体验",
    updatedAt: "2026-05-18",
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
      reason: "Labs 工具可公开访问，但 D6 尚未截取经人工检查的真实工具截图。",
      nextAssetStep: "在浏览器验收后补真实工具截图，并替换当前 none 状态。"
    },
    architecture:
      "工具以客户端组件承载输入、转换、校验和反馈状态，依赖浏览器 Intl API 完成日期和时区格式化，不需要后端服务。",
    tradeoffs: [
      "单页客户端实现让工具打开即用，但不适合处理批量或持久化任务。",
      "优先覆盖高频时间戳场景，暂不把时区数据库和复杂日历规则拉入首版。",
      "作为 Labs 工具保持轻量，避免为了一个小功能引入共享表单框架。"
    ],
    roadmap: ["增加批量转换", "支持更多时区比较", "抽取 Labs 工具页通用组件"],
    limitations: ["当前仅覆盖时间戳场景", "未提供批量转换"],
    nextSteps: ["增加批量输入", "支持更多时区比较", "沉淀通用工具页面组件"],
    links: [{ label: "打开工具", href: "/labs" }],
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
      "Start with a controlled mock pipeline that stabilizes input, diagnosis, recommendations, and backlog output, then evolve toward real crawling, visual understanding, and model-generated analysis.",
    role: ["Product scope", "Information architecture", "Next.js frontend", "Mock analysis pipeline", "Interaction states"],
    highlights: ["Explainable analysis steps", "Outputs shaped for task planning", "Extensible failure and low-confidence states"],
    evidence: [
      { label: "Interactive demo", value: "The public page covers input, pipeline, scoring, issues, recommendations, and backlog" },
      { label: "Product spec", value: "The V1 spec defines URL capture, brief input, error codes, SSRF boundaries, and output schema" },
      { label: "Bilingual surface", value: "Chinese root routes and English /en routes share one locale-aware client component" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/ai-page-analysis-product-mock.svg",
      alt: "Product mock for the AI page analysis assistant showing URL input, scores, issues, and backlog",
      caption:
        "Product mock: it documents the intended analysis workflow and does not claim live crawling or model integration."
    },
    architecture:
      "The current version is a single-page React client demo: input modes, pipeline state, mock output, and localized copy stay in the component. V1 would move capture, model calls, and result schema into an API boundary.",
    tradeoffs: [
      "The mock pipeline validates information architecture and output format before adding capture cost, model cost, and security risk.",
      "No saved history keeps privacy and account scope small, but removes review and comparison workflows.",
      "The page shows the full workflow instead of real production analysis, so the copy must keep demo and live capability separate."
    ],
    roadmap: ["Add URL capture and SSRF protection", "Integrate model analysis with stable structured output", "Add share pages, PDF export, and analysis history"],
    limitations: ["No live model integration yet", "No saved history yet", "Logged-in page analysis is not supported"],
    nextSteps: ["Build the URL capture service", "Integrate real model analysis", "Add share pages and PDF export"],
    links: [{ label: "Open demo", href: "/ai-page-analysis" }]
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
    architecture:
      "The interactive client stores a versioned v1 schema in localStorage. Imports are bounded and validate fields, dates, duplicates, and counts; the server never stores habit records.",
    tradeoffs: [
      "Skipping accounts and a database keeps use and deployment light, but removes automatic cross-device sync.",
      "localStorage provides real persistence at zero server cost, but users must export before clearing browser data.",
      "Statistics stay focused on seven-day completion and active streaks so the rules remain explainable and portable."
    ],
    roadmap: ["Add a monthly review", "Offer CSV export", "Evaluate the cost and privacy boundary of optional encrypted sync"],
    limitations: ["Data stays in the current browser", "No account, reminders, or cloud sync", "Users must protect their own backup files"],
    nextSteps: ["Add a monthly review", "Support more portable formats", "Keep refining local-first privacy copy"],
    links: [{ label: "Open tracker", href: "/tracker" }]
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
    architecture:
      "Knock uses a Node service to collect and parse access events, stores lightweight runtime data in local SQLite, and gates the monitoring surface with optional Basic Auth.",
    tradeoffs: [
      "SQLite keeps deployment simple, but it is not meant for high-concurrency or multi-writer deployments.",
      "Basic Auth is enough for a personal monitoring surface, but it is not a full permissions system.",
      "Retention is not automated yet, so log growth still needs an explicit policy."
    ],
    roadmap: ["Connect Dashboard summary cards", "Add log retention and cleanup", "Improve deployment health checks and alert signals"],
    limitations: ["Full tests depend on the Node 22 native module ABI", "Still a single-machine SQLite setup"],
    nextSteps: ["Connect Dashboard summaries", "Add retention policy", "Improve deployment health checks"],
    links: []
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
    architecture:
      "dashboard-api owns task and event reads and writes while dashboard-web renders operational status views. The storage layer currently uses OSS objects with ETag checks for conflict boundaries.",
    tradeoffs: [
      "Read-only operations and state management come before direct MDX editing to reduce content corruption risk.",
      "OSS storage is inexpensive to deploy, but concurrent editing needs strict conflict handling.",
      "Aggregation is prioritized before complex permissions; audit and access control need another pass."
    ],
    roadmap: ["Add a read-only Content module", "Connect deployment records and health status", "Add permissions, audit trails, and Knock summaries"],
    limitations: ["Does not edit MDX directly", "Permissions and audit trails need more work"],
    nextSteps: ["Add a read-only Content module", "Connect deployment records", "Aggregate Knock runtime summaries"],
    links: []
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
      reason: "The Labs tool is public, but D6 has not captured and reviewed a real tool screenshot yet.",
      nextAssetStep: "Capture the real Labs tool after browser verification, then replace the current none state."
    },
    architecture:
      "The tool uses a client component for input, conversion, validation, and feedback state. It relies on the browser Intl API for date and timezone formatting, with no backend service required.",
    tradeoffs: [
      "A single client-side tool opens quickly, but it is not designed for batch or persisted workflows.",
      "The first version covers common timestamp needs instead of adding timezone databases and complex calendar rules.",
      "Keeping it lightweight avoids pulling a shared form framework into one small Labs utility."
    ],
    roadmap: ["Add batch conversion", "Support more timezone comparisons", "Extract shared Labs tool page components"],
    limitations: ["Currently focused on timestamps only", "No batch conversion yet"],
    nextSteps: ["Add batch input", "Support more timezone comparisons", "Extract shared tool-page components"],
    links: [{ label: "Open tool", href: "/labs" }]
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
    architecture: project.architecture,
    tradeoffs: project.tradeoffs,
    roadmap: project.roadmap,
    limitations: project.limitations,
    nextSteps: project.nextSteps,
    links: project.links
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
