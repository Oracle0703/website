"use client";

import Link from "next/link";
import { useI18n } from "./language-provider";
import { useTheme } from "./theme-provider";

export function SiteHeader() {
  const { locale, messages, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const toggleLabel = locale === "zh" ? "EN" : "\u4e2d\u6587";
  const toggleAriaLabel =
    locale === "zh" ? messages.nav.switchToEnglish : messages.nav.switchToChinese;
  const themeLabel = theme === "dark" ? messages.theme.light : messages.theme.dark;
  const themeAriaLabel =
    theme === "dark" ? messages.theme.switchToLight : messages.theme.switchToDark;

  return (
    <header className="border-b border-edge/70 bg-base/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          {messages.nav.brand}
        </Link>
        <nav className="hidden items-center gap-6 text-xs text-secondary md:flex">
          {messages.nav.items.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeAriaLabel}
            className="text-xs font-semibold text-secondary transition hover:text-primary"
          >
            {themeLabel}
          </button>
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={toggleAriaLabel}
            className="text-xs font-semibold text-secondary transition hover:text-primary"
          >
            {toggleLabel}
          </button>
          <Link
            href="/enter"
            className="text-xs font-semibold text-accent hover:text-accent-strong"
          >
            {messages.nav.enter}
          </Link>
        </div>
      </div>
    </header>
  );
}
