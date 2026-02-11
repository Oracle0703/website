"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./language-provider";
import { useTheme } from "./theme-provider";
import {
  TEXT_BASE_SECONDARY,
  TEXT_BASE_SEMIBOLD_SECONDARY
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

  return (
    <header className="border-b border-edge/70 bg-base/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
        <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-wide whitespace-nowrap sm:text-xl md:justify-self-start"
          >
            {messages.nav.brand}
          </Link>
          <nav
            className={`hidden items-center gap-8 ${TEXT_BASE_SECONDARY} text-base lg:text-lg md:flex md:justify-self-center`}
          >
            {messages.nav.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative font-medium hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-6 md:flex md:justify-self-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeAriaLabel}
              className={`${TEXT_BASE_SEMIBOLD_SECONDARY} cursor-pointer transition hover:text-primary`}
            >
              {themeLabel}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={toggleAriaLabel}
              className={`${TEXT_BASE_SEMIBOLD_SECONDARY} cursor-pointer transition hover:text-primary`}
            >
              {toggleLabel}
            </button>
            <Link
              href="/enter"
              className="link-accent text-base font-semibold"
            >
              {messages.nav.enter}
            </Link>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <Link
              href="/enter"
              className="link-accent text-base font-semibold"
            >
              {messages.nav.enter}
            </Link>
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
        <div className="border-t border-edge/70 bg-base/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
            <nav className="flex flex-col gap-3 text-base text-secondary sm:text-lg">
              {messages.nav.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
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



