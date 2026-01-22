import Link from "next/link";

const copy = {
  heroTitle: "\u5168\u6808\u5f00\u53d1\u8005",
  heroSubtitle:
    "\u6784\u5efa\u5185\u5bb9\u4e0e\u4f53\u9a8c\u7684\u6570\u5b57\u7a7a\u95f4\uff0c\u8fde\u63a5\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u5b66\u4e60\u7cfb\u7edf\u3002",
  ctaEnter: "\u8fdb\u5165\u7ad9\u70b9",
  ctaBlog: "\u9605\u8bfb\u535a\u5ba2",
  primarySections: "\u4e3b\u8981\u5165\u53e3",
  blogTitle: "\u535a\u5ba2",
  labsTitle: "Labs \u7cbe\u9009",
  trackerTitle: "\u6253\u5361\u5b66\u4e60\u5e73\u53f0",
  trackerDesc:
    "\u7528\u8f7b\u91cf\u7684\u6253\u5361\u7cfb\u7edf\u8ffd\u8e2a\u4e60\u60ef\u4e0e\u6210\u957f\uff0c\u517c\u987e\u6570\u636e\u4e0e\u4f53\u9a8c\u3002",
  trackerEnter: "\u8fdb\u5165\u6253\u5361\u5e73\u53f0",
  aboutTitle: "\u5173\u4e8e\u6211",
  aboutDesc:
    "\u4e13\u6ce8\u5168\u6808\u5f00\u53d1\u4e0e\u4ea7\u54c1\u4f53\u9a8c\uff0c\u559c\u6b22\u628a\u60f3\u6cd5\u5feb\u901f\u843d\u5730\u4e3a\u53ef\u7528\u7684\u4ea7\u54c1\u539f\u578b\u3002",
  latestBlog: "\u6700\u65b0\u535a\u5ba2",
  viewAll: "\u67e5\u770b\u5168\u90e8",
  entryCards: [
    {
      title: "\u535a\u5ba2",
      subtitle: "\u9605\u8bfb\u6280\u672f\u4e0e\u601d\u8003",
      en: "Read my writing",
      href: "/blog"
    },
    {
      title: "Labs",
      subtitle: "\u63a2\u7d22\u5b9e\u9a8c\u4e0e\u539f\u578b",
      en: "Explore experiments",
      href: "/labs"
    },
    {
      title: "\u6253\u5361",
      subtitle: "\u4e60\u60ef\u4e0e\u8fdb\u5ea6\u7ba1\u7406",
      en: "Track learning",
      href: "/tracker"
    }
  ]
};

const blogItems = [
  {
    title: "\u7528 Next.js \u642d\u5efa\u4e2a\u4eba\u7f51\u7ad9",
    subtitle: "Building a personal site with Next.js",
    date: "2026-01-22"
  },
  {
    title: "\u4ece\u8bbe\u8ba1\u5230\u5f00\u53d1\u7684\u6d41\u7a0b",
    subtitle: "From design to development",
    date: "2026-01-18"
  },
  {
    title: "\u5185\u5bb9\u9a71\u52a8\u7684\u4ea7\u54c1\u601d\u8def",
    subtitle: "Content-driven product thinking",
    date: "2026-01-12"
  }
];

const labItems = [
  {
    title: "\u4e92\u52a8\u6570\u636e\u53ef\u89c6\u5316",
    subtitle: "Interactive data visualization"
  },
  {
    title: "3D \u7f51\u9875\u5b9e\u9a8c",
    subtitle: "3D web experiments"
  },
  {
    title: "\u4f53\u9a8c\u52a8\u6548\u539f\u578b",
    subtitle: "Motion-driven prototypes"
  }
];

const trackerPoints = [
  "\u81ea\u5b9a\u4e49\u4e60\u60ef\u4e0e\u76ee\u6807",
  "\u6bcf\u65e5\u6253\u5361\u8bb0\u5f55",
  "\u8fde\u7eed\u5929\u6570\u7edf\u8ba1",
  "\u8fdb\u5ea6\u8d8b\u52bf\u53ef\u89c6\u5316"
];

export const metadata = {
  title: "\u5f00\u53d1\u8005\u4e3b\u9875 | Developer Portfolio",
  description: "\u5c55\u793a\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u4e0e\u6253\u5361\u5e73\u53f0\u7684\u4e2a\u4eba\u5f00\u53d1\u8005\u7f51\u7ad9\u3002"
};

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {copy.heroTitle}
            </h1>
            <p className="text-lg text-slate-300" lang="en">
              Full-Stack Developer
            </p>
            <p className="text-base text-slate-400">{copy.heroSubtitle}</p>
            <p className="text-sm text-slate-500" lang="en">
              Building content-driven experiences across blog, labs, and tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/enter"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {copy.ctaEnter}
              <span className="text-xs text-blue-100" lang="en">
                Enter Site
              </span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {copy.ctaBlog}
              <span className="text-xs text-slate-400" lang="en">
                Blog
              </span>
            </Link>
          </div>
        </div>
        <div className="relative rounded-2xl border border-slate-800 bg-surface/70 p-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
          <div className="relative space-y-4">
            <p className="text-sm text-slate-400">
              {copy.primarySections} / <span lang="en">Primary sections</span>
            </p>
            <div className="grid gap-3">
              {[
                { label: "\u535a\u5ba2", en: "Blog", href: "/blog" },
                { label: "\u5b9e\u9a8c\u5ba4", en: "Labs", href: "/labs" },
                { label: "\u6253\u5361\u5e73\u53f0", en: "Tracker", href: "/tracker" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-slate-600"
                >
                  <span>
                    {item.label} <span className="text-xs text-slate-500" lang="en">/ {item.en}</span>
                  </span>
                  <span className="text-xs text-slate-500">\u2192</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {copy.entryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-slate-800 bg-surface/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none"
          >
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{card.subtitle}</p>
            <p className="mt-1 text-xs text-slate-500" lang="en">
              {card.en}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{copy.latestBlog}</h2>
          <Link href="/blog" className="text-sm text-slate-400 hover:text-white">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {blogItems.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-800 bg-surface/60 p-5">
              <p className="text-xs text-slate-500">{item.date}</p>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400" lang="en">
                {item.subtitle}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{copy.labsTitle}</h2>
          <Link href="/labs" className="text-sm text-slate-400 hover:text-white">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {labItems.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-800 bg-surface/60 p-5">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400" lang="en">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-surface/60 p-6">
          <h2 className="text-xl font-semibold">{copy.trackerTitle}</h2>
          <p className="mt-2 text-sm text-slate-400">{copy.trackerDesc}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {trackerPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/tracker"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            {copy.trackerEnter}
            <span aria-hidden>\u2192</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/20 p-6">
          <h2 className="text-xl font-semibold">{copy.aboutTitle}</h2>
          <p className="mt-2 text-sm text-slate-400">{copy.aboutDesc}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
            {["Next.js", "TypeScript", "Tailwind", "Node.js", "PostgreSQL", "Motion"].map((skill) => (
              <span key={skill} className="rounded-full border border-slate-700 px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
