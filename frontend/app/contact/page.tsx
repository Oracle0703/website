import Link from "next/link";

export const metadata = {
  title: "联系我 | Contact",
  description: "欢迎通过邮箱或社交媒体联系。"
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-surface/70 p-8">
        <p className="text-sm text-slate-400" lang="en">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold">联系我</h1>
        <p className="mt-4 text-sm text-slate-400">欢迎通过邮箱或社交媒体联系。</p>
        <p className="mt-1 text-xs text-slate-500" lang="en">Reach out via email or social links.</p>
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
