import type { Locale } from "./i18n-core";
import { shellMessages } from "./i18n-shell";
import { siteIdentity } from "./site-identity";

export {
  defaultLocale,
  getHtmlLang,
  getLocaleFromCookieValue,
  isLocale,
  locales,
  LOCALE_COOKIE,
  type Locale
} from "./i18n-core";

export const messages = {
  zh: {
    ...shellMessages.zh,
    home: {
      heroEyebrow: `${siteIdentity.personName} · ${siteIdentity.byLocale.zh.role}`,
      heroTitle: "把复杂想法，做成清晰、可用的产品。",
      heroSubtitle: siteIdentity.byLocale.zh.positioning,
      heroIntro:
        "从问题定义、交互原型到上线验证，我使用 Next.js、TypeScript 与 Node.js，让产品判断和工程实现彼此支撑。",
      ctaEnter: "查看作品",
      ctaBlog: "阅读博客",
      ctaProjects: "查看旗舰案例",
      ctaContact: "发起项目沟通",
      heroProof: {
        title: "可验证的站点证据",
        projectsLabel: "公开项目案例",
        projectsUnit: "个案例",
        demosLabel: "可运行入口",
        demosUnit: "个 Demo",
        deliveryLabel: "交付基线",
        deliveryValue: "双语静态页面 · 内容校验 · 浏览器验收"
      },
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
      currentFocusTitle: "正在打磨的产品",
      currentFocusDescription:
        "AI 页面分析助手正在从展示型 Demo 走向可用 MVP：先固化输入、诊断、建议和 backlog，再接入真实抓取与模型分析。",
      currentFocusMeta: "Prototype · AI Tool",
      currentFocusHref: "/ai-page-analysis",
      currentFocusAction: "查看案例证据",
      featuredProjectsTitle: "精选作品",
      featuredProjectsDescription: "从产品判断到工程落地，选择几件正在持续演进的作品。",
      featuredSeriesTitle: "推荐系列",
      featuredSeriesDescription: "按主题组织阅读路径，让文章形成长期资产。",
      latestFallbackTitle: "最新文章",
      labsTrackerTitle: "实验与系统",
      labsTrackerDescription: "Labs 承接小工具和原型，Tracker 承接产品规则与长期行为系统。",
      contactEyebrow: "现在 / 合作",
      contactTitle: "有一个值得推进的想法？",
      contactDescription:
        "欢迎聊聊 AI 应用原型、个人网站工程化、后台控制台、内容系统与小产品落地。",
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
        topicLabel: "主题",
        postNavigationTitle: "继续阅读",
        previousPost: "上一篇",
        nextPost: "下一篇",
        topicFilterLabel: "按主题浏览",
        allTopics: "全部主题",
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
        description: "交互实验与原型的集合。",
        queryEyebrow: "新增工具",
        queryTitle: "免费查询中心",
        queryDescription:
          "从城市搜索开始，查询当前天气、未来 3 天预报与空气质量。密钥只保留在服务器端。",
        queryAction: "打开查询中心",
        toolsEyebrow: "浏览器本地",
        toolsTitle: "开发者工具箱",
        toolsDescription:
          "格式化 JSON、转换 URL/Base64、生成 UUID、计算 SHA-256 并检查颜色对比度；输入不会发送到服务器。",
        toolsAction: "打开工具箱"
      },
      freeQuery: {
        eyebrow: "Free Query Lab",
        title: "免费查询中心",
        description:
          "输入城市并选择准确地点，在一个界面查看当前天气、未来 3 天预报与空气质量。",
        backToLabs: "返回实验室",
        searchEyebrow: "城市查询",
        searchTitle: "先找到准确地点",
        searchDescription:
          "搜索结果会保留地区与国家信息，避免同名城市被误选。选择地点后才会请求天气数据。",
        inputLabel: "城市名称",
        inputPlaceholder: "例如：北京、Shanghai 或 London",
        submit: "搜索城市",
        searching: "正在搜索城市…",
        loadingWeather: "正在获取天气与空气质量…",
        unitLabel: "温度与风速单位",
        metric: "公制 °C",
        imperial: "英制 °F",
        popularTitle: "热门城市",
        popularCities: [
          { label: "北京", query: "Beijing" },
          { label: "上海", query: "Shanghai" },
          { label: "深圳", query: "Shenzhen" },
          { label: "成都", query: "Chengdu" },
          { label: "东京", query: "Tokyo" }
        ],
        locationTitle: "选择地点",
        locationDescription: "请选择与地区、国家匹配的结果。",
        locationResultsStatus: "找到 {count} 个地点候选。",
        chooseLocation: "查看这个地点",
        emptyTitle: "没有找到匹配城市",
        emptyDescription: "请尝试城市全名、拼音或补充省份与国家。",
        errorTitle: "暂时无法完成查询",
        errorDescription: "请稍后重试；已经输入的城市会保留。",
        notConfiguredTitle: "查询服务尚未配置",
        notConfiguredDescription:
          "页面界面已经就绪，服务器管理员配置 WeatherAPI.com 密钥后即可开始查询。",
        retry: "重试",
        resultEyebrow: "查询结果",
        localTime: "当地时间",
        updatedAt: "更新时间",
        staleNotice: "缓存旧数据",
        temperature: "当前温度",
        feelsLike: "体感",
        humidity: "湿度",
        wind: "风速",
        forecastEyebrow: "天气预报",
        forecastTitle: "未来 3 天",
        maxTemperature: "最高",
        minTemperature: "最低",
        rainChance: "降雨概率",
        airQualityEyebrow: "空气质量",
        airQualityTitle: "空气质量",
        aqi: "美国 EPA 类别（1–6）",
        aqiLevels: ["良好", "中等", "对敏感人群不健康", "不健康", "非常不健康", "危险"],
        pm25: "PM2.5",
        pm10: "PM10",
        unavailable: "暂无数据",
        fairUseTitle: "公平使用与接口边界",
        fairUseDescription:
          "浏览器只访问本站同源接口；服务端密钥不会下发，也不提供跨域公共代理或批量调用能力。",
        privacyNotice:
          "搜索的城市与所选坐标会由本站服务端转发给 WeatherAPI.com；本站不使用浏览器定位，也不为查询设置 Cookie。",
        apiEyebrow: "同源 API",
        apiTitle: "可阅读的查询接口",
        apiDescription:
          "接口采用稳定的 ok / data / error / meta 响应信封，供本站前端在公平使用范围内调用。",
        locationsEndpoint: "城市候选查询",
        weatherEndpoint: "天气与空气质量查询",
        apiBoundary:
          "接口不开放 CORS，不展示上游密钥，也不承诺作为第三方应用的公共 API。",
        attributionPrefix: "Powered by",
        disclaimerTitle: "重要数据提示",
        disclaimer:
          "天气、预报与空气质量仅供一般信息用途。天气与预报具有概率性，对具体地点或时间可能不准确或不适用；不得作为人身安全、航空、海事航行、应急规划等安全关键决策的唯一依据。涉及关键决策，请查阅官方气象服务与主管部门信息。空气质量数据不构成医疗建议。"
      },
      tracker: {
        eyebrow: "打卡平台",
        title: "打卡平台",
        description: "追踪习惯，沉淀成长数据。"
      },
      about: {
        eyebrow: `${siteIdentity.personName} · 关于`,
        title: `关于 ${siteIdentity.personName}`,
        description:
          `我是 ${siteIdentity.personName}。${siteIdentity.brandName} 是我记录公开作品与工程实践的个人站点：把想法拆成可验证的原型，再把它们沉淀成可维护的长期资产。`,
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
        ]
      },
      contact: {
        eyebrow: `${siteIdentity.personName} · 联系`,
        title: `与 ${siteIdentity.personName} 沟通`,
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
        contactPathEyebrow: "开始沟通",
        contactPathTitle: "选择适合你的联系路径",
        contactPathDescription:
          "你可以填写下方表单，说明项目目标、当前链接、约束和期望交付物。提交前也可以先查看作品、体验 Demo 或阅读文章；如果表单暂时不可用，可通过 GitHub 查看公开项目与可用联系信息。",
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
          },
          {
            label: "GitHub 主页",
            description: "表单暂时不可用时，可查看公开仓库与个人资料中的可用联系信息。",
            href: siteIdentity.githubUrl
          }
        ],
        responseExpectation:
          "发起沟通时请尽量带上项目目标、当前页面或产品链接、时间线、预算范围和你希望我负责的部分。",
        contactForm: {
          eyebrow: "项目需求",
          title: "提交合作需求",
          description:
            "请提供足够的项目上下文，便于了解范围、适配度和下一步。提交内容仅用于项目沟通，不会公开展示。",
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
          successTitle: "请求已保存。",
          submissionIdLabel: "提交编号",
          notificationDelivered: "配置的通知通道已确认接收自动通知。",
          notificationSkipped: "自动通知通道尚未配置；这不会影响已经保存的提交。",
          notificationFailed: "自动通知发送失败；这不会影响已经保存的提交。",
          savedGuidance: "请保留提交编号。如需补充信息或改用公开渠道，可以前往 GitHub。",
          githubFallbackAction: "打开 GitHub 备用路径",
          submitAnotherAction: "提交另一条需求",
          errors: {
            missing_required_field: "请补全姓名、回复渠道和项目目标。",
            invalid_contact: "请填写真实可回复的联系方式，不要使用占位地址。",
            low_quality_input: "Project goal 需要更多上下文，请补充当前状态、目标和期望交付物。",
            invalid_link: "相关链接最多 3 个，且必须是 HTTP 或 HTTPS 链接。",
            rate_limited: "提交过于频繁，请稍后再试。",
            duplicate_submit: "已经收到相似请求，请不要重复提交。",
            submit_failure: "提交失败，请稍后重试。你的输入会保留在表单中。",
            storage_failure: "请求暂时无法保存，请稍后重试。你的输入会保留在表单中。",
            notification_failure: "请求已保存，但自动通知发送失败。",
            received_with_notification_failure: "请求已保存，但自动通知发送失败。"
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
        evidenceGalleryTitle: "证据画廊",
        evidenceGalleryDescription: "只展示仓库中可验证的 product mock、公开文档或明确的暂无公开图说明。",
        assetTitle: "资产状态",
        assetKindLabel: "资产类型",
        assetUnavailableLabel: "暂无公开资产",
        nextAssetStepLabel: "下一步资产计划",
        openFullSizeDiagram: "查看原尺寸架构图",
        architectureTitle: "架构与实现",
        architectureStepLabel: "步骤",
        decisionsTitle: "关键决策与影响",
        decisionLabel: "决策",
        rationaleLabel: "为什么这样做",
        impactLabel: "带来的影响",
        tradeoffsTitle: "取舍",
        roadmapTitle: "Roadmap",
        entryEyebrow: "可验证入口",
        entryTitle: "体验与源码",
        demoAvailableLabel: "公开 Demo",
        demoUnavailableLabel: "不提供公开 Demo",
        sourceEntryLabel: "源码证据",
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
      siteName: siteIdentity.brandName,
      defaultTitle: "AI 工程与产品体验",
      defaultDescription: "专注 AI 工程与产品体验，用 Next.js、TypeScript 与 Node.js 构建可运行、可验证的产品原型。",
      homeTitle: "AI 工程与产品体验",
      homeDescription: "专注 AI 工程与产品体验，用 Next.js、TypeScript 与 Node.js 构建可运行、可验证的产品原型。",
      enterTitle: "进入站点",
      enterDescription: "选择进入博客、实验室或打卡平台。",
      blogTitle: "博客",
      blogDescription: "记录技术、产品与思考的内容专区。",
      projectsTitle: "作品",
      projectsDescription: "展示 AI 工具、产品系统、控制台和基础设施项目案例。",
      labsTitle: "实验室",
      labsDescription: "交互实验与原型的集合。",
      freeQueryTitle: "免费查询中心",
      freeQueryDescription: "按城市查询当前天气、未来 3 天预报与空气质量。",
      trackerTitle: "打卡平台",
      trackerDescription: "追踪习惯，沉淀成长数据。",
      aboutTitle: `关于 ${siteIdentity.personName}`,
      aboutDescription: `了解 ${siteIdentity.personName} 如何构建 AI 工具、内容系统、后台控制台和产品原型。`,
      contactTitle: `联系 ${siteIdentity.personName}`,
      contactDescription: "围绕 AI 应用原型、个人网站工程化、内容系统和小产品落地发起沟通。",
      jsonLd: {
        siteDescription: "展示 AI 工具、内容系统、后台控制台和产品原型的个人开发者网站。"
      }
    }
  },
  en: {
    ...shellMessages.en,
    home: {
      heroEyebrow: `${siteIdentity.personName} · ${siteIdentity.byLocale.en.role}`,
      heroTitle: "Turning complex ideas into clear, useful products.",
      heroSubtitle: siteIdentity.byLocale.en.positioning,
      heroIntro:
        "From framing the problem and shaping the interaction to shipping and validation, I use Next.js, TypeScript, and Node.js to connect product judgment with implementation.",
      ctaEnter: "View projects",
      ctaBlog: "Read the Blog",
      ctaProjects: "View flagship case",
      ctaContact: "Start a project conversation",
      heroProof: {
        title: "Verifiable site evidence",
        projectsLabel: "Public project cases",
        projectsUnit: "cases",
        demosLabel: "Working entry points",
        demosUnit: "demos",
        deliveryLabel: "Delivery baseline",
        deliveryValue: "Bilingual static pages · content validation · browser checks"
      },
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
      currentFocusTitle: "Currently in the workshop",
      currentFocusDescription:
        "The AI page analysis assistant is moving from a demo into an MVP: inputs, diagnosis, recommendations, and backlog first, then real crawling and model analysis.",
      currentFocusMeta: "Prototype · AI Tool",
      currentFocusHref: "/ai-page-analysis",
      currentFocusAction: "View case evidence",
      featuredProjectsTitle: "Featured projects",
      featuredProjectsDescription: "A few evolving projects, from product judgment through engineering delivery.",
      featuredSeriesTitle: "Recommended series",
      featuredSeriesDescription: "Themed reading paths that make writing work as a long-term asset.",
      latestFallbackTitle: "Latest posts",
      labsTrackerTitle: "Labs and systems",
      labsTrackerDescription: "Labs hosts tools and prototypes; Tracker hosts product rules and long-term behavior systems.",
      contactEyebrow: "Now / Contact",
      contactTitle: "Have an idea worth moving forward?",
      contactDescription:
        "Let’s talk about AI prototypes, personal-site engineering, dashboards, content systems, or a focused small product.",
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
        topicLabel: "Topic",
        postNavigationTitle: "Continue reading",
        previousPost: "Previous post",
        nextPost: "Next post",
        topicFilterLabel: "Browse by topic",
        allTopics: "All topics",
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
        description: "Experiments and prototypes in progress.",
        queryEyebrow: "New tool",
        queryTitle: "Free Query Lab",
        queryDescription:
          "Search by city for current weather, a three-day forecast, and air quality while the API key stays server-side.",
        queryAction: "Open Free Query Lab",
        toolsEyebrow: "Browser-only",
        toolsTitle: "Developer Toolbox",
        toolsDescription:
          "Format JSON, transform URL/Base64, generate UUIDs, calculate SHA-256, and check color contrast without sending input to a server.",
        toolsAction: "Open toolbox"
      },
      freeQuery: {
        eyebrow: "Free Query Lab",
        title: "Free Query Lab",
        description:
          "Search for a city, choose the right location, and view current weather, a three-day forecast, and air quality in one place.",
        backToLabs: "Back to Labs",
        searchEyebrow: "City lookup",
        searchTitle: "Find the exact location first",
        searchDescription:
          "Results include region and country details so namesakes stay distinguishable. Weather loads only after you choose a location.",
        inputLabel: "City name",
        inputPlaceholder: "For example: Beijing, Shanghai, or London",
        submit: "Search cities",
        searching: "Searching for cities…",
        loadingWeather: "Loading weather and air quality…",
        unitLabel: "Temperature and wind units",
        metric: "Metric °C",
        imperial: "Imperial °F",
        popularTitle: "Popular cities",
        popularCities: [
          { label: "Beijing", query: "Beijing" },
          { label: "Shanghai", query: "Shanghai" },
          { label: "Shenzhen", query: "Shenzhen" },
          { label: "London", query: "London" },
          { label: "Tokyo", query: "Tokyo" }
        ],
        locationTitle: "Choose a location",
        locationDescription: "Select the result that matches its region and country.",
        locationResultsStatus: "Found {count} location options.",
        chooseLocation: "View this location",
        emptyTitle: "No matching city found",
        emptyDescription: "Try the full city name or add a region or country.",
        errorTitle: "The query could not be completed",
        errorDescription: "Please retry in a moment. Your city input is preserved.",
        notConfiguredTitle: "The query service is not configured yet",
        notConfiguredDescription:
          "The interface is ready. Queries will work after the server administrator adds the WeatherAPI.com key.",
        retry: "Retry",
        resultEyebrow: "Query result",
        localTime: "Local time",
        updatedAt: "Updated",
        staleNotice: "Cached fallback data",
        temperature: "Current temperature",
        feelsLike: "Feels like",
        humidity: "Humidity",
        wind: "Wind",
        forecastEyebrow: "Forecast",
        forecastTitle: "Next 3 days",
        maxTemperature: "High",
        minTemperature: "Low",
        rainChance: "Rain chance",
        airQualityEyebrow: "Air quality",
        airQualityTitle: "Air quality",
        aqi: "US EPA category (1–6)",
        aqiLevels: [
          "Good",
          "Moderate",
          "Unhealthy for sensitive groups",
          "Unhealthy",
          "Very unhealthy",
          "Hazardous"
        ],
        pm25: "PM2.5",
        pm10: "PM10",
        unavailable: "Unavailable",
        fairUseTitle: "Fair use and API boundary",
        fairUseDescription:
          "The browser calls same-origin endpoints only. The server key is never exposed, and this site does not provide a public CORS proxy or bulk-query access.",
        privacyNotice:
          "The searched city and selected coordinates are forwarded to WeatherAPI.com by this site’s server. Browser geolocation is not used, and query cookies are not set.",
        apiEyebrow: "Same-origin API",
        apiTitle: "Readable query endpoints",
        apiDescription:
          "Endpoints use a stable ok / data / error / meta response envelope for fair-use calls from this site’s frontend.",
        locationsEndpoint: "Location candidates",
        weatherEndpoint: "Weather and air quality",
        apiBoundary:
          "CORS is not enabled, the upstream key is never shown, and these endpoints are not promised as a public API for third-party applications.",
        attributionPrefix: "Powered by",
        disclaimerTitle: "Important data notice",
        disclaimer:
          "Weather, forecasts, and air-quality data are for general informational purposes only. Weather and forecasts are probabilistic and may be inaccurate or inapplicable for a specific location or time. They must not be the sole basis for safety-critical decisions involving personal safety, aviation, marine navigation, or emergency planning. Consult official meteorological services and relevant authorities for critical decisions. Air-quality data does not constitute medical advice."
      },
      tracker: {
        eyebrow: "Tracker",
        title: "Tracker",
        description: "Track habits and learning progress."
      },
      about: {
        eyebrow: `${siteIdentity.personName} · About`,
        title: `About ${siteIdentity.personName}`,
        description:
          `I'm ${siteIdentity.personName}. ${siteIdentity.brandName} is my personal site for public work and engineering notes: I shape product questions into testable prototypes, then harden the systems so they can keep evolving.`,
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
        ]
      },
      contact: {
        eyebrow: `${siteIdentity.personName} · Contact`,
        title: `Contact ${siteIdentity.personName}`,
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
        contactPathEyebrow: "Start here",
        contactPathTitle: "Choose the right contact path",
        contactPathDescription:
          "Use the form below to share the project goal, current link, constraints, and expected deliverables. You can also review the projects, try the demo, or read the writing first. If the form is temporarily unavailable, use GitHub to find public work and any available contact details.",
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
          },
          {
            label: "GitHub profile",
            description: "If the form is temporarily unavailable, review public repositories and any contact details listed on the profile.",
            href: siteIdentity.githubUrl
          }
        ],
        responseExpectation:
          "When reaching out, include the project goal, current page or product link, timeline, budget range, and the part you want me to own.",
        contactForm: {
          eyebrow: "Project inquiry",
          title: "Send a project inquiry",
          description:
            "Share enough context to understand the scope, fit, and possible next step. Your submission is used only for project communication and is not published.",
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
          successTitle: "Request saved.",
          submissionIdLabel: "Submission ID",
          notificationDelivered: "The configured notification channel accepted the automatic notification.",
          notificationSkipped: "Automatic notification is not configured; your saved submission is not affected.",
          notificationFailed: "Automatic notification failed; your saved submission is not affected.",
          savedGuidance: "Keep the submission ID. To add context or use a public channel instead, open GitHub.",
          githubFallbackAction: "Open the GitHub fallback",
          submitAnotherAction: "Submit another inquiry",
          errors: {
            missing_required_field: "Add your name, reply channel, and project goal.",
            invalid_contact: "Use a real reply channel instead of a placeholder address.",
            low_quality_input: "Add more context to the Project goal: current state, target outcome, and expected deliverables.",
            invalid_link: "Related links must use HTTP or HTTPS and include no more than 3 URLs.",
            rate_limited: "Too many attempts. Please retry later.",
            duplicate_submit: "A similar request has already been received.",
            submit_failure: "Submission failed. Your input is still here so you can retry.",
            storage_failure: "The request could not be saved. Your input is still here so you can retry.",
            notification_failure: "The request was saved, but automatic notification delivery failed.",
            received_with_notification_failure: "The request was saved, but automatic notification delivery failed."
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
        evidenceGalleryTitle: "Evidence gallery",
        evidenceGalleryDescription: "Only repository-backed product mocks, public documentation, or an explicit no-public-image explanation appear here.",
        assetTitle: "Asset status",
        assetKindLabel: "Asset type",
        assetUnavailableLabel: "Asset unavailable",
        nextAssetStepLabel: "Next asset step",
        openFullSizeDiagram: "Open full-size diagram",
        architectureTitle: "Architecture",
        architectureStepLabel: "Step",
        decisionsTitle: "Key decisions and impact",
        decisionLabel: "Decision",
        rationaleLabel: "Rationale",
        impactLabel: "Impact",
        tradeoffsTitle: "Trade-offs",
        roadmapTitle: "Roadmap",
        entryEyebrow: "Verifiable entry points",
        entryTitle: "Demo and source",
        demoAvailableLabel: "Public demo",
        demoUnavailableLabel: "No public demo",
        sourceEntryLabel: "Source evidence",
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
      siteName: siteIdentity.brandName,
      defaultTitle: "AI Engineering and Product Experience",
      defaultDescription: "A full-stack developer building working, testable AI products with Next.js, TypeScript, and Node.js.",
      homeTitle: "AI Engineering and Product Experience",
      homeDescription: "A full-stack developer building working, testable AI products with Next.js, TypeScript, and Node.js.",
      enterTitle: "Enter",
      enterDescription: "Choose to enter the blog, labs, or tracker.",
      blogTitle: "Blog",
      blogDescription: "Writing about engineering, products, and ideas.",
      projectsTitle: "Projects",
      projectsDescription: "Project cases across AI tools, product systems, dashboards, and infrastructure.",
      labsTitle: "Labs",
      labsDescription: "Experiments and prototypes in progress.",
      freeQueryTitle: "Free Query Lab",
      freeQueryDescription: "Look up current weather, a three-day forecast, and air quality by city.",
      trackerTitle: "Tracker",
      trackerDescription: "Track habits and learning progress.",
      aboutTitle: `About ${siteIdentity.personName}`,
      aboutDescription: `How ${siteIdentity.personName} builds AI tools, content systems, dashboards, and product prototypes.`,
      contactTitle: `Contact ${siteIdentity.personName}`,
      contactDescription: "Start a focused conversation about AI prototypes, site engineering, content systems, or small product delivery.",
      jsonLd: {
        siteDescription: "A personal developer site for AI tools, content systems, dashboards, and product prototypes."
      }
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];

export const getMessages = (locale: Locale): Messages => messages[locale];
