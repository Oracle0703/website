import type { Metadata } from "next";
import { AboutClient } from "../../about/about-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.aboutTitle,
    description: seo.aboutDescription,
    alternates: {
      ...getLanguageAlternates("/en/about"),
      canonical: toAbsoluteUrl("/en/about")
    },
    openGraph: {
      title: seo.aboutTitle,
      description: seo.aboutDescription,
      url: toAbsoluteUrl("/en/about"),
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
  return <AboutClient />;
}
