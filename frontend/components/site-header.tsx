"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "\u9996\u9875", en: "Home" },
  { href: "/blog", label: "\u535a\u5ba2", en: "Blog" },
  { href: "/labs", label: "Labs", en: "Labs" },
  { href: "/tracker", label: "\u6253\u5361", en: "Tracker" },
  { href: "/about", label: "\u5173\u4e8e", en: "About" },
  { href: "/contact", label: "\u8054\u7cfb", en: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-900/70 bg-base/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Developer Studio
        </Link>
        <nav className="hidden items-center gap-6 text-xs text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
              <span className="ml-1 text-[10px] text-slate-400" lang="en">
                {item.en}
              </span>
            </Link>
          ))}
        </nav>
        <Link
          href="/enter"
          className="text-xs font-semibold text-blue-300 hover:text-blue-200"
        >
          进入 <span className="text-[10px] text-blue-200" lang="en">Enter</span>
        </Link>
      </div>
    </header>
  );
}
