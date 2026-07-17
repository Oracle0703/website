import { getPublishedPostsForLocale } from "./blog";
import { getBlogTopicLabel } from "./blog-topics";
import { getChangelogEntries } from "./changelog";
import type { Locale } from "./i18n-core";
import { getLocalePath } from "./locale-routing";
import { getProjectViews } from "./projects";

export type SiteSearchEntry = {
  id: string;
  locale: Locale;
  kind: "page" | "article" | "project" | "tool";
  title: string;
  description: string;
  href: string;
  keywords: string[];
  text: string;
};

type StaticSearchEntry = Omit<SiteSearchEntry, "id" | "locale" | "href" | "text"> & {
  path: string;
};

const staticEntries: Record<Locale, StaticSearchEntry[]> = {
  zh: [
    {
      kind: "page",
      title: "首页",
      description: "AI 产品、全栈工程、独立创作与代表作品。",
      path: "/",
      keywords: ["主页", "个人网站", "AI", "全栈", "作品"]
    },
    {
      kind: "page",
      title: "探索",
      description: "集中发现网站中的工具、原型、文章与个人动态。",
      path: "/explore",
      keywords: ["导航", "工具", "实验", "入口"]
    },
    {
      kind: "page",
      title: "更新日志",
      description: "按时间查看已经上线并可以验证的网站功能、改进与修复。",
      path: "/changelog",
      keywords: ["Changelog", "发布记录", "网站更新", "版本"]
    },
    {
      kind: "page",
      title: "文章",
      description: "关于产品工程、AI 应用、内容系统与实践复盘的文章。",
      path: "/blog",
      keywords: ["博客", "写作", "教程", "技术文章"]
    },
    {
      kind: "page",
      title: "作品",
      description: "AI 工具、产品系统、Dashboard 与工程基础设施案例。",
      path: "/projects",
      keywords: ["项目", "案例", "portfolio", "work"]
    },
    {
      kind: "tool",
      title: "实验室",
      description: "时间戳、免费查询与浏览器端开发工具。",
      path: "/labs",
      keywords: ["Labs", "时间戳", "工具"]
    },
    {
      kind: "tool",
      title: "免费天气查询",
      description: "按城市查询实时天气、三日预报与空气质量。",
      path: "/labs/query",
      keywords: ["天气", "预报", "空气质量", "WeatherAPI"]
    },
    {
      kind: "tool",
      title: "开发者工具箱",
      description: "JSON、URL/Base64、UUID、SHA-256 与颜色对比度工具。",
      path: "/labs/tools",
      keywords: ["JSON", "Base64", "URL", "UUID", "SHA-256", "颜色对比度"]
    },
    {
      kind: "tool",
      title: "本地习惯 Tracker",
      description: "只在当前浏览器保存的习惯、打卡、连续天数与七日统计。",
      path: "/tracker",
      keywords: ["打卡", "习惯", "连续天数", "本地存储", "localStorage"]
    },
    {
      kind: "tool",
      title: "AI 页面分析",
      description: "体验从页面输入到诊断建议与 backlog 的产品原型。",
      path: "/ai-page-analysis",
      keywords: ["AI", "页面分析", "诊断", "产品原型"]
    },
    {
      kind: "page",
      title: "能力简历",
      description: "以公开作品为证据的能力、技术栈与交付方式概览。",
      path: "/resume",
      keywords: ["简历", "履历", "技能", "PDF", "合作"]
    },
    {
      kind: "page",
      title: "Now",
      description: "最近在建设、学习和计划的内容。",
      path: "/now",
      keywords: ["现在", "动态", "更新日志", "计划"]
    },
    {
      kind: "page",
      title: "关于",
      description: "我的产品判断、工程原则与工作方式。",
      path: "/about",
      keywords: ["介绍", "原则", "工作方式"]
    },
    {
      kind: "page",
      title: "联系",
      description: "围绕 AI 原型、网站工程与小产品交付发起沟通。",
      path: "/contact",
      keywords: ["合作", "联系", "需求", "GitHub"]
    }
  ],
  en: [
    {
      kind: "page",
      title: "Home",
      description: "AI products, full-stack engineering, independent making, and selected work.",
      path: "/",
      keywords: ["personal site", "AI", "full stack", "portfolio"]
    },
    {
      kind: "page",
      title: "Explore",
      description: "Discover tools, prototypes, writing, and current work in one place.",
      path: "/explore",
      keywords: ["navigation", "tools", "experiments", "directory"]
    },
    {
      kind: "page",
      title: "Changelog",
      description: "Browse the site features, improvements, and fixes that are live and verifiable.",
      path: "/changelog",
      keywords: ["releases", "updates", "build log", "versions"]
    },
    {
      kind: "page",
      title: "Writing",
      description: "Notes on product engineering, AI applications, content systems, and delivery.",
      path: "/blog",
      keywords: ["blog", "writing", "tutorials", "engineering"]
    },
    {
      kind: "page",
      title: "Work",
      description: "Case studies across AI tools, product systems, dashboards, and infrastructure.",
      path: "/projects",
      keywords: ["projects", "case studies", "portfolio"]
    },
    {
      kind: "tool",
      title: "Labs",
      description: "Timestamp, free-query, and browser-native developer tools.",
      path: "/labs",
      keywords: ["experiments", "timestamp", "tools"]
    },
    {
      kind: "tool",
      title: "Free weather query",
      description: "Look up current weather, a three-day forecast, and air quality by city.",
      path: "/labs/query",
      keywords: ["weather", "forecast", "air quality", "WeatherAPI"]
    },
    {
      kind: "tool",
      title: "Developer toolbox",
      description: "JSON, URL/Base64, UUID, SHA-256, and color-contrast utilities.",
      path: "/labs/tools",
      keywords: ["JSON", "Base64", "URL", "UUID", "SHA-256", "contrast"]
    },
    {
      kind: "tool",
      title: "Local habit tracker",
      description: "Habits, check-ins, streaks, and seven-day activity stored only in this browser.",
      path: "/tracker",
      keywords: ["habits", "check-in", "streak", "localStorage"]
    },
    {
      kind: "tool",
      title: "AI page analysis",
      description: "A product prototype that turns a page brief into diagnostics and a backlog.",
      path: "/ai-page-analysis",
      keywords: ["AI", "page analysis", "diagnostics", "prototype"]
    },
    {
      kind: "page",
      title: "Capability resume",
      description: "Skills, stack, and delivery approach backed by public project evidence.",
      path: "/resume",
      keywords: ["resume", "skills", "CV", "print", "collaboration"]
    },
    {
      kind: "page",
      title: "Now",
      description: "What I am building, learning, and planning next.",
      path: "/now",
      keywords: ["now", "updates", "build log", "roadmap"]
    },
    {
      kind: "page",
      title: "About",
      description: "My product judgment, engineering principles, and way of working.",
      path: "/about",
      keywords: ["profile", "principles", "process"]
    },
    {
      kind: "page",
      title: "Contact",
      description: "Start a focused conversation about AI prototypes, site engineering, or delivery.",
      path: "/contact",
      keywords: ["contact", "collaboration", "project", "GitHub"]
    }
  ]
};

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|=-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maximum = 1_600) {
  return value.length <= maximum ? value : `${value.slice(0, maximum)}…`;
}

