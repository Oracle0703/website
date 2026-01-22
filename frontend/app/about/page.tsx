import Link from "next/link";

export const metadata = {
  title: "关于我 | About",
  description: "一些关于背景、经验与价值观的说明。"
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-surface/70 p-8">
        <p className="text-sm text-slate-400" lang="en">About</p>
        <h1 className="mt-2 text-3xl font-semibold">关于我</h1>
        <p className="mt-4 text-sm text-slate-400">一些关于背景、经验与价值观的说明。</p>
        <p className="mt-1 text-xs text-slate-500" lang="en">Background, experience, and values.</p>
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
