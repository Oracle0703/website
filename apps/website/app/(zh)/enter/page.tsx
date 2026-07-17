import type { Metadata } from "next";
import { EnterClient } from "../../enter/enter-client";
import { defaultLocale, getMessages } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.enterTitle,
    description: seo.enterDescription,
    robots: { index: false, follow: true },
    alternates: getLanguageAlternates("/enter"),
    openGraph: {
      title: seo.enterTitle,
      description: seo.enterDescription,
      url: toAbsoluteUrl("/enter"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.enterTitle,
      description: seo.enterDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function EnterPage() {
  const { enter, pages } = getMessages(defaultLocale);

  return <EnterClient copy={enter} common={pages.common} />;
}
