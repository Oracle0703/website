import type { Locale } from "./i18n-core";

export type ChangelogKind = "feature" | "improvement" | "fix";

type Localized<T> = Record<Locale, T>;

type ChangelogLink = {
  href: string;
  label: Localized<string>;
};

type ChangelogEntry = {
  id: string;
  releasedAt: string;
  kind: ChangelogKind;
  title: Localized<string>;
  summary: Localized<string>;
  highlights: Localized<readonly string[]>;
  links: readonly ChangelogLink[];
};

export type ChangelogEntryView = {
  id: string;
  releasedAt: string;
  kind: ChangelogKind;
  title: string;
  summary: string;
  highlights: readonly string[];
  links: ReadonlyArray<{ href: string; label: string }>;
};

export type ChangelogCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    releaseCount: string;
    highlightsTitle: string;
    relatedLinksTitle: string;
    backToHome: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    viewEntry: string;
    viewAll: string;
  };
  kindLabels: Record<ChangelogKind, string>;
};

// Public release notes are deliberately curated instead of generated from Git.
// This keeps internal commit text out of the site and makes every claim reviewable.
const changelogEntries: readonly ChangelogEntry[] = [
  {
    id: "local-first-site-experience",
    releasedAt: "2026-07-16T17:51:41+08:00",
    kind: "feature",
    title: {
      zh: "本地优先的网站体验套件",
      en: "Local-first site experience suite"
    },
    summary: {
      zh: "上线全站搜索、本地习惯 Tracker、博客阅读辅助、双语简历与 Now 页面，以及浏览器端开发者工具箱。",
      en: "Shipped site search, a local habit tracker, blog reading utilities, bilingual Resume and Now pages, and a browser-only developer toolbox."
    },
    highlights: {
      zh: [
        "用 Ctrl/Cmd + K 打开按需加载的静态搜索索引。",
        "Tracker 数据只保存在当前浏览器，并支持导入、导出与重置。",
        "博客增加阅读进度、分享和 RSS 入口；评论仍保持可选且默认关闭。"
      ],
      en: [
        "Added an on-demand static search index behind Ctrl/Cmd + K.",
        "Kept Tracker data in the current browser with import, export, and reset controls.",
        "Added reading progress, sharing, and RSS entry points while comments remain optional and off by default."
      ]
    },
    links: [
      {
        href: "/explore",
        label: { zh: "浏览全部入口", en: "Browse every entry point" }
      },
      {
        href: "https://github.com/Oracle0703/website/pull/7",
        label: { zh: "查看公开合并记录", en: "View the public merge record" }
      }
    ]
  },
  {
    id: "free-weather-query-lab",
    releasedAt: "2026-07-16T15:53:38+08:00",
    kind: "feature",
    title: {
      zh: "免费天气查询实验",
      en: "Free weather query lab"
    },
    summary: {
      zh: "新增城市搜索、实时天气、三日预报与空气质量查询，并把第三方密钥和公平使用边界留在服务端。",
      en: "Added city search, current weather, a three-day forecast, and air quality while keeping the third-party key and fair-use boundary server-side."
    },
    highlights: {
      zh: [
        "先选择包含地区与国家信息的准确地点，再请求天气数据。",
        "提供公制与英制切换、缓存降级提示和健康检查。",
        "浏览器只访问同源接口，不暴露上游 API 密钥。"
      ],
      en: [
        "Choose an exact location with region and country context before weather is requested.",
        "Included metric and imperial units, cached-fallback notices, and health checks.",
        "The browser calls same-origin endpoints without exposing the upstream API key."
      ]
    },
    links: [
      {
        href: "/labs/query",
        label: { zh: "打开天气查询", en: "Open the weather query" }
      },
      {
        href: "https://github.com/Oracle0703/website/pull/6",
        label: { zh: "查看公开合并记录", en: "View the public merge record" }
      }
    ]
  },
  {
    id: "low-memory-windows-release",
    releasedAt: "2026-07-16T14:59:51+08:00",
    kind: "improvement",
    title: {
      zh: "小内存服务器与 Windows 发布流程",
      en: "Low-memory server and Windows release workflow"
    },
    summary: {
      zh: "把构建工作移到 Windows CI，产出可直接部署的 standalone 包，让小服务器不再承担 npm install 与生产构建。",
      en: "Moved production builds to Windows CI and produced a deployable standalone bundle so the small server no longer runs npm install or the production build."
    },
    highlights: {
      zh: [
        "Windows x64 工作流构建并验证平台对应的 standalone 产物。",
        "发布包显式包含 public、静态资源和运行所需文件。",
        "部署文档固定端口、健康检查、回滚与备份边界。"
      ],
      en: [
        "A Windows x64 workflow builds and verifies the platform-specific standalone artifact.",
        "The package explicitly includes public assets, static files, and runtime dependencies.",
        "Deployment documentation fixes the port, health-check, rollback, and backup boundaries."
      ]
    },
    links: [
      {
        href: "https://github.com/Oracle0703/website/pull/5",
        label: { zh: "查看公开合并记录", en: "View the public merge record" }
      }
    ]
  }
];

const copyByLocale: Record<Locale, ChangelogCopy> = {
  zh: {
    page: {
      eyebrow: "Changelog / 更新日志",
      title: "记录网站真正发布的变化",
      description:
        "这里按发布时间整理已经上线并可以验证的功能、改进与修复。它不是自动生成的提交列表，而是一份面向访客的公开发布记录。",
      releaseCount: "已记录的公开发布",
      highlightsTitle: "本次变化",
      relatedLinksTitle: "继续查看",
      backToHome: "返回首页"
    },
    home: {
      eyebrow: "最近发布",
      title: "网站最近有什么变化",
      description: "只记录已经上线并可以从页面或公开仓库验证的更新。",
      viewEntry: "查看这次发布",
      viewAll: "查看完整更新日志"
    },
    kindLabels: {
      feature: "新功能",
      improvement: "改进",
      fix: "修复"
    }
  },
  en: {
    page: {
      eyebrow: "Changelog / Releases",
      title: "A record of what actually shipped",
      description:
        "A chronological record of features, improvements, and fixes that are live and verifiable. It is a visitor-facing release log rather than an automatically generated commit feed.",
      releaseCount: "Public releases recorded",
      highlightsTitle: "What changed",
      relatedLinksTitle: "Keep exploring",
      backToHome: "Back home"
    },
    home: {
      eyebrow: "Recently shipped",
      title: "What changed on the site",
      description: "Only updates that are live and verifiable through the site or public repository appear here.",
      viewEntry: "Read this release note",
      viewAll: "View the full changelog"
    },
    kindLabels: {
      feature: "Feature",
      improvement: "Improvement",
      fix: "Fix"
    }
  }
};

export function getChangelogEntries(locale: Locale): ChangelogEntryView[] {
  return [...changelogEntries]
    .sort((left, right) => Date.parse(right.releasedAt) - Date.parse(left.releasedAt))
    .map((entry) => ({
      id: entry.id,
      releasedAt: entry.releasedAt,
      kind: entry.kind,
      title: entry.title[locale],
      summary: entry.summary[locale],
      highlights: entry.highlights[locale],
      links: entry.links.map((link) => ({
        href: link.href,
        label: link.label[locale]
      }))
    }));
}

export function getRecentChangelogEntries(locale: Locale, limit = 3) {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 3;
  return getChangelogEntries(locale).slice(0, safeLimit);
}

export function getChangelogCopy(locale: Locale) {
  return copyByLocale[locale];
}
