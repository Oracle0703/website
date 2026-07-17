import type { ReactNode } from "react";
import { PreferenceBootScript } from "../app/preference-boot-script";
import { getHtmlLang, type Locale } from "../lib/i18n";
import { defaultTheme } from "../lib/theme";
import { LayoutShell } from "./layout-shell";

export function RootDocument({
  children,
  locale
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <html lang={getHtmlLang(locale)} data-theme={defaultTheme} suppressHydrationWarning>
      <body>
        <PreferenceBootScript />
        <LayoutShell initialLocale={locale} initialTheme={defaultTheme}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
