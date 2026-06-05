"use client";

import Link from "next/link";
import { useI18n } from "./language-provider";
import { getLocalePath } from "../lib/locale-routing";
import { getActiveProfileLinks } from "../lib/site-links";
import { TEXT_BASE_MUTED } from "../lib/typography";

export function SiteFooter() {
  const { locale, messages } = useI18n();
  // Real profile links only (configured in lib/site-links.ts). Until a real URL
  // is set nothing renders here — better than the old placeholder bare domains.
  const socialLinks = getActiveProfileLinks();

  return (
    <footer className="border-t border-edge/70 bg-base/80">
      <div
        className={`mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 ${TEXT_BASE_MUTED} sm:gap-6 sm:px-6 sm:py-10 md:grid-cols-[1fr_auto] md:items-start md:gap-x-8 md:gap-y-3`}
      >
        <span className="md:col-start-1 md:row-start-1">
          {messages.footer.copyright}
        </span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-reverse-link inline-flex items-baseline rounded-sm -mx-1 px-1 text-sm sm:text-base md:col-start-2 md:row-start-2 md:justify-self-end"
        >
          蜀ICP备2023005978号-1
        </a>

        <div className="space-y-3 text-sm text-secondary sm:text-base md:col-start-2 md:row-start-1 md:text-right">
          <div className="flex flex-wrap gap-3 md:justify-end">
            {messages.nav.items.map((item) => (
              <Link
                key={item.href}
                href={getLocalePath(item.href, locale)}
                className="inline-flex rounded-sm -mx-1 px-1 font-medium text-secondary visited:text-secondary transition-colors hover:bg-primary hover-text-base"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3 md:justify-end">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-sm -mx-1 px-1 font-medium text-secondary visited:text-secondary transition-colors hover:bg-primary hover-text-base"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
