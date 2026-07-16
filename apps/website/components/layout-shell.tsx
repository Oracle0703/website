"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { LanguageProvider } from "./language-provider";
import type { Locale } from "../lib/i18n-core";
import { ThemeProvider } from "./theme-provider";
import type { Theme } from "../lib/theme";

const CHROME_HIDDEN_ROUTES = new Set(["/enter", "/en/enter"]);

export function LayoutShell({
  children,
  initialLocale,
  initialTheme
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const pathname = usePathname();
  const hideChrome = CHROME_HIDDEN_ROUTES.has(pathname);
  const skipLinkLabel =
    pathname === "/en" || pathname.startsWith("/en/")
      ? "Skip to main content"
      : "跳到主要内容";

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <LanguageProvider initialLocale={initialLocale}>
        <div className="min-h-screen bg-base">
          <a href="#main-content" className="skip-link">
            {skipLinkLabel}
          </a>
          {!hideChrome && <SiteHeader />}
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          {!hideChrome && <SiteFooter />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
