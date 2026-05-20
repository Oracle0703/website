import type { Metadata } from "next";
import { EnterClient } from "./enter-client";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.enterTitle,
    description: seo.enterDescription,
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
  return <EnterClient />;
}
