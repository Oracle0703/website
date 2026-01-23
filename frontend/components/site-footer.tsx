"use client";

import Link from "next/link";

const siteMap = [
  { href: "/", label: "\u9996\u9875" },
  { href: "/blog", label: "\u535a\u5ba2" },
  { href: "/labs", label: "Labs" },
  { href: "/tracker", label: "\u6253\u5361" },
  { href: "/about", label: "\u5173\u4e8e" },
  { href: "/contact", label: "\u8054\u7cfb" }
];

const socialLinks = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://x.com", label: "X" },
  { href: "https://www.linkedin.com", label: "LinkedIn" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900/70 bg-base/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <span>{"\u00a9 2026 Developer Studio"}</span>
          <p className="text-[11px] text-slate-400" lang="en">
            Developer Portfolio \u00b7 Blog \u00b7 Labs \u00b7 Tracker
          </p>
        </div>
        <div className="space-y-3 text-[11px] md:text-right">
          <div className="flex flex-wrap gap-3">
            {siteMap.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
