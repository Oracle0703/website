import type { Metadata } from "next";
import { EnterClient } from "./enter-client";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.enterTitle,
    description: seo.enterDescription,
    alternates: {
      canonical: toAbsoluteUrl("/enter")
    },
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
