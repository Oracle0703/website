import type { Metadata } from "next";
import { AboutClient } from "./about-client";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getActiveProfileLinks } from "../../lib/site-links";
import { getJsonLdLanguage, getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.aboutTitle,
    description: seo.aboutDescription,
    alternates: getLanguageAlternates("/about"),
    openGraph: {
      title: seo.aboutTitle,
      description: seo.aboutDescription,
      url: toAbsoluteUrl("/about"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.aboutTitle,
      description: seo.aboutDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  const { seo } = getMessages(defaultLocale);
  const sameAs = getActiveProfileLinks().map((link) => link.href);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    inLanguage: getJsonLdLanguage(defaultLocale),
    mainEntity: {
      "@type": "Person",
      name: seo.siteName,
      jobTitle: seo.jsonLd.jobTitle,
      url: toAbsoluteUrl("/about"),
      ...(sameAs.length > 0 ? { sameAs } : {})
    }
  };

  return (
    <>
      <AboutClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
