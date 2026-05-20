import type { Locale } from "./i18n";

export type ProjectStatus = "concept" | "prototype" | "mvp" | "live";

export type ProjectType =
  | "ai-tool"
  | "dashboard"
  | "infra"
  | "frontend-tool"
  | "product-system";

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
    limitations: ["当前未接真实模型", "暂不保存历史记录", "尚未支持登录后页面分析"],
    nextSteps: ["实现 URL 抓取服务", "接入真实模型分析", "增加分享页和 PDF 导出"],
    links: [{ label: "查看页面", href: "/ai-page-analysis" }],
    featured: true
  },
  {
    slug: "tracker",
    title: "修行打卡系统",
    subtitle: "围绕习惯、连续性和激励设计的个人成长产品原型",
    updatedAt: "2026-05-18",
    status: "prototype",
    type: "product-system",
    summary:
      "一个用于追踪习惯执行、连续打卡和成长数据的轻量系统，重点在规则闭环与持续反馈。",
    problem:
      "普通打卡工具容易只记录完成与否，缺少对目标、连续性、激励和反作弊边界的系统化设计。",
    solution:
      "以日常打卡为核心，沉淀连续天数、进度趋势和规则说明，让个人成长行为具备可观察、可复盘的反馈链路。",
    role: ["产品规则设计", "前端页面实现", "交互流程设计", "激励机制梳理"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    highlights: ["规则表达清晰", "适合逐步接入账户和数据", "能作为内容主题持续展开"],
    limitations: ["当前以展示和原型为主", "未接入持久化用户数据"],
    nextSteps: ["补充真实数据模型", "设计账户与隐私边界", "增加周报和复盘视图"],
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
    limitations: ["No live model integration yet", "No saved history yet", "Logged-in page analysis is not supported"],
    nextSteps: ["Build the URL capture service", "Integrate real model analysis", "Add share pages and PDF export"],
    links: [{ label: "Open demo", href: "/ai-page-analysis" }]
  },
  tracker: {
    title: "Practice Tracker",
    subtitle: "A personal growth product prototype around habits, streaks, and incentive rules",
    summary:
      "A lightweight system for tracking habit completion, streaks, and growth signals, focused on a clear rule loop and continuous feedback.",
    problem:
      "Many trackers only record whether a task was completed, without enough structure for goals, streaks, incentives, and anti-abuse boundaries.",
    solution:
      "Use daily check-ins as the core loop, then expose streaks, progress trends, and rules so personal growth becomes observable and reviewable.",
    role: ["Product rule design", "Frontend implementation", "Interaction flow", "Incentive model"],
    highlights: ["Clear rule expression", "Ready for accounts and persisted data", "Can grow into a long-running content theme"],
    limitations: ["Currently a public prototype", "No persisted user data yet"],
    nextSteps: ["Add a real data model", "Design account and privacy boundaries", "Add weekly review views"],
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
