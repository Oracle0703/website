import Link from "next/link";

export const metadata = {
  title: "打卡平台 | Tracker",
  description: "追踪习惯，沉淀成长数据。"
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-surface/70 p-8">
        <p className="text-sm text-slate-400" lang="en">Tracker</p>
        <h1 className="mt-2 text-3xl font-semibold">打卡平台</h1>
        <p className="mt-4 text-sm text-slate-400">追踪习惯，沉淀成长数据。</p>
        <p className="mt-1 text-xs text-slate-400" lang="en">Track habits and learning progress.</p>
        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/enter" className="text-blue-300 hover:text-blue-200">
            ← 返回入口
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
