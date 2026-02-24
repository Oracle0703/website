import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "../components/layout-shell";
import { getLocale } from "../lib/i18n-server";
import { getHtmlLang, getMessages } from "../lib/i18n";
import { getTheme } from "../lib/theme-server";
import { getSiteBaseUrl } from "../lib/site-url";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);
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
  const locale = getLocale();
  const theme = getTheme();

  return (
    <html lang={getHtmlLang(locale)} data-theme={theme}>
      <body>
        <LayoutShell initialLocale={locale} initialTheme={theme}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
