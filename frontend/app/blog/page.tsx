import Link from "next/link";

export const metadata = {
  title: "博客 | Blog",
  description: "记录技术、产品与思考的内容专区。"
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-surface/70 p-8">
        <p className="text-sm text-slate-400" lang="en">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold">博客</h1>
        <p className="mt-4 text-sm text-slate-400">记录技术、产品与思考的内容专区。</p>
        <p className="mt-1 text-xs text-slate-500" lang="en">Writing about engineering, products, and ideas.</p>
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
