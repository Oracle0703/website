import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "../components/layout-shell";
import { PreferenceBootScript } from "./preference-boot-script";
import { defaultLocale, getHtmlLang, getMessages } from "../lib/i18n";
import { defaultTheme } from "../lib/theme";
import { getSiteBaseUrl } from "../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);
  const baseUrl = getSiteBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.defaultTitle,
      template: `%s | ${seo.siteName}`
    },
    description: seo.defaultDescription,
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      type: "website",
      images: ["/og.png"]
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.png"]
    }
  };
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getHtmlLang(defaultLocale)} data-theme={defaultTheme} suppressHydrationWarning>
      <body>
        <PreferenceBootScript />
        <LayoutShell initialLocale={defaultLocale} initialTheme={defaultTheme}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
