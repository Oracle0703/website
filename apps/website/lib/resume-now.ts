import type { Locale } from "./i18n-core";
import { siteIdentity } from "./site-identity";

export const profileUpdatedAt = "2026-07-16";

export const resumeProjectSlugs = [
  "ai-page-analysis",
  "tracker",
  "knock",
  "dashboard-console",
  "timestamp-tool"
] as const;

type Capability = {
  title: string;
  description: string;
  keywords: string[];
};

type ResumeCopy = {
  eyebrow: string;
  title: string;
  role: string;
  introduction: string;
  evidenceBoundary: string;
  printAction: string;
  contactAction: string;
  githubAction: string;
  capabilitiesTitle: string;
  capabilitiesDescription: string;
  capabilities: Capability[];
  stackTitle: string;
  stackGroups: Array<{ title: string; items: string[] }>;
  workingStyleTitle: string;
  workingStyle: string[];
  evidenceTitle: string;
  evidenceDescription: string;
  evidenceAction: string;
  status: Record<"concept" | "prototype" | "mvp" | "live", string>;
  collaborationTitle: string;
  collaborationBody: string;
  collaborationAction: string;
  updatedLabel: string;
};

type NowCopy = {
  eyebrow: string;
  title: string;
  introduction: string;
  snapshotNote: string;
  updatedLabel: string;
  currentTitle: string;
  currentItems: Array<{ title: string; body: string }>;
  shippedTitle: string;
  shippedItems: Array<{ title: string; body: string }>;
  learningTitle: string;
  learningItems: string[];
  nextTitle: string;
  nextItems: string[];
  linksTitle: string;
  resumeAction: string;
  projectsAction: string;
  contactAction: string;
};

type ResumeNowCopy = {
  resume: ResumeCopy;
  now: NowCopy;
};

