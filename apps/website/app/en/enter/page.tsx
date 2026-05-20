import type { Metadata } from "next";
import { EnterClient } from "../../enter/enter-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.enterTitle,
    description: seo.enterDescription,
    alternates: {
      ...getLanguageAlternates("/en/enter"),
      canonical: toAbsoluteUrl("/en/enter")
    },
    openGraph: {
      title: seo.enterTitle,
      description: seo.enterDescription,
      url: toAbsoluteUrl("/en/enter"),
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
