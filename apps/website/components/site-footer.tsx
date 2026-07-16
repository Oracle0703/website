"use client";

import Link from "next/link";
import { useI18n } from "./language-provider";
import { getLocalePath } from "../lib/locale-routing";

const socialLinks = [
  { href: "https://github.com/Oracle0703", label: "GitHub" }
];

export function SiteFooter() {
  const { locale, messages } = useI18n();

  return (
    <footer className="border-t border-edge/70 bg-base/80">
      <div
        className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="text-base font-semibold text-primary">{messages.nav.brand}</p>
          <p className="mt-2 text-sm text-muted">{messages.footer.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            <span>{messages.footer.copyright}</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary"
            >
              蜀ICP备2023005978号-1
            </a>
          </div>
        </div>

        <div className="space-y-4 text-sm text-secondary md:text-right">
          <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
            {messages.nav.items.map((item) => (
              <Link
                key={item.href}
                href={getLocalePath(item.href, locale)}
                className="font-medium text-secondary transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-secondary transition-colors hover:text-accent"
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