function staticIndex(locale: Locale): SiteSearchEntry[] {
  return staticEntries[locale].map((entry) => ({
    id: `${locale}:page:${entry.path}`,
    locale,
    kind: entry.kind,
    title: entry.title,
    description: entry.description,
    href: getLocalePath(entry.path, locale),
    keywords: entry.keywords,
    text: `${entry.title} ${entry.description} ${entry.keywords.join(" ")}`
  }));
}

function articleIndex(locale: Locale): SiteSearchEntry[] {
  return getPublishedPostsForLocale(locale).filter((post) => !post.seo?.noindex).map((post) => {
    const topic = post.category ? getBlogTopicLabel(post.category, locale) : "";
    const keywords = [...(post.tags ?? []), topic].filter(Boolean);

    return {
      id: `${locale}:article:${post.slug}`,
      locale,
      kind: "article",
      title: post.title,
      description: post.summary,
      href: getLocalePath(`/blog/${encodeURIComponent(post.slug)}`, locale),
      keywords,
      text: truncate(stripMarkdown(`${post.title} ${post.summary} ${post.content}`))
    };
  });
}

function projectIndex(locale: Locale): SiteSearchEntry[] {
  return getProjectViews(locale).map((project) => {
    const keywords = [...project.stack, project.status, project.type];
    const text = [
      project.title,
      project.subtitle,
      project.summary,
      project.problem,
      project.solution,
      ...project.highlights,
      ...project.stack
    ].join(" ");

    return {
      id: `${locale}:project:${project.slug}`,
      locale,
      kind: "project",
      title: project.title,
      description: project.summary,
      href: getLocalePath(`/projects/${encodeURIComponent(project.slug)}`, locale),
      keywords,
      text: truncate(stripMarkdown(text))
    };
  });
}

function changelogIndex(locale: Locale): SiteSearchEntry[] {
  const changelogPath = getLocalePath("/changelog", locale);

  return getChangelogEntries(locale).map((entry) => {
    const text = [entry.title, entry.summary, ...entry.highlights].join(" ");

    return {
      id: `${locale}:release:${entry.id}`,
      locale,
      kind: "page",
      title: entry.title,
      description: entry.summary,
      href: `${changelogPath}#${entry.id}`,
      keywords: ["changelog", "release", entry.kind],
      text: truncate(stripMarkdown(text))
    };
  });
}

export function getSiteSearchIndex() {
  const locales: Locale[] = ["zh", "en"];

  return locales.flatMap((locale) => [
    ...staticIndex(locale),
    ...changelogIndex(locale),
    ...articleIndex(locale),
    ...projectIndex(locale)
  ]);
}
