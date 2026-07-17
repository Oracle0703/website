import type { Metadata } from "next";
import { getMessages, type Locale } from "./i18n";
import { getSiteBaseUrl } from "./site-url";

export function getRootMetadata(locale: Locale): Metadata {
  const { seo } = getMessages(locale);
  const baseUrl = getSiteBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.defaultTitle,
      template: `%s | ${seo.siteName}`
    },
    description: seo.defaultDescription,
    manifest: locale === "en" ? "/en/manifest.webmanifest" : "/manifest.webmanifest",
    alternates: {
      types: {
        "application/rss+xml": `${baseUrl}/rss.xml`
      }
    },
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
}
