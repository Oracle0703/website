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

export type ProjectCaseStudy = {
  problem: string;
  constraints: string[];
  decisions: string[];
  implementation: string[];
  result: string[];
  next: string[];
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
  caseStudy: ProjectCaseStudy;
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
  caseStudy: ProjectCaseStudy;
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
    caseStudy: {
      problem:
        "页面改版讨论需要把目标受众、业务目标、页面证据和执行 backlog 串起来，否则很容易停留在主观审美和零散建议。",
      constraints: [
        "公开 demo 不能抓取登录后页面，也不能把 SSRF、模型成本和隐私风险一次性推到前端体验里。",
        "输出必须稳定成评分、问题、建议和 backlog，不能让模型自由文本直接进入用户界面。",
        "中英文路由要共用同一产品能力边界，避免英文页面暗示已经具备未上线的真实模型能力。"
      ],
      decisions: [
        "先把 URL 输入、结构化 brief、分析步骤和安全 fallback 固化为可测试的 V1 体验。",
        "把模型能力放到服务端 adapter 边界，前端只消费经过 schema gate 的结果。",
        "低置信度和脏输出不强行展示为确定结论，而是通过 `needs_review` 和错误码保留人工复核空间。"
      ],
      implementation: [
        "使用 Next.js 页面承载输入、流水线状态、错误恢复和结果渲染，并通过 `/api/analyze` 连接后端分析流程。",
        "后端复用 capture harness、输出 schema 校验和 safe mock adapter，让没有模型环境时仍能稳定演示。",
        "产品规格、技术规格、英文审计和 release checklist 同步记录 SSRF、错误码、结构化输出和非目标边界。"
      ],
      result: [
        "公开页面已经能展示从 URL 与 brief 到评分、问题、建议和 backlog 的完整任务转化链路。",
        "测试覆盖 capture、adapter、output gate、API route、前端结构化 brief 和英文内容护栏。",
        "当前仍明确标记为 prototype，不伪装成已经接入真实网页抓取和生产模型分析的完整产品。"
      ],
      next: [
        "接入经过成本、限流和隐私评估的真实模型 provider，并保留 safe fallback。",
        "增加可分享结果页或导出能力前，先验证结果结构和用户复盘价值。",
        "补充真实页面样本的人工验收集，避免模型建议偏离产品目标。"
      ]
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
    evidence: [
      { label: "公开入口", value: "Tracker 页面已进入中英文公开路由、sitemap 和浏览器验收" },
      { label: "规则闭环", value: "页面围绕目标、打卡、连续性、趋势和复盘组织信息" },
      { label: "阶段边界", value: "当前明确为原型，不伪装已具备账户和持久化能力" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/tracker-product-mock.svg",
      alt: "修行打卡系统的 product mock，展示目标、打卡、连续性和复盘模块",
      caption:
        "Product mock：用于说明打卡产品的核心界面结构，当前不代表已接入账户或持久化数据。"
    },
    caseStudy: {
      problem:
        "打卡产品如果只记录完成与否，很难解释目标、连续性、复盘和激励之间的关系，也难以判断后续账户和数据能力应该先做什么。",
      constraints: [
        "当前阶段没有账户和持久化数据，不能把静态页面包装成真实多人系统。",
        "打卡激励容易过度设计，必须先保持规则轻量，避免在没有行为数据时引入复杂积分或惩罚机制。",
        "作为个人网站项目案例，页面要能说明产品判断，而不是只展示一张好看的习惯列表。"
      ],
      decisions: [
        "先把目标、每日动作、连续性、趋势和复盘组织成一个可理解的产品闭环。",
        "使用 product mock 表达核心界面结构，并明确它不代表已接入账户或真实历史数据。",
        "把下一步拆成数据模型、隐私边界和周报复盘，而不是直接扩展社交或排行榜。"
      ],
      implementation: [
        "用 Next.js 静态页面展示 tracker 产品叙事，保留中英文路由、sitemap 和浏览器验收。",
        "项目模型中把 evidence、asset、tradeoffs、roadmap 和 limitations 分开，避免把原型写成已上线系统。",
        "详情页通过案例结构解释为什么先验证规则闭环，再进入账户、持久化和统计视图。"
      ],
      result: [
        "Tracker 已成为网站里可访问的产品系统原型，访客能理解它的目标、边界和演进方向。",
        "公开 mock 让界面结构可视化，同时避免暴露不存在的数据能力。",
        "项目案例能支撑后续围绕习惯系统、个人成长产品和内容主题继续扩展。"
      ],
      next: [
        "定义用户、习惯、打卡记录和统计摘要的数据模型。",
        "补充隐私、删除、连续天数重算和重复打卡的边界条件。",
        "在真实数据模型稳定后，再考虑周报、复盘和激励规则。"
      ]
    },
    architecture:
      "当前是静态产品原型页，先把规则、反馈和页面层级稳定下来；真实版本会拆出用户、习惯、打卡记录和统计视图的数据模型。",
    tradeoffs: [
      "先做规则展示而非登录系统，能更快验证产品叙事，但无法承载真实多人数据。",
      "不接数据库让静态部署更稳，但连续打卡和复盘只能作为设计预览。",
      "激励规则保持轻量，避免在没有真实行为数据时过度设计。"
    ],
    roadmap: ["定义用户与习惯数据模型", "补每日打卡和连续天数逻辑", "增加周报、复盘和隐私边界"],
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
    caseStudy: {
      problem:
        "个人项目上线后需要最小可用的访问观察能力，否则异常访问、配置错误和公开入口风险只能靠零散日志回溯。",
      constraints: [
        "访问日志天然包含地址、路径和时间线，公开案例不能展示原始监控截图。",
        "个人项目部署成本要低，不能为了早期观察能力引入复杂日志平台。",
        "当前测试依赖 Node 22 与原生模块 ABI，本地验证前提需要被明确写出。"
      ],
      decisions: [
        "先用 Node 服务、本地 SQLite 和 Basic Auth 做最小监控闭环。",
        "公开项目页只展示能力边界和脱敏证明，不展示原始访问事件。",
        "把 Knock 定位成 Dashboard Console 的运行摘要来源，而不是单独扩展成完整观测平台。"
      ],
      implementation: [
        "服务端负责记录访问事件、解析日志并提供受保护的监控入口。",
        "项目详情页使用 `none` 资产策略解释为什么暂不公开截图，并记录下一步脱敏资产计划。",
        "测试和文档保留 Node 版本、SQLite 单机形态、鉴权边界和日志保留风险。"
      ],
      result: [
        "项目已经具备 MVP 级访问事件记录、日志解析和基础鉴权说明。",
        "公开案例能说明监控价值，同时不泄露运行环境、访问者信息或内部路径。",
        "后续可以把脱敏摘要接入 Dashboard，而不需要重写监控数据来源。"
      ],
      next: [
        "生成只包含聚合计数、状态和时间窗口的脱敏运行摘要。",
        "增加日志保留、清理和异常告警策略，避免数据无界增长。",
        "把 Knock 摘要接入 Dashboard Console 的运维视图。"
      ]
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
    caseStudy: {
      problem:
        "个人网站长期维护时，内容状态、部署记录、任务和运行事件散落在不同位置，容易让下一步优先级依赖人工记忆。",
      constraints: [
        "内部控制台可能包含任务、日志、对象存储状态和部署信号，不能直接公开截图。",
        "当前阶段不应直接编辑 MDX 内容，否则会引入 Git、review、部署和回滚全链路风险。",
        "OSS 对象与 ETag 冲突是设计约束，不能假设单人操作就没有并发问题。"
      ],
      decisions: [
        "先做状态聚合和任务事件管理，再考虑内容编辑和复杂权限。",
        "把 Dashboard 作为个人网站运营中枢，后续承接内容健康度、Contact Ops 和 Knock 摘要。",
        "公开案例只描述架构和脱敏证明，不展示内部任务、日志或对象键。"
      ],
      implementation: [
        "dashboard-api 负责读写任务与事件，dashboard-web 负责展示可操作的运营状态视图。",
        "存储层保留 OSS 与 ETag 冲突边界，让失败状态可以被文档和后续测试覆盖。",
        "项目页通过 evidence、tradeoffs 和 case study 解释为什么先聚合状态，而不是直接上线 CMS。"
      ],
      result: [
        "任务、日志、事件和系统状态已经被抽象为统一控制台模型。",
        "公开作品页能说明运维价值与隐私边界，不暴露内部运行数据。",
        "该项目为 P3-C Content Operations 提供了自然承接点。"
      ],
      next: [
        "新增内容健康度只读模块，展示 published、draft、metadata 和 series coverage。",
        "接入部署记录、健康状态和 Knock 运行摘要。",
        "在真实使用稳定后，再补权限、审计和更细粒度的数据脱敏策略。"
      ]
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
    caseStudy: {
      problem:
        "开发和排障时经常需要快速转换时间戳，但常见工具干扰多、反馈弱，也很难沉淀成个人网站里可复用的小工具模板。",
      constraints: [
        "工具必须打开即用，不能为了一个小功能引入后端、账户或复杂状态管理。",
        "时间和时区边界容易产生误解，首版要优先覆盖高频时间戳转换，而不是承诺完整日历系统。",
        "Labs 页面需要保持轻量，不能让单个工具压过其他实验入口。"
      ],
      decisions: [
        "用客户端组件承载输入、校验、转换结果和复制反馈。",
        "依赖浏览器 Intl API 处理本地格式和时区展示，避免引入额外时区数据库。",
        "把工具作为 Labs 模板样本，后续小工具可复用输入、结果、错误和反馈结构。"
      ],
      implementation: [
        "在 Labs 页面内实现时间戳输入、日期格式展示、时区信息和复制状态。",
        "使用 TypeScript 和 React 状态处理边界输入，保持不需要后端服务的静态部署能力。",
        "项目详情页明确当前未提供批量转换，避免把小工具描述成完整时间处理平台。"
      ],
      result: [
        "时间戳工具已经作为 Labs 的一部分公开可访问，能够展示可直接使用的小工具方向。",
        "输入、校验、结果和复制反馈形成了后续 Labs 工具的最小模板。",
        "项目案例让这个小工具不只是入口列表，而是能说明实现取舍和演进边界。"
      ],
      next: [
        "补真实浏览器截图并替换当前 asset none 状态。",
        "增加批量转换和更多时区比较，但继续保持无需账户和后端。",
        "抽取 Labs 工具通用页面结构，降低新增小工具成本。"
      ]
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
    caseStudy: {
      problem:
        "Page redesign work needs a shared path from audience, business goal, page evidence, and execution backlog; otherwise the discussion collapses into taste and scattered suggestions.",
      constraints: [
        "The public demo cannot analyze logged-in pages or push SSRF, model cost, and privacy risk into the client experience.",
        "The output must stay shaped as scores, issues, recommendations, and backlog instead of rendering free-form model text.",
        "Chinese and English routes must describe the same capability boundary without implying live model analysis before it ships."
      ],
      decisions: [
        "Stabilize URL input, structured brief fields, analysis steps, and safe fallback before adding real providers.",
        "Keep model behavior behind a server-side adapter so the frontend only consumes schema-gated results.",
        "Treat low confidence and malformed output as review or error states instead of presenting them as certain conclusions."
      ],
      implementation: [
        "A Next.js surface handles input, pipeline states, recoverable errors, and result rendering through the `/api/analyze` endpoint.",
        "The backend reuses the capture harness, output schema validation, and safe mock adapter so the demo remains stable without model credentials.",
        "Product and technical specs, English audits, and release checks document SSRF limits, error codes, structured output, and non-goals."
      ],
      result: [
        "The public page now demonstrates the full path from URL and brief to scores, issues, recommendations, and backlog.",
        "Tests cover capture, adapter behavior, output gating, API routing, structured brief payloads, and English content guardrails.",
        "The project remains labeled as a prototype and does not claim production crawling or live model analysis."
      ],
      next: [
        "Connect a real model provider only after cost, rate limit, and privacy boundaries are defined.",
        "Validate result reuse before adding share pages or export workflows.",
        "Build a small reviewed sample set so model recommendations stay tied to product goals."
      ]
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
    subtitle: "A personal growth product prototype around habits, streaks, and incentive rules",
    summary:
      "A lightweight system for tracking habit completion, streaks, and growth signals, focused on a clear rule loop and continuous feedback.",
    problem:
      "Many trackers only record whether a task was completed, without enough structure for goals, streaks, incentives, and anti-abuse boundaries.",
    solution:
      "Use daily check-ins as the core loop, then expose streaks, progress trends, and rules so personal growth becomes observable and reviewable.",
    role: ["Product rule design", "Frontend implementation", "Interaction flow", "Incentive model"],
    highlights: ["Clear rule expression", "Ready for accounts and persisted data", "Can grow into a long-running content theme"],
    evidence: [
      { label: "Public route", value: "The Tracker page is covered by bilingual public routes, sitemap, and browser verification" },
      { label: "Rule loop", value: "The page frames goals, check-ins, streaks, trends, and review as one product loop" },
      { label: "Stage boundary", value: "The current surface is explicitly a prototype, not an account-backed tracker" }
    ],
    asset: {
      kind: "mock",
      src: "/projects/tracker-product-mock.svg",
      alt: "Product mock for the Practice Tracker showing goals, check-ins, streaks, and review modules",
      caption:
        "Product mock: it shows the intended tracker interface without claiming accounts or persisted user data."
    },
    caseStudy: {
      problem:
        "A tracker that only stores done or not done cannot explain how goals, streaks, review, and incentive rules should work together.",
      constraints: [
        "The current stage has no account system or persisted user data, so the page cannot pretend to be a live multi-user product.",
        "Incentive design can become heavy quickly, so the first version must avoid complex points, penalties, or social ranking without behavior data.",
        "As a portfolio case, the page needs to explain product judgment rather than only show a polished habit list."
      ],
      decisions: [
        "Frame goals, daily action, streaks, trends, and review as one understandable product loop.",
        "Use a product mock to show the interface structure while clearly marking that accounts and history are not live.",
        "Keep the next work focused on data model, privacy boundaries, and weekly review before adding social mechanics."
      ],
      implementation: [
        "A static Next.js route presents the tracker product story with bilingual routing, sitemap coverage, and browser verification.",
        "The project model separates evidence, assets, trade-offs, roadmap, and limitations so the prototype is not overstated.",
        "The detail case explains why the rule loop is validated before account, persistence, and statistics views."
      ],
      result: [
        "Tracker is now a browsable product-system prototype with a clear goal, boundary, and evolution path.",
        "The public mock visualizes the core interface without exposing or inventing user data.",
        "The case can support future writing around habit systems, personal growth products, and product rule design."
      ],
      next: [
        "Define user, habit, check-in, and statistics summary data models.",
        "Document privacy, deletion, streak recalculation, and duplicate check-in rules.",
        "Add weekly review and incentive views after the data model becomes real."
      ]
    },
    architecture:
      "The current route is a static product prototype that stabilizes rules, feedback, and page hierarchy first. A real version would split user, habit, check-in, and statistics data models.",
    tradeoffs: [
      "Starting with rule communication validates the product story faster than building an account system.",
      "Static deployment stays simple, but streaks and reviews remain a design preview until data is persisted.",
      "Incentive rules stay lightweight until real behavior data exists."
    ],
    roadmap: ["Define user and habit data models", "Add daily check-in and streak logic", "Add weekly reviews and privacy boundaries"],
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
    caseStudy: {
      problem:
        "Personal projects need minimal access visibility after launch; otherwise abnormal traffic, configuration mistakes, and exposed endpoints are hard to diagnose.",
      constraints: [
        "Access logs can contain addresses, paths, and timelines, so the public case cannot show raw monitoring screenshots.",
        "The deployment cost must stay low for a personal project instead of introducing a full observability platform too early.",
        "Local verification depends on Node 22 and the native module ABI, so the test boundary must stay explicit."
      ],
      decisions: [
        "Use a Node service, local SQLite storage, and Basic Auth as the first monitoring loop.",
        "Show capability boundaries and redacted proof publicly, not raw access events.",
        "Position Knock as a future runtime summary source for Dashboard Console rather than a standalone observability suite."
      ],
      implementation: [
        "The service records access events, parses logs, and exposes a protected monitoring surface.",
        "The project detail uses a `none` asset strategy to explain why screenshots are withheld and what redacted asset comes next.",
        "Tests and documentation keep Node version, single-machine SQLite, authentication, and retention risks visible."
      ],
      result: [
        "The project has an MVP shape for access event recording, log parsing, and basic authenticated monitoring.",
        "The public case explains operational value without exposing runtime environment details, visitor data, or internal paths.",
        "A future Dashboard integration can reuse the summary source without rebuilding the monitor."
      ],
      next: [
        "Generate a redacted runtime summary with only aggregate counts, status, and time windows.",
        "Add retention, cleanup, and alerting policy so logs cannot grow without bounds.",
        "Feed Knock summaries into the Dashboard Console operations view."
      ]
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
    caseStudy: {
      problem:
        "As the personal site grows, content state, deployment records, tasks, and runtime events become scattered, making prioritization depend on memory.",
      constraints: [
        "The internal console can contain tasks, logs, storage state, and deployment signals, so raw screenshots are not public assets.",
        "Direct MDX editing would require a full Git, review, deploy, and rollback workflow, which is too much for this stage.",
        "Object storage and ETag conflicts are real design constraints even when the system is mostly used by one person."
      ],
      decisions: [
        "Build state aggregation and task-event management before adding content editing or complex permissions.",
        "Use Dashboard as the operations hub that can later host content health, Contact Ops, and Knock summaries.",
        "Keep the public case at the architecture and redacted-proof level instead of exposing internal task or storage details."
      ],
      implementation: [
        "dashboard-api owns task and event reads and writes while dashboard-web renders actionable operations views.",
        "The storage layer preserves object storage and ETag conflict boundaries so failure states can be documented and tested later.",
        "The project page uses evidence, trade-offs, and the case study to explain why state aggregation comes before a CMS."
      ],
      result: [
        "Tasks, logs, events, and system status are shaped into one console model.",
        "The public project page can explain operations value and privacy boundaries without leaking internal data.",
        "The project provides a natural landing point for P3-C Content Operations."
      ],
      next: [
        "Add a read-only content health module for published posts, drafts, metadata, and series coverage.",
        "Connect deployment records, health status, and Knock runtime summaries.",
        "Add permissions, audit trails, and stronger redaction rules after real usage stabilizes."
      ]
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
    caseStudy: {
      problem:
        "Development and debugging often need quick timestamp conversion, but many tools are noisy, weak on feedback, and disconnected from the working context.",
      constraints: [
        "The tool must open instantly without accounts, backend services, or heavy state management.",
        "Time and timezone rules can be misunderstood, so the first version should cover common timestamp cases instead of claiming a full calendar system.",
        "Labs needs to stay lightweight, so one utility should not dominate the whole experiments section."
      ],
      decisions: [
        "Use a client component for input, validation, converted output, and copy feedback.",
        "Rely on the browser Intl API for local format and timezone display instead of adding a timezone database.",
        "Treat the tool as a template for future Labs utilities with reusable input, result, error, and feedback patterns."
      ],
      implementation: [
        "The Labs page includes timestamp input, date-format output, timezone context, and copy state.",
        "React and TypeScript handle invalid input and interactive feedback while preserving static deployment.",
        "The detail page states that batch conversion is not included yet, keeping the tool scoped and honest."
      ],
      result: [
        "The timestamp tool is publicly available inside Labs and demonstrates a directly usable utility direction.",
        "Its input, validation, result, and copy feedback create a small template for future Labs tools.",
        "The case study turns the utility from a simple link into a documented implementation and trade-off example."
      ],
      next: [
        "Capture a reviewed browser screenshot and replace the current unavailable asset state.",
        "Add batch conversion and timezone comparison while keeping the tool account-free.",
        "Extract shared Labs tool page structure to reduce the cost of adding more utilities."
      ]
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
    caseStudy: project.caseStudy,
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
