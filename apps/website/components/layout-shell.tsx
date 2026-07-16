"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { LanguageProvider } from "./language-provider";
import type { Locale } from "../lib/i18n";
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

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <LanguageProvider initialLocale={initialLocale}>
        <div className="min-h-screen bg-base">
          {!hideChrome && <SiteHeader />}
          {children}
          {!hideChrome && <SiteFooter />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
