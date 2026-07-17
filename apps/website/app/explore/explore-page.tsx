import Link from "next/link";
import type { Locale } from "../../lib/i18n-core";
import { getLocalePath } from "../../lib/locale-routing";

type ExploreItem = {
  title: string;
  description: string;
  href: string;
  meta: string;
};

type ExploreSection = {
  title: string;
  description: string;
  items: ExploreItem[];
};

const content: Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  searchHint: string;
  action: string;
  sections: ExploreSection[];
}> = {
  zh: {
    eyebrow: "探索 / 全部入口",
    title: "把工具、作品和正在建设的东西放在一张地图上。",
    description:
      "这里不是功能陈列柜，而是网站的工作台：可以直接使用工具、查看产品原型，也可以沿着文章和项目继续深入。",
    searchHint: "找不到目标时，按 Ctrl/Cmd + K 打开全站搜索。",
    action: "打开",
    sections: [
      {
        title: "直接使用",
        description: "无需账户，尽量在浏览器本地完成。",
        items: [
          {
            title: "本地习惯 Tracker",
            description: "建立习惯、每日打卡、查看七日统计，并导入或导出自己的数据。",
            href: "/tracker",
            meta: "Local-first"
          },
          {
            title: "开发者工具箱",
            description: "处理 JSON、URL/Base64、UUID、SHA-256 与颜色对比度。",
            href: "/labs/tools",
            meta: "Browser-only"
          },
          {
            title: "免费天气查询",
            description: "查询当前天气、三日预报与空气质量，包含明确的公平使用边界。",
            href: "/labs/query",
            meta: "Server proxy"
          },
          {
            title: "时间戳工具",
            description: "在 Unix 时间戳与本地时间之间快速转换。",
            href: "/labs",
            meta: "Utility"
          }
        ]
      },
      {
        title: "查看产品如何被构建",
        description: "从交互原型进入问题、架构、取舍和下一步。",
        items: [
          {
            title: "AI 页面分析",
            description: "把页面目标转换成诊断、建议与 backlog 的可浏览原型。",
            href: "/ai-page-analysis",
            meta: "AI prototype"
          },
          {
            title: "项目案例",
            description: "查看产品判断、工程方案、证据、限制与路线图。",
            href: "/projects",
            meta: "Case studies"
          },
          {
            title: "技术文章",
            description: "阅读实现过程、工程边界与产品复盘。",
            href: "/blog",
            meta: "Writing"
          }
        ]
      },
      {
        title: "了解我现在的位置",
        description: "公开能力边界、近期建设与合作入口。",
        items: [
          {
            title: "能力简历",
            description: "以公开项目为证据的技能与交付方式，可直接打印或保存为 PDF。",
            href: "/resume",
            meta: "Resume"
          },
          {
            title: "Now",
            description: "最近完成、当前关注与接下来准备推进的事情。",
            href: "/now",
            meta: "当前快照"
          },
          {
            title: "更新日志",
            description: "按时间查看已经上线并可以从页面或公开仓库验证的变化。",
            href: "/changelog",
            meta: "Changelog"
          },
          {
            title: "联系",
            description: "带着目标、限制与时间线发起一次具体沟通。",
            href: "/contact",
            meta: "Collaboration"
          }
        ]
      }
    ]
  },
  en: {
    eyebrow: "Explore / Directory",
    title: "One map for the tools, work, and things currently being built.",
    description:
      "This is the site workbench rather than a feature shelf: use a tool, inspect a prototype, or follow the evidence into writing and project cases.",
    searchHint: "If you cannot spot something, press Ctrl/Cmd + K to search the whole site.",
    action: "Open",
    sections: [
      {
        title: "Use it now",
        description: "No account, with as much work as possible staying in the browser.",
        items: [
          {
            title: "Local habit tracker",
            description: "Create habits, check in, review seven days, and import or export your own data.",
            href: "/tracker",
            meta: "Local-first"
          },
          {
            title: "Developer toolbox",
            description: "Work with JSON, URL/Base64, UUID, SHA-256, and color contrast.",
            href: "/labs/tools",
            meta: "Browser-only"
          },
          {
            title: "Free weather query",
            description: "Look up current weather, a three-day forecast, and air quality with clear fair-use boundaries.",
            href: "/labs/query",
            meta: "Server proxy"
          },
          {
            title: "Timestamp tool",
            description: "Convert between Unix timestamps and local date-time values.",
            href: "/labs",
            meta: "Utility"
          }
        ]
      },
      {
        title: "See how products are built",
        description: "Move from interactive prototypes into problems, architecture, trade-offs, and next steps.",
        items: [
          {
            title: "AI page analysis",
            description: "A browsable prototype that turns a page goal into diagnostics, recommendations, and a backlog.",
            href: "/ai-page-analysis",
            meta: "AI prototype"
          },
          {
            title: "Project cases",
            description: "Inspect product judgment, engineering choices, evidence, limitations, and roadmaps.",
            href: "/projects",
            meta: "Case studies"
          },
          {
            title: "Engineering writing",
            description: "Read implementation notes, operating boundaries, and product retrospectives.",
            href: "/blog",
            meta: "Writing"
          }
        ]
      },
      {
        title: "Understand where I am now",
        description: "Public capability boundaries, recent work, and a focused way to get in touch.",
        items: [
          {
            title: "Capability resume",
            description: "Skills and delivery approach backed by public projects, ready to print or save as PDF.",
            href: "/resume",
            meta: "Resume"
          },
          {
            title: "Now",
            description: "What recently shipped, what has my attention, and what comes next.",
            href: "/now",
            meta: "Current snapshot"
          },
          {
            title: "Changelog",
            description: "Browse changes that are live and verifiable through the site or public repository.",
            href: "/changelog",
            meta: "Release history"
          },
          {
            title: "Contact",
            description: "Start a concrete conversation with a goal, constraints, and a timeline.",
            href: "/contact",
            meta: "Collaboration"
          }
        ]
      }
    ]
  }
};

export function ExplorePage({ locale }: { locale: Locale }) {
  const copy = content[locale];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="max-w-4xl border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-primary sm:text-5xl md:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-secondary sm:text-lg">
          {copy.description}
        </p>
        <p className="mt-4 text-sm text-muted">{copy.searchHint}</p>
      </header>

      <div className="space-y-16 pt-12 md:space-y-20 md:pt-16">
        {copy.sections.map((section) => (
          <section key={section.title} aria-labelledby={`explore-${section.title.replace(/\s+/g, "-")}`}>
            <div className="max-w-2xl">
              <h2 id={`explore-${section.title.replace(/\s+/g, "-")}`} className="text-2xl font-semibold text-primary sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{section.description}</p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={getLocalePath(item.href, locale)}
                  className="group flex min-h-48 flex-col justify-between rounded-2xl border border-edge bg-surface/60 p-5 transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface motion-reduce:transform-none sm:p-6"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-secondary">
                      {item.meta}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-primary transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                  <span className="mt-6 text-sm font-semibold text-secondary group-hover:text-accent">
                    {copy.action} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