const copyByLocale: Record<Locale, ResumeNowCopy> = {
  zh: {
    resume: {
      eyebrow: `${siteIdentity.personName} · 能力型简历`,
      title: "把产品判断转化为可运行、可验证的系统",
      role: siteIdentity.byLocale.zh.role,
      introduction:
        "专注 Next.js、TypeScript 与 Node.js，也关注产品范围、交互体验、内容结构和上线后的维护边界。擅长从不确定的想法出发，先做清晰原型，再逐步补齐数据、安全、测试与部署闭环。",
      evidenceBoundary:
        "说明：本页只归纳可由本站公开项目与仓库内容验证的能力，不推断任职公司、教育经历、从业年限、客户或商业成绩。",
      printAction: "打印 / 保存 PDF",
      contactAction: "发起沟通",
      githubAction: "查看 GitHub",
      capabilitiesTitle: "核心能力",
      capabilitiesDescription: "能力按实际作品组织，而不是按未经核验的履历标签组织。",
      capabilities: [
        {
          title: "产品定义与原型",
          description:
            "把问题、受众、流程、失败状态和阶段边界整理成可讨论的产品结构，并用可交互原型验证叙事与信息架构。",
          keywords: ["产品范围", "信息架构", "交互状态", "结构化输出"]
        },
        {
          title: "全栈 Web 实现",
          description:
            "使用 React 与 Next.js 构建双语静态页面、交互工具和轻量 API，通过 TypeScript 与明确的数据模型控制复杂度。",
          keywords: ["Next.js", "React", "TypeScript", "Node.js"]
        },
        {
          title: "工程可信度",
          description:
            "把可访问性、SEO、输入校验、测试、缓存、限流和部署文档纳入功能交付，让个人项目保持可检查、可维护。",
          keywords: ["Accessibility", "SEO", "node:test", "安全边界"]
        }
      ],
      stackTitle: "技术范围",
      stackGroups: [
        { title: "界面与内容", items: ["Next.js", "React", "Tailwind CSS", "MDX", "Intl API"] },
        { title: "服务与数据", items: ["Node.js", "TypeScript", "SQLite", "REST API", "OSS"] },
        { title: "质量与交付", items: ["node:test", "Playwright", "静态渲染", "Windows / 宝塔部署"] }
      ],
      workingStyleTitle: "工作方式",
      workingStyle: [
        "先明确目标、非目标与风险，再选择最小可验证范围。",
        "用公开证据、限制说明和可运行页面代替模糊能力宣称。",
        "重视小服务器场景下的资源预算、故障边界与运维文档。"
      ],
      evidenceTitle: "公开项目证据",
      evidenceDescription:
        "以下项目状态、技术栈与证据摘要直接来自本站 Projects 数据；点击可查看问题、方案、权衡和下一步。",
      evidenceAction: "查看项目详情",
      status: {
        concept: "概念",
        prototype: "原型",
        mvp: "MVP",
        live: "已上线"
      },
      collaborationTitle: "适合沟通的方向",
      collaborationBody:
        "AI 应用原型、个人网站工程化、内容系统、后台控制台，以及需要兼顾产品体验与工程边界的小型 Web 产品。",
      collaborationAction: "通过站内表单联系",
      updatedLabel: "内容更新"
    },
    now: {
      eyebrow: "Now",
      title: "现在正在做什么",
      introduction:
        "一张关于当前建设方向、近期完成内容和下一步判断的简短快照。它帮助我保持公开承诺清晰，也让来访者快速了解项目正在往哪里走。",
      snapshotNote: "这是人工维护的阶段快照，不是实时活动记录。",
      updatedLabel: "最后更新",
      currentTitle: "当前建设方向",
      currentItems: [
        {
          title: "让个人网站成为可用的产品入口",
          body: "继续连接作品、文章、Labs、查询工具与个人成长功能，让内容不仅能阅读，也能被发现和直接使用。"
        },
        {
          title: "推动 AI 页面分析走向受控 MVP",
          body: "在现有结构化 Demo 基础上，继续明确抓取、模型调用、输出 schema、失败状态与安全边界。"
        },
        {
          title: "保持小服务器上的可维护性",
          body: "优先静态渲染和浏览器能力；必须使用服务端时，再补资源预算、缓存、限流、健康检查与部署说明。"
        }
      ],
      shippedTitle: "近期完成",
      shippedItems: [
        {
          title: "免费天气查询实验",
          body: "完成城市搜索、实时天气、三日预报和空气质量界面，并为服务端密钥、缓存与公平使用设置边界。"
        },
        {
          title: "安全的站内联系闭环",
          body: "补齐联系表单、服务端校验、反垃圾、健康检查和本地落盘边界，不公开占位联系方式。"
        },
        {
          title: "双语内容与公开证据链",
          body: "让首页、文章、项目详情与实验页面拥有独立中英文 URL，并持续补充 canonical、RSS、项目证据与限制说明。"
        }
      ],
      learningTitle: "正在学习与验证",
      learningItems: [
        "AI 产品中的结构化输出、评估方法和不确定性表达。",
        "Web 可访问性、性能、SEO 与双语内容组织的协同。",
        "小型单机服务的安全边界、可观测性与低成本运维。"
      ],
      nextTitle: "接下来",
      nextItems: [
        "根据真实访问路径继续打磨搜索、工具发现与本地数据体验。",
        "为 AI 页面分析设计安全抓取与真实模型接入的最小闭环。",
        "补充经人工检查的项目截图、架构图和更完整的工程文章。"
      ],
      linksTitle: "继续了解",
      resumeAction: "查看能力简历",
      projectsAction: "浏览公开项目",
      contactAction: "发起沟通"
    }
  },
  en: {
    resume: {
      eyebrow: `${siteIdentity.personName} · Capability resume`,
      title: "Turning product judgment into working, testable systems",
      role: siteIdentity.byLocale.en.role,
      introduction:
        "Focused on Next.js, TypeScript, and Node.js, with equal attention to product scope, interaction quality, content structure, and operational boundaries. I turn uncertain ideas into clear prototypes, then add data, security, testing, and deployment discipline as the product earns complexity.",
      evidenceBoundary:
        "Scope note: this page only summarizes capabilities supported by public projects and repository content. It does not infer employers, education, years of experience, clients, or commercial results.",
      printAction: "Print / save as PDF",
      contactAction: "Start a conversation",
      githubAction: "View GitHub",
      capabilitiesTitle: "Core capabilities",
      capabilitiesDescription:
        "Capabilities are organized around working evidence, not unverified résumé labels.",
      capabilities: [
        {
          title: "Product definition and prototypes",
          description:
            "Shape problems, audiences, workflows, failure states, and delivery boundaries into a product structure that can be discussed and tested through interactive prototypes.",
          keywords: ["Product scope", "Information architecture", "Interaction states", "Structured output"]
        },
        {
          title: "Full-stack web implementation",
          description:
            "Build bilingual static surfaces, interactive tools, and lightweight APIs with React and Next.js, using TypeScript and explicit data models to contain complexity.",
          keywords: ["Next.js", "React", "TypeScript", "Node.js"]
        },
        {
          title: "Engineering trust",
          description:
            "Treat accessibility, SEO, input validation, tests, caching, rate limits, and deployment notes as part of delivery so small projects stay inspectable and maintainable.",
          keywords: ["Accessibility", "SEO", "node:test", "Security boundaries"]
        }
      ],
      stackTitle: "Technical range",
      stackGroups: [
        { title: "Interface and content", items: ["Next.js", "React", "Tailwind CSS", "MDX", "Intl API"] },
        { title: "Services and data", items: ["Node.js", "TypeScript", "SQLite", "REST APIs", "OSS"] },
        { title: "Quality and delivery", items: ["node:test", "Playwright", "Static rendering", "Windows / Baota deployment"] }
      ],
      workingStyleTitle: "Working style",
      workingStyle: [
        "Define goals, non-goals, and risks before choosing the smallest testable scope.",
        "Prefer public evidence, limitation notes, and working pages over broad capability claims.",
        "Design around resource budgets, failure boundaries, and runbooks for small-server deployments."
      ],
      evidenceTitle: "Public project evidence",
      evidenceDescription:
        "Project status, stacks, and evidence summaries below come directly from the public Projects data. Open a project for its problem, solution, trade-offs, and next steps.",
      evidenceAction: "View project details",
      status: {
        concept: "Concept",
        prototype: "Prototype",
        mvp: "MVP",
        live: "Live"
      },
      collaborationTitle: "Good reasons to get in touch",
      collaborationBody:
        "AI application prototypes, personal-site engineering, content systems, operations dashboards, and small web products that need product experience and engineering boundaries to work together.",
      collaborationAction: "Use the contact form",
      updatedLabel: "Content updated"
    },
    now: {
      eyebrow: "Now",
      title: "What I am working on now",
      introduction:
        "A short snapshot of current build directions, recently completed work, and the decisions coming next. It keeps public commitments legible and gives visitors a quick sense of where the work is heading.",
      snapshotNote: "This is a manually maintained snapshot, not a real-time activity feed.",
      updatedLabel: "Last updated",
      currentTitle: "Current directions",
      currentItems: [
        {
          title: "Make the personal site a useful product surface",
          body: "Keep connecting projects, writing, Labs, query tools, and personal-growth features so the site is not only readable, but discoverable and directly useful."
        },
        {
          title: "Move AI page analysis toward a controlled MVP",
          body: "Build on the structured demo by defining capture, model calls, output schemas, failure states, and security boundaries before claiming production capability."
        },
        {
          title: "Keep a small server maintainable",
          body: "Prefer static rendering and browser capabilities. When a server is necessary, add explicit resource budgets, caching, rate limits, health checks, and deployment notes."
        }
      ],
      shippedTitle: "Recently completed",
      shippedItems: [
        {
          title: "Free weather query experiment",
          body: "Completed city search, current conditions, a three-day forecast, and air-quality views, with boundaries for server-side keys, caching, and fair use."
        },
        {
          title: "A safer on-site contact loop",
          body: "Added a contact form with server-side validation, anti-spam controls, health checks, and local storage boundaries without publishing placeholder contact details."
        },
        {
          title: "Bilingual content and public evidence",
          body: "Gave home, writing, project, and experiment surfaces distinct Chinese and English URLs while improving canonicals, RSS, project evidence, and limitation notes."
        }
      ],
      learningTitle: "Learning and validating",
      learningItems: [
        "Structured output, evaluation methods, and honest uncertainty in AI products.",
        "How accessibility, performance, SEO, and bilingual content architecture reinforce each other.",
        "Security boundaries, observability, and low-cost operations for single-machine services."
      ],
      nextTitle: "Next",
      nextItems: [
        "Use real navigation patterns to refine search, tool discovery, and local-data experiences.",
        "Design the smallest secure capture and live-model loop for AI page analysis.",
        "Add reviewed project screenshots, architecture diagrams, and deeper engineering writing."
      ],
      linksTitle: "Continue exploring",
      resumeAction: "View capability resume",
      projectsAction: "Browse public projects",
      contactAction: "Start a conversation"
    }
  }
};

export function getResumeNowCopy(locale: Locale) {
  return copyByLocale[locale];
}
