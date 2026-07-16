"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./language-provider";
import { useTheme } from "./theme-provider";
import { getLocalePath } from "../lib/locale-routing";
import {
  TEXT_BASE_SECONDARY
} from "../lib/typography";

export function SiteHeader() {
  const { locale, messages, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleLabel = locale === "zh" ? "EN" : "中文";
  const toggleAriaLabel =
    locale === "zh" ? messages.nav.switchToEnglish : messages.nav.switchToChinese;
  const themeLabel = theme === "dark" ? messages.theme.light : messages.theme.dark;
  const themeAriaLabel =
    theme === "dark" ? messages.theme.switchToLight : messages.theme.switchToDark;
  const menuLabel = menuOpen ? messages.nav.closeMenu : messages.nav.openMenu;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <header className="border-b border-edge/70 bg-base/95">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <Link
            href={getHref("/")}
            className="inline-flex items-center gap-2.5 whitespace-nowrap text-base font-semibold tracking-wide text-primary sm:text-lg md:justify-self-start"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {messages.nav.brand}
          </Link>
          <nav
            className={`hidden items-center gap-6 ${TEXT_BASE_SECONDARY} text-sm md:flex md:justify-self-center lg:gap-8`}
          >
            {messages.nav.items.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className="relative font-medium hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 text-sm md:flex md:justify-self-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeAriaLabel}
              className="cursor-pointer font-medium text-secondary transition hover:text-primary"
            >
              {themeLabel}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={toggleAriaLabel}
              className="cursor-pointer font-medium text-secondary transition hover:text-primary"
            >
              {toggleLabel}
            </button>
          </div>
          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label={menuLabel}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="cursor-pointer rounded-full border border-edge bg-base/80 p-2 text-secondary transition hover:text-primary"
            >
              <span className="sr-only">{menuLabel}</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                {menuOpen ? (
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-edge/70 bg-base md:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
            <nav className="flex flex-col gap-3 text-base text-secondary sm:text-lg">
              {messages.nav.items.map((item) => (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2 font-medium hover:bg-surface/70 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className={`flex flex-wrap items-center gap-4 ${TEXT_BASE_SECONDARY}`}>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={themeAriaLabel}
                className="cursor-pointer rounded-full border border-edge px-3 py-1.5 text-base font-semibold text-secondary hover:text-primary"
              >
                {themeLabel}
              </button>
              <button
                type="button"
                onClick={toggleLocale}
                aria-label={toggleAriaLabel}
                className="cursor-pointer rounded-full border border-edge px-3 py-1.5 text-base font-semibold text-secondary hover:text-primary"
              >
                {toggleLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

