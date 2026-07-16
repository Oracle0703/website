import type { Metadata } from "next";
import { AboutClient } from "./about-client";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
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
  const { pages } = getMessages(defaultLocale);

  return <AboutClient locale={defaultLocale} copy={pages.about} common={pages.common} />;
}
