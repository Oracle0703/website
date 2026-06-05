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
        { href: "/projects", label: "作品" },
        { href: "/labs", label: "实验室" },
        { href: "/tracker", label: "打卡" },
        { href: "/about", label: "关于" },
        { href: "/contact", label: "联系" }
      ],
      enter: "进入",
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文"
    },
    theme: {
      light: "亮色",
      dark: "暗色",
      switchToLight: "切换到亮色",
      switchToDark: "切换到暗色"
    },
    notFound: {
      eyebrow: "404",
      title: "页面未找到",
      description: "你访问的页面可能已移动或不存在。试试从下面的入口继续浏览。",
      backHome: "返回首页"
    },
    footer: {
      copyright: "© 2026 开发者工作室",
      tagline: "开发者作品集 · 博客 · 实验室 · 打卡"
    },
    home: {
      heroTitle: "全栈开发者",
      heroSubtitle: "构建内容与体验的数字空间",
      heroIntro:
        "我把 AI 工具、内容系统、后台控制台和产品原型打磨成可展示、可维护、可继续产品化的个人网站系统。",
      ctaEnter: "查看作品",
      ctaBlog: "阅读博客",
      ctaProjects: "查看作品",
      heroEvidenceTitle: "当前证据链",
      heroEvidenceItems: [
        {
          label: "产品化方向",
          value: "AI 页面分析助手、打卡系统和 Dashboard Console 已沉淀成可浏览案例"
        },
        {
          label: "工程基线",
          value: "静态化、双语路由、SEO、内容校验和浏览器截图验收已接入发布流程"
        },
        {
          label: "下一步沟通",
          value: "先从作品、文章和 AI demo 对齐问题边界，再进入具体合作讨论"
        }
      ],
      primarySectionsLabel: "主要入口",
      primarySections: [
        { label: "作品", href: "/projects" },
        { label: "博客", href: "/blog" },
        { label: "实验室", href: "/labs" },
        { label: "联系", href: "/contact" }
      ],
      currentFocusTitle: "当前构建中",
      currentFocusDescription:
        "AI 页面分析助手正在从展示型 Demo 走向可用 MVP：先固化输入、诊断、建议和 backlog，再接入真实抓取与模型分析。",
      currentFocusMeta: "Prototype · AI Tool",
      currentFocusHref: "/ai-page-analysis",
      currentFocusAction: "查看当前原型",
      featuredProjectsTitle: "精选作品",
      featuredProjectsDescription: "用统一项目模型展示可复用的工程与产品能力。",
      featuredSeriesTitle: "推荐系列",
      featuredSeriesDescription: "按主题组织阅读路径，让文章形成长期资产。",
      latestFallbackTitle: "最新文章",
      labsTrackerTitle: "实验与系统",
      labsTrackerDescription: "Labs 承接小工具和原型，Tracker 承接产品规则与长期行为系统。",
      contactTitle: "合作与沟通",
      contactDescription:
        "适合讨论 AI 应用原型、个人网站工程化、后台控制台、内容系统与小产品落地。",
      contactAction: "联系沟通",
      latestBlog: "最新博客",
      viewAll: "查看全部",
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
        backToHome: "返回首页",
        arrowLeft: "←",
        arrowRight: "→"
      },
      blog: {
        eyebrow: "博客",
        title: "博客",
        description: "记录技术、产品与思考的内容专区。",
        listTitle: "最新文章",
        listDescription: "持续输出开发实践与思考笔记。",
        emptyTitle: "暂无文章",
        emptyDescription: "已发布的文章会在这里展示。",
        readMore: "阅读全文",
        tagsLabel: "标签",
        postNavigationTitle: "继续阅读",
        previousPost: "上一篇",
        nextPost: "下一篇",
        tagFilterLabel: "按标签浏览",
        allTags: "全部",
        filterActive: "当前筛选",
        relatedPostsTitle: "相关阅读",
        seriesTitle: "专题系列",
        seriesDescription: "按主题整理的连续阅读路径。",
        seriesCountSuffix: "篇文章",
        seriesFirstPost: "从第一篇开始",
        seriesNavigationTitle: "本系列文章",
        currentPost: "当前文章",
        articleCtaTitle: "继续探索",
        articleCtaDescription: "把这篇文章延伸到作品、更多内容或直接沟通。",
        articleEvidenceTitle: "从文章到项目证据",
        articleEvidenceDescription:
          "如果这篇文章里的方法与你的问题相关，可以继续查看作品案例，或带着具体页面、目标和约束进入沟通。",
        viewProjects: "查看作品",
        readMoreArticles: "阅读更多文章",
        contactMe: "联系沟通",
        tableOfContents: "目录",
        publishedAt: "发布于",
        updatedAt: "更新于",
        readingTime: "阅读时长",
        minute: "分钟",
        invalidContent: "内容不可用"
      },
      labs: {
        eyebrow: "实验室",
        title: "实验室",
        description: "可直接上手的交互工具与原型,持续扩充中。"
      },
      tracker: {
        eyebrow: "打卡平台",
        title: "打卡平台",
        description: "追踪习惯，沉淀成长数据。"
      },
      about: {
        eyebrow: "关于我",
        title: "关于我",
        description:
          "我关注从问题定义到可运行产品的完整链路：把想法拆成可验证的原型，再用工程质量把它们沉淀成长期资产。",
        sections: [
          {
            title: "工作背景",
            body:
              "主要做全栈开发、前端体验和产品原型，把 Next.js、TypeScript、Node.js、内容系统和轻量后端组合成可维护的作品。"
          },
          {
            title: "当前方向",
            body:
              "重点推进 AI 工具、个人网站工程化、Dashboard Console、内容资产管理和打卡类产品系统。"
          },
          {
            title: "交付方式",
            body:
              "先定义边界和验收标准，再用小步实现、自动化测试、文档记录和可回滚的迭代降低不确定性。"
          }
        ],
        principlesTitle: "工作原则",
        principles: [
          "用真实场景校验产品判断，不只做展示效果。",
          "优先保持数据、路由、SEO 和内容策略一致。",
          "让每个原型都有下一步演进路径，而不是停留在 Demo。"
        ],
        connectTitle: "建立联系",
        connectDescription: "想合作、交流或了解更多?直接查看作品，或发起一次具体的联系。",
        connectProjectsCta: "查看作品",
        connectContactCta: "联系我",
        connectLinksLabel: "在别处找到我"
      },
      contact: {
        eyebrow: "联系我",
        title: "联系我",
        description:
          "适合讨论边界清晰、可以快速验证的产品和工程合作。优先从目标、约束、交付物和时间线开始对齐。",
        collaborationTitle: "适合沟通",
        collaborationAreas: [
          "AI 应用原型和页面分析工具",
          "个人网站、内容系统和 SEO 基线",
          "后台控制台、数据看板和运营工具",
          "小产品从 0 到 1 的需求拆解与落地"
        ],
        boundariesTitle: "合作边界",
        boundaries: [
          "不承诺未验证的商业结果，先定义可衡量的阶段目标。",
          "不把自动生成内容直接当成最终表达，关键内容需要人工校准。",
          "不在范围不清时直接开工，先收敛问题和验收标准。"
        ],
        contactPathTitle: "联系路径",
        contactPathDescription:
          "下面的表单是主要的联系方式。填写前，可以先从公开作品或 AI 页面分析 Demo 判断合作方向，再带着目标、约束和期望交付物填写，信息越具体越容易判断是否进入后续沟通。",
        contactDecisionTitle: "怎样的请求最容易推进",
        contactDecisionStatus: "目标清晰、约束明确、有可衡量的阶段目标。",
        contactDecisionDescription:
          "请尽量写清当前状态、想解决的问题、期望的交付物与时间线；范围越具体，越能快速对齐是否合作以及如何开始。",
        formSpecTitle: "隐私与数据",
        formSpecAction:
          "表单内容只用于判断是否进入后续沟通，不会公开展示；保存的字段、留存期限与删除方式见表单下方说明。",
        contactChannels: [
          {
            label: "查看作品证据",
            description: "适合先判断工程能力、产品方向和可交付边界。",
            href: "/projects"
          },
          {
            label: "体验 AI 页面分析 Demo",
            description: "适合围绕页面诊断、改版 backlog 和 AI 应用原型对齐需求。",
            href: "/ai-page-analysis"
          },
          {
            label: "阅读文章背景",
            description: "适合了解工程流程、内容系统和长期维护方式。",
            href: "/blog"
          }
        ],
        responseExpectation:
          "发起沟通时请尽量带上项目目标、当前页面或产品链接、时间线、预算范围和你希望我负责的部分。",
        contactForm: {
          eyebrow: "项目 Intake",
          title: "Contact form",
          description:
            "用这份表单提交一个具体、可判断边界的项目请求。提交内容只用于判断是否进入后续沟通，不会公开展示。",
          requiredLabel: "必填",
          optionalLabel: "选填",
          requiredHint: "标 * 的为必填项。",
          fields: {
            name: {
              label: "姓名"
            },
            contact: {
              label: "回复渠道"
            },
            project_goal: {
              label: "项目目标",
              hint: "至少写清当前状态、希望改善的问题和你期待的交付结果。"
            },
            timeline: {
              label: "时间线"
            },
            budget_range: {
              label: "预算范围"
            },
            links: {
              label: "相关链接",
              hint: "最多 3 个公开 HTTP/HTTPS 链接，可换行或用逗号分隔。"
            }
          },
          privacyNotice: "Privacy: 表单保存姓名、回复渠道、项目目标、时间线、预算范围和公开链接，不保存原始 IP。",
          retentionNotice: "Retention: 默认保留 90 天；未进入合作的记录到期清理。",
          deletionNotice: "Deletion: 你可以通过已确认的回复渠道请求删除对应提交记录。",
          submitIdle: "发送请求",
          submitBusy: "发送中...",
          successTitle: "请求已收到。",
          submissionIdLabel: "提交编号",
          errors: {
            missing_required_field: "请补全姓名、回复渠道和项目目标。",
            invalid_contact: "请填写真实可回复的联系方式，不要使用占位地址。",
            low_quality_input: "Project goal 需要更多上下文，请补充当前状态、目标和期望交付物。",
            invalid_link: "相关链接最多 3 个，且必须是 HTTP 或 HTTPS 链接。",
            rate_limited: "提交过于频繁，请稍后再试。",
            duplicate_submit: "已经收到相似请求，请不要重复提交。",
            submit_failure: "提交失败，请稍后重试。你的输入会保留在表单中。",
            storage_failure: "请求暂时无法保存，请稍后重试。你的输入会保留在表单中。",
            notification_failure: "请求已保存，但通知发送失败，回复可能延迟。",
            received_with_notification_failure: "请求已收到，但通知发送失败，回复可能延迟。"
          }
        },
        primaryAction: "先看作品",
        secondaryAction: "阅读文章"
      },
      projects: {
        eyebrow: "作品",
        title: "作品",
        description: "把实验、内容和工程实践沉淀成可复用的项目案例。",
        featuredTitle: "精选作品",
        featuredDescription: "优先展示最能代表当前产品化方向和工程能力的项目。",
        allTitle: "全部项目",
        allDescription: "按状态和类型梳理当前网站生态中的项目资产。",
        otherTitle: "更多项目",
        otherDescription: "精选之外的其余项目资产。",
        onThisPage: "本页导航",
        emptyTitle: "暂无作品",
        emptyDescription: "完成首批项目整理后会在这里展示。",
        problemTitle: "问题",
        solutionTitle: "方案",
        roleTitle: "我的工作",
        stackTitle: "技术栈",
        highlightsTitle: "亮点",
        limitationsTitle: "当前限制",
        nextStepsTitle: "下一步",
        evidenceTitle: "证据",
        assetTitle: "资产状态",
        assetKindLabel: "资产类型",
        assetUnavailableLabel: "暂无公开资产",
        nextAssetStepLabel: "下一步资产计划",
        architectureTitle: "架构与实现",
        tradeoffsTitle: "取舍",
        roadmapTitle: "Roadmap",
        relatedEntryTitle: "相关入口",
        updatedAtLabel: "更新",
        linksTitle: "相关入口",
        viewDetail: "查看详情",
        backToProjects: "返回作品",
        statusLabel: "状态",
        typeLabel: "类型",
        backLinksTitle: "继续浏览",
        status: {
          concept: "概念",
          prototype: "原型",
          mvp: "MVP",
          live: "已上线"
        },
        type: {
          "ai-tool": "AI 工具",
          dashboard: "控制台",
          infra: "基础设施",
          "frontend-tool": "前端工具",
          "product-system": "产品系统"
        },
        assetKind: {
          screenshot: "真实截图",
          mock: "Product mock",
          diagram: "架构图",
          doc: "文档链接",
          none: "暂无公开资产"
        }
      }
    },
    seo: {
      siteName: "开发者工作室",
      defaultTitle: "开发者主页",
      defaultDescription: "展示 AI 工具、内容系统、后台控制台和产品原型的个人开发者网站。",
      homeTitle: "开发者主页",
      homeDescription: "展示 AI 工具、内容系统、后台控制台和产品原型的个人开发者网站。",
      enterTitle: "进入站点",
      enterDescription: "选择进入博客、实验室或打卡平台。",
      blogTitle: "博客",
      blogDescription: "记录技术、产品与思考的内容专区。",
      projectsTitle: "作品",
      projectsDescription: "展示 AI 工具、产品系统、控制台和基础设施项目案例。",
      labsTitle: "实验室",
      labsDescription: "交互实验与原型的集合。",
      trackerTitle: "打卡平台",
      trackerDescription: "追踪习惯，沉淀成长数据。",
      aboutTitle: "关于我",
      aboutDescription: "了解我如何构建 AI 工具、内容系统、后台控制台和产品原型。",
      contactTitle: "联系我",
      contactDescription: "围绕 AI 应用原型、个人网站工程化、内容系统和小产品落地发起沟通。",
      jsonLd: {
        siteDescription: "展示 AI 工具、内容系统、后台控制台和产品原型的个人开发者网站。",
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
        { href: "/projects", label: "Projects" },
        { href: "/labs", label: "Labs" },
        { href: "/tracker", label: "Tracker" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
      ],
      enter: "Enter",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode"
    },
    notFound: {
      eyebrow: "404",
      title: "Page not found",
      description: "The page you are looking for may have moved or never existed. Try one of the entries below.",
      backHome: "Back to home"
    },
    footer: {
      copyright: "© 2026 Developer Studio",
      tagline: "Developer Portfolio · Blog · Labs · Tracker"
    },
    home: {
      heroTitle: "Full-Stack Developer",
      heroSubtitle: "Building content-driven experiences",
      heroIntro:
        "I turn AI tools, content systems, dashboards, and product prototypes into a maintainable personal product system.",
      ctaEnter: "View projects",
      ctaBlog: "Read the Blog",
      ctaProjects: "View projects",
      heroEvidenceTitle: "Current proof chain",
      heroEvidenceItems: [
        {
          label: "Product direction",
          value: "AI page analysis, Tracker, and Dashboard Console are shaped into browsable cases"
        },
        {
          label: "Engineering baseline",
          value: "Static rendering, bilingual routing, SEO, content validation, and browser screenshots are part of release checks"
        },
        {
          label: "Next conversation",
          value: "Use projects, writing, and the AI demo to align scope before discussing delivery"
        }
      ],
      primarySectionsLabel: "Primary sections",
      primarySections: [
        { label: "Projects", href: "/projects" },
        { label: "Blog", href: "/blog" },
        { label: "Labs", href: "/labs" },
        { label: "Contact", href: "/contact" }
      ],
      currentFocusTitle: "Currently building",
      currentFocusDescription:
        "The AI page analysis assistant is moving from a demo into an MVP: inputs, diagnosis, recommendations, and backlog first, then real crawling and model analysis.",
      currentFocusMeta: "Prototype · AI Tool",
      currentFocusHref: "/ai-page-analysis",
      currentFocusAction: "View current prototype",
      featuredProjectsTitle: "Featured projects",
      featuredProjectsDescription: "A structured set of projects showing reusable product and engineering capability.",
      featuredSeriesTitle: "Recommended series",
      featuredSeriesDescription: "Themed reading paths that make writing work as a long-term asset.",
      latestFallbackTitle: "Latest posts",
      labsTrackerTitle: "Labs and systems",
      labsTrackerDescription: "Labs hosts tools and prototypes; Tracker hosts product rules and long-term behavior systems.",
      contactTitle: "Work together",
      contactDescription:
        "Useful for AI app prototypes, personal-site engineering, dashboards, content systems, and small product delivery.",
      contactAction: "Contact",
      latestBlog: "Latest Posts",
      viewAll: "View all",
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
        backToHome: "Back home",
        arrowLeft: "←",
        arrowRight: "→"
      },
      blog: {
        eyebrow: "Blog",
        title: "Blog",
        description: "Writing about engineering, products, and ideas.",
        listTitle: "Latest posts",
        listDescription: "Notes and stories on building products.",
        emptyTitle: "No posts yet",
        emptyDescription: "Published posts will appear here.",
        readMore: "Read more",
        tagsLabel: "Tags",
        postNavigationTitle: "Continue reading",
        previousPost: "Previous post",
        nextPost: "Next post",
        tagFilterLabel: "Browse by tag",
        allTags: "All",
        filterActive: "Active filter",
        relatedPostsTitle: "Related posts",
        seriesTitle: "Series",
        seriesDescription: "Reading paths organized by theme.",
        seriesCountSuffix: "posts",
        seriesFirstPost: "Start with the first post",
        seriesNavigationTitle: "In this series",
        currentPost: "Current post",
        articleCtaTitle: "Keep exploring",
        articleCtaDescription: "Connect this article to projects, more writing, or a direct conversation.",
        articleEvidenceTitle: "From article to project proof",
        articleEvidenceDescription:
          "If the method in this article maps to your problem, continue into project cases or bring a specific page, goal, and constraint set into a conversation.",
        viewProjects: "View projects",
        readMoreArticles: "Read more articles",
        contactMe: "Contact",
        tableOfContents: "Table of contents",
        publishedAt: "Published",
        updatedAt: "Updated",
        readingTime: "Reading time",
        minute: "min",
        invalidContent: "Content unavailable"
      },
      labs: {
        eyebrow: "Labs",
        title: "Labs",
        description: "Hands-on interactive tools and prototypes, with more on the way."
      },
      tracker: {
        eyebrow: "Tracker",
        title: "Tracker",
        description: "Track habits and learning progress."
      },
      about: {
        eyebrow: "About",
        title: "About",
        description:
          "I work across the path from product questions to running software: shape the problem, build a testable prototype, then harden the system so it can keep evolving.",
        sections: [
          {
            title: "Background",
            body:
              "My work sits between full-stack development, frontend experience, and product prototyping with Next.js, TypeScript, Node.js, content workflows, and lightweight backend systems."
          },
          {
            title: "Current focus",
            body:
              "The site is centered on AI tools, personal-site engineering, dashboard consoles, content systems, and habit-oriented product systems."
          },
          {
            title: "How I work",
            body:
              "I start with scope and acceptance criteria, then use small iterations, tests, documentation, and reversible changes to reduce delivery risk."
          }
        ],
        principlesTitle: "Working principles",
        principles: [
          "Validate product decisions against real usage, not only visual polish.",
          "Keep routing, data, SEO, and content policy aligned.",
          "Give every prototype a clear path beyond the demo stage."
        ],
        connectTitle: "Get in touch",
        connectDescription:
          "Want to collaborate, compare notes, or learn more? Browse the work or start a focused conversation.",
        connectProjectsCta: "View work",
        connectContactCta: "Contact me",
        connectLinksLabel: "Find me elsewhere"
      },
      contact: {
        eyebrow: "Contact",
        title: "Contact",
        description:
          "Reach out for focused product and engineering work where the goal, constraints, deliverables, and timeline can be made explicit.",
        collaborationTitle: "Good fit",
        collaborationAreas: [
          "AI app prototypes and page analysis tools",
          "Personal-site engineering, content systems, and SEO baselines",
          "Dashboard consoles, data views, and operations tools",
          "Small product delivery from idea to working release"
        ],
        boundariesTitle: "Boundaries",
        boundaries: [
          "I do not promise unvalidated business outcomes; we define measurable milestones first.",
          "I do not treat generated content as final copy without human review.",
          "I do not start from vague scope; we narrow the problem and acceptance criteria first."
        ],
        contactPathTitle: "Contact path",
        contactPathDescription:
          "The form below is the main way to reach me. Before filling it in, you can size up fit from the public projects or the AI page analysis demo, then include the goal, constraints, and expected deliverables — the more specific, the easier it is to judge next steps.",
        contactDecisionTitle: "What moves fastest",
        contactDecisionStatus: "A clear goal, explicit constraints, and a measurable first milestone.",
        contactDecisionDescription:
          "Spell out the current state, the problem to solve, the deliverables you expect, and a timeline. The more concrete the scope, the faster we can align on whether and how to start.",
        formSpecTitle: "Privacy & data",
        formSpecAction:
          "Submissions are only used to decide on follow-up and are never published. The stored fields, retention window, and deletion path are described under the form.",
        contactChannels: [
          {
            label: "Review project evidence",
            description: "Best for checking engineering capability, product direction, and delivery boundaries.",
            href: "/projects"
          },
          {
            label: "Try the AI page analysis demo",
            description: "Best for page diagnosis, redesign backlog, and AI prototype conversations.",
            href: "/ai-page-analysis"
          },
          {
            label: "Read the writing",
            description: "Best for understanding process, content systems, and long-term maintenance.",
            href: "/blog"
          }
        ],
        responseExpectation:
          "When reaching out, include the project goal, current page or product link, timeline, budget range, and the part you want me to own.",
        contactForm: {
          eyebrow: "Project intake",
          title: "Contact form",
          description:
            "Send a focused project request with enough context to judge scope, fit, and next steps. The submission is only used for follow-up decisions and is not published.",
          requiredLabel: "Required",
          optionalLabel: "Optional",
          requiredHint: "Fields marked * are required.",
          fields: {
            name: {
              label: "Name"
            },
            contact: {
              label: "Reply channel"
            },
            project_goal: {
              label: "Project goal",
              hint: "Include the current state, the problem to improve, and the outcome you expect."
            },
            timeline: {
              label: "Timeline"
            },
            budget_range: {
              label: "Budget range"
            },
            links: {
              label: "Related links",
              hint: "Up to 3 public HTTP or HTTPS links, separated by new lines or commas."
            }
          },
          privacyNotice: "Privacy: the form stores name, reply channel, project goal, timeline, budget range, and public links. Raw IP addresses are not stored.",
          retentionNotice: "Retention: submissions are kept for 90 days by default; records that do not move forward are cleaned up after that window.",
          deletionNotice: "Deletion: you can request deletion through the confirmed reply channel for that submission.",
          submitIdle: "Send request",
          submitBusy: "Sending...",
          successTitle: "Request received.",
          submissionIdLabel: "Submission ID",
          errors: {
            missing_required_field: "Add your name, reply channel, and project goal.",
            invalid_contact: "Use a real reply channel instead of a placeholder address.",
            low_quality_input: "Add more context to the Project goal: current state, target outcome, and expected deliverables.",
            invalid_link: "Related links must use HTTP or HTTPS and include no more than 3 URLs.",
            rate_limited: "Too many attempts. Please retry later.",
            duplicate_submit: "A similar request has already been received.",
            submit_failure: "Submission failed. Your input is still here so you can retry.",
            storage_failure: "The request could not be saved. Your input is still here so you can retry.",
            notification_failure: "The request was saved, but notification delivery failed. Follow-up may take longer.",
            received_with_notification_failure: "The request was received, but notification delivery failed. Follow-up may take longer."
          }
        },
        primaryAction: "View projects",
        secondaryAction: "Read writing"
      },
      projects: {
        eyebrow: "Projects",
        title: "Projects",
        description: "Project cases distilled from experiments, writing, and engineering work.",
        featuredTitle: "Featured projects",
        featuredDescription: "The projects that best represent the current product and engineering direction.",
        allTitle: "All projects",
        allDescription: "A structured view of the project assets across this website ecosystem.",
        otherTitle: "More projects",
        otherDescription: "The rest of the project assets beyond the featured set.",
        onThisPage: "On this page",
        emptyTitle: "No projects yet",
        emptyDescription: "The first project set will appear here once it is curated.",
        problemTitle: "Problem",
        solutionTitle: "Solution",
        roleTitle: "My role",
        stackTitle: "Stack",
        highlightsTitle: "Highlights",
        limitationsTitle: "Current limitations",
        nextStepsTitle: "Next steps",
        evidenceTitle: "Evidence",
        assetTitle: "Asset status",
        assetKindLabel: "Asset type",
        assetUnavailableLabel: "Asset unavailable",
        nextAssetStepLabel: "Next asset step",
        architectureTitle: "Architecture",
        tradeoffsTitle: "Trade-offs",
        roadmapTitle: "Roadmap",
        relatedEntryTitle: "Related entry",
        updatedAtLabel: "Updated",
        linksTitle: "Related links",
        viewDetail: "View details",
        backToProjects: "Back to projects",
        statusLabel: "Status",
        typeLabel: "Type",
        backLinksTitle: "Keep exploring",
        status: {
          concept: "Concept",
          prototype: "Prototype",
          mvp: "MVP",
          live: "Live"
        },
        type: {
          "ai-tool": "AI Tool",
          dashboard: "Dashboard",
          infra: "Infra",
          "frontend-tool": "Frontend Tool",
          "product-system": "Product System"
        },
        assetKind: {
          screenshot: "Screenshot",
          mock: "Product mock",
          diagram: "Architecture diagram",
          doc: "Documentation",
          none: "Asset unavailable"
        }
      }
    },
    seo: {
      siteName: "Developer Studio",
      defaultTitle: "Developer Portfolio",
      defaultDescription: "A personal developer site for AI tools, content systems, dashboards, and product prototypes.",
      homeTitle: "Developer Portfolio",
      homeDescription: "A personal developer site for AI tools, content systems, dashboards, and product prototypes.",
      enterTitle: "Enter",
      enterDescription: "Choose to enter the blog, labs, or tracker.",
      blogTitle: "Blog",
      blogDescription: "Writing about engineering, products, and ideas.",
      projectsTitle: "Projects",
      projectsDescription: "Project cases across AI tools, product systems, dashboards, and infrastructure.",
      labsTitle: "Labs",
      labsDescription: "Experiments and prototypes in progress.",
      trackerTitle: "Tracker",
      trackerDescription: "Track habits and learning progress.",
      aboutTitle: "About",
      aboutDescription: "How I build AI tools, content systems, dashboards, and product prototypes.",
      contactTitle: "Contact",
      contactDescription: "Start a focused conversation about AI prototypes, site engineering, content systems, or small product delivery.",
      jsonLd: {
        siteDescription: "A personal developer site for AI tools, content systems, dashboards, and product prototypes.",
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
