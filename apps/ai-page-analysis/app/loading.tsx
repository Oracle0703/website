export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-20">
      <div className="panel-surface flex min-w-[280px] items-center gap-3 px-5 py-4 text-sm text-secondary">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
        正在加载页面分析助手…
      </div>
    </main>
  );
}
