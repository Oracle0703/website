export type Locale = "zh" | "en";

export const locales = ["zh", "en"] as const;
export const defaultLocale: Locale = "zh";
export const LOCALE_COOKIE = "locale";

export const messages = {
  zh: {
    nav: {
      brand: "开发者工作室",
      items: [
        { href: "/", label: "首页" },
        { href: "/blog", label: "博客" },
        { href: "/labs", label: "实验室" },
        { href: "/tracker", label: "打卡" },
        { href: "/about", label: "关于" },
        { href: "/contact", label: "联系" }
      ],
      enter: "进入",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文"
    },
    theme: {
      light: "亮色",
      dark: "暗色",
      switchToLight: "切换到亮色",
      switchToDark: "切换到暗色"
    },
    footer: {
      copyright: "© 2026 开发者工作室",
      tagline: "开发者作品集 · 博客 · 实验室 · 打卡"
    },
    home: {
      heroTitle: "全栈开发者",
      heroSubtitle: "构建内容与体验的数字空间",
      heroIntro:
        "连接博客、实验室与打卡平台，打造持续输出的开发者作品集。",
      ctaEnter: "进入站点",
      ctaBlog: "阅读博客",
      primarySectionsLabel: "主要入口",
      primarySections: [
        { label: "博客", href: "/blog" },
        { label: "实验室", href: "/labs" },
        { label: "打卡平台", href: "/tracker" }
      ],
      entryCards: [
        {
          title: "博客",
          subtitle: "阅读技术与思考",
          href: "/blog"
        },
        {
          title: "实验室",
          subtitle: "探索实验与原型",
          href: "/labs"
        },
        {
          title: "打卡",
          subtitle: "习惯与进度管理",
          href: "/tracker"
        }
      ],
      latestBlog: "最新博客",
      viewAll: "查看全部",
      labsTitle: "实验室精选",
      trackerTitle: "打卡平台预览",
      trackerDesc: "用轻量的打卡系统追踪习惯与成长，兼顾数据与体验。",
      trackerEnter: "进入打卡平台",
      aboutTitle: "关于我",
      aboutDesc:
        "专注全栈开发与产品体验，喜欢把想法快速落地为可用的产品原型。",
      blogItems: [
        {
          title: "用 Next.js 搭建个人网站",
          subtitle: "使用 Next.js 搭建个人站点",
          date: "2026-01-22"
        },
        {
          title: "从设计到开发的流程",
          subtitle: "让想法更快落地",
          date: "2026-01-18"
        },
        {
          title: "内容驱动的产品思路",
          subtitle: "用叙事驱动产品决策",
          date: "2026-01-12"
        }
      ],
      labItems: [
        {
          title: "交互数据可视化",
          subtitle: "探索数据与交互的关系"
        },
        {
          title: "3D 网页实验",
          subtitle: "浏览器里的三维体验"
        },
        {
          title: "体验动效原型",
          subtitle: "动效驱动的交互研究"
        }
      ],
      trackerPoints: [
        "自定义习惯与目标",
        "每日打卡记录",
        "连续天数统计",
        "进度趋势可视化"
      ],
      skillTags: [
        "Next.js",
        "TypeScript",
        "Tailwind",
        "Node.js",
        "PostgreSQL",
        "Motion",
        "Design Systems",
        "Cloud"
      ]
    },
    enter: {
      heading: "进入站点",
      prompt: "选择你的入口",
      back: "返回首页",
      hint: "支持键盘导航，减少动效可在系统设置中启用。",
      enterAction: "进入",
      entries: [
        {
          id: "blog",
          title: "博客",
          subtitle: "阅读与思考",
          href: "/blog"
        },
        {
          id: "labs",
          title: "实验室",
          subtitle: "实验与原型",
          href: "/labs"
        },
        {
          id: "tracker",
          title: "打卡",
          subtitle: "习惯与进度",
          href: "/tracker"
        }
      ]
    },
    pages: {
      common: {
        backToEnter: "← 返回入口",
        backToHome: "返回首页"
      },
      blog: {
        eyebrow: "博客",
        title: "博客",
        description: "记录技术、产品与思考的内容专区。"
      },
      labs: {
        eyebrow: "实验室",
        title: "实验室",
        description: "交互实验与原型的集合。"
      },
      tracker: {
        eyebrow: "打卡平台",
        title: "打卡平台",
        description: "追踪习惯，沉淀成长数据。"
      },
      about: {
        eyebrow: "关于我",
        title: "关于我",
        description: "一些关于背景、经验与价值观的说明。"
      },
      contact: {
        eyebrow: "联系我",
        title: "联系我",
        description: "欢迎通过邮箱或社交媒体联系。"
      }
    },
    seo: {
      siteName: "开发者工作室",
      defaultTitle: "开发者主页",
      defaultDescription: "展示博客、实验室与打卡平台的个人开发者网站。",
      homeTitle: "开发者主页",
      homeDescription: "展示博客、实验室与打卡平台的个人开发者网站。",
      enterTitle: "进入站点",
      enterDescription: "选择进入博客、实验室或打卡平台。",
      blogTitle: "博客",
      blogDescription: "记录技术、产品与思考的内容专区。",
      labsTitle: "实验室",
      labsDescription: "交互实验与原型的集合。",
      trackerTitle: "打卡平台",
      trackerDescription: "追踪习惯，沉淀成长数据。",
      aboutTitle: "关于我",
      aboutDescription: "一些关于背景、经验与价值观的说明。",
      contactTitle: "联系我",
      contactDescription: "欢迎通过邮箱或社交媒体联系。",
      jsonLd: {
        siteDescription: "展示博客、实验室与打卡平台的个人开发者网站。",
        jobTitle: "全栈开发者"
      }
    }
  },
  en: {
    nav: {
      brand: "Developer Studio",
      items: [
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog" },
        { href: "/labs", label: "Labs" },
        { href: "/tracker", label: "Tracker" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
      ],
      enter: "Enter",
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode"
    },
    footer: {
      copyright: "© 2026 Developer Studio",
      tagline: "Developer Portfolio · Blog · Labs · Tracker"
    },
    home: {
      heroTitle: "Full-Stack Developer",
      heroSubtitle: "Building content-driven experiences",
      heroIntro:
        "Connecting the blog, labs, and tracker to ship a portfolio that evolves with learning.",
      ctaEnter: "Enter Site",
      ctaBlog: "Read the Blog",
      primarySectionsLabel: "Primary sections",
      primarySections: [
        { label: "Blog", href: "/blog" },
        { label: "Labs", href: "/labs" },
        { label: "Tracker", href: "/tracker" }
      ],
      entryCards: [
        {
          title: "Blog",
          subtitle: "Read my writing",
          href: "/blog"
        },
        {
          title: "Labs",
          subtitle: "Explore experiments",
          href: "/labs"
        },
        {
          title: "Tracker",
          subtitle: "Track learning",
          href: "/tracker"
        }
      ],
      latestBlog: "Latest Posts",
      viewAll: "View all",
      labsTitle: "Featured Labs",
      trackerTitle: "Tracker Preview",
      trackerDesc:
        "Track habits and growth with a lightweight system that balances data and experience.",
      trackerEnter: "Go to Tracker",
      aboutTitle: "About",
      aboutDesc:
        "Focused on full-stack development and product experience, turning ideas into working prototypes.",
      blogItems: [
        {
          title: "Building a personal site with Next.js",
          subtitle: "From setup to deployment",
          date: "2026-01-22"
        },
        {
          title: "From design to development",
          subtitle: "Moving ideas into production",
          date: "2026-01-18"
        },
        {
          title: "Content-driven product thinking",
          subtitle: "Using narrative to shape product decisions",
          date: "2026-01-12"
        }
      ],
      labItems: [
        {
          title: "Interactive data visualization",
          subtitle: "Exploring data and interaction"
        },
        {
          title: "3D web experiments",
          subtitle: "Spatial experiences in the browser"
        },
        {
          title: "Motion-driven prototypes",
          subtitle: "Studying motion-first interactions"
        }
      ],
      trackerPoints: [
        "Define habits and goals",
        "Daily check-ins",
        "Streak tracking",
        "Progress visualization"
      ],
      skillTags: [
        "Next.js",
        "TypeScript",
        "Tailwind",
        "Node.js",
        "PostgreSQL",
        "Motion",
        "Design Systems",
        "Cloud"
      ]
    },
    enter: {
      heading: "Enter",
      prompt: "Choose your path",
      back: "Back to home",
      hint: "Keyboard navigation is supported; reduce motion can be enabled in system settings.",
      enterAction: "Enter",
      entries: [
        {
          id: "blog",
          title: "Blog",
          subtitle: "Read & Reflect",
          href: "/blog"
        },
        {
          id: "labs",
          title: "Labs",
          subtitle: "Experiments & Prototypes",
          href: "/labs"
        },
        {
          id: "tracker",
          title: "Tracker",
          subtitle: "Habits & Progress",
          href: "/tracker"
        }
      ]
    },
    pages: {
      common: {
        backToEnter: "← Back to Enter",
        backToHome: "Back home"
      },
      blog: {
        eyebrow: "Blog",
        title: "Blog",
        description: "Writing about engineering, products, and ideas."
      },
      labs: {
        eyebrow: "Labs",
        title: "Labs",
        description: "Experiments and prototypes in progress."
      },
      tracker: {
        eyebrow: "Tracker",
        title: "Tracker",
        description: "Track habits and learning progress."
      },
      about: {
        eyebrow: "About",
        title: "About",
        description: "Background, experience, and values."
      },
      contact: {
        eyebrow: "Contact",
        title: "Contact",
        description: "Reach out via email or social links."
      }
    },
    seo: {
      siteName: "Developer Studio",
      defaultTitle: "Developer Portfolio",
      defaultDescription: "Showcasing blog, labs, and tracker for a personal developer site.",
      homeTitle: "Developer Portfolio",
      homeDescription: "Showcasing blog, labs, and tracker for a personal developer site.",
      enterTitle: "Enter",
      enterDescription: "Choose to enter the blog, labs, or tracker.",
      blogTitle: "Blog",
      blogDescription: "Writing about engineering, products, and ideas.",
      labsTitle: "Labs",
      labsDescription: "Experiments and prototypes in progress.",
      trackerTitle: "Tracker",
      trackerDescription: "Track habits and learning progress.",
      aboutTitle: "About",
      aboutDescription: "Background, experience, and values.",
      contactTitle: "Contact",
      contactDescription: "Reach out via email or social links.",
      jsonLd: {
        siteDescription: "Showcasing blog, labs, and tracker for a personal developer site.",
        jobTitle: "Full-Stack Developer"
      }
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];

export const isLocale = (value?: string): value is Locale =>
  value === "zh" || value === "en";

export const getLocaleFromCookieValue = (value?: string): Locale =>
  isLocale(value) ? value : defaultLocale;

export const getMessages = (locale: Locale): Messages => messages[locale];

export const getHtmlLang = (locale: Locale) => (locale === "en" ? "en" : "zh-CN");
