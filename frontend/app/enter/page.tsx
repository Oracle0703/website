import Link from "next/link";

export const metadata = {
  title: "\u8fdb\u5165\u7ad9\u70b9 | Enter",
  description: "\u9009\u62e9\u8fdb\u5165\u535a\u5ba2\u3001\u5b9e\u9a8c\u5ba4\u6216\u6253\u5361\u5e73\u53f0\u3002"
};

const copy = {
  heading: "\u8fdb\u5165\u7ad9\u70b9",
  subheading: "\u9009\u62e9\u4f60\u7684\u5165\u53e3",
  back: "\u8fd4\u56de\u9996\u9875",
  hint: "\u652f\u6301\u952e\u76d8\u5bfc\u822a\uff0c\u51cf\u5c11\u52a8\u753b\u53ef\u5728\u7cfb\u7edf\u8bbe\u7f6e\u4e2d\u542f\u7528\u3002",
  enter: "\u8fdb\u5165"
};

const entries = [
  {
    title: "\u535a\u5ba2",
    subtitle: "\u9605\u8bfb\u4e0e\u601d\u8003",
    en: "Read & Reflect",
    href: "/blog",
    icon: "\u2398"
  },
  {
    title: "\u5b9e\u9a8c\u5ba4",
    subtitle: "\u5b9e\u9a8c\u4e0e\u539f\u578b",
    en: "Experiments & Prototypes",
    href: "/labs",
    icon: "\u2b21"
  },
  {
    title: "\u6253\u5361",
    subtitle: "\u4e60\u60ef\u4e0e\u8fdb\u5ea6",
    en: "Habits & Progress",
    href: "/tracker",
    icon: "\u25cc"
  }
];

export default function EnterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(91,140,255,0.12),_transparent_55%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="h-full w-full animate-pulse bg-[radial-gradient(circle_at_center,_rgba(91,140,255,0.08),_transparent_60%)]" />
      </div>
      <div className="relative w-full max-w-5xl space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              {copy.subheading} <span lang="en">/ Choose your path</span>
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{copy.heading}</h1>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            \u2190 {copy.back} <span lang="en">/ Back</span>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.title}
              href={entry.href}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-surface/70 p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none"
            >
              <div className="space-y-3">
                <div className="text-2xl text-blue-300">{entry.icon}</div>
                <h2 className="text-xl font-semibold">{entry.title}</h2>
                <p className="text-sm text-slate-400">{entry.subtitle}</p>
                <p className="text-xs text-slate-500" lang="en">
                  {entry.en}
                </p>
              </div>
              <span className="mt-6 text-sm text-slate-400 group-hover:text-blue-200">
                {copy.enter} \u2192
              </span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500">{copy.hint}</p>
      </div>
    </main>
  );
}
