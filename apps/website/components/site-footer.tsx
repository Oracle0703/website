"use client";

import Link from "next/link";
import { useI18n } from "./language-provider";
import { TEXT_BASE_MUTED } from "../lib/typography";

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
        className={`mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 ${TEXT_BASE_MUTED} sm:gap-6 sm:px-6 sm:py-10 md:flex-row md:items-center md:justify-between`}
      >
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:justify-between">
            <span>{messages.footer.copyright}</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline rounded-sm text-sm text-subtle underline underline-offset-4 transition-colors hover:text-primary sm:text-base"
            >
              蜀ICP备2023005978号-1
            </a>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted sm:text-base">{messages.footer.tagline}</p>
        </div>
        <div className="space-y-3 text-sm text-secondary sm:text-base md:text-right">
          <div className="flex flex-wrap gap-3 md:justify-end">
            {messages.nav.items.map((item) => (
              <Link key={item.href} href={item.href} className="font-medium hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary"
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



