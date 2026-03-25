import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-20">
      <div className="panel-surface max-w-xl space-y-4 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">404</p>
        <h1 className="text-3xl font-semibold text-primary">页面不存在</h1>
        <p className="text-sm leading-6 text-muted">你访问的页面不存在，返回首页继续体验页面分析与改版方案生成流程。</p>
        <div className="pt-2">
          <Link href="/" className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
