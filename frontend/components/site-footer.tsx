"use client";

import Link from "next/link";
import { useI18n } from "./language-provider";
import { TEXT_XS_MUTED } from "../lib/typography";

const socialLinks = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://x.com", label: "X" },
  { href: "https://www.linkedin.com", label: "LinkedIn" }
];

export function SiteFooter() {
  const { messages } = useI18n();

  return (
    <footer className="border-t border-edge/70 bg-base/80">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 ${TEXT_XS_MUTED} sm:gap-6 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between`}
      >
        <div className="space-y-2">
          <span>{messages.footer.copyright}</span>
          <p className="text-[11px] text-muted">{messages.footer.tagline}</p>
          <p className="text-[11px] text-muted">
            2026{" "}
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              蜀ICP备2023005978号-1
            </a>
          </p>
        </div>
        <div className="space-y-3 text-[11px] md:text-right">
          <div className="flex flex-wrap gap-3">
            {messages.nav.items.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary">
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
                className="hover:text-primary"
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
