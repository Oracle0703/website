import type { Metadata } from "next";
import { defaultLocale, getMessages } from "../../../../lib/i18n";
import { getLanguageAlternates } from "../../../../lib/seo";
import { toAbsoluteUrl } from "../../../../lib/site-url";
import { FreeQueryPage } from "../../../labs/query/free-query-page";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.freeQueryTitle,
    description: seo.freeQueryDescription,
    alternates: getLanguageAlternates("/labs/query"),
    openGraph: {
      title: seo.freeQueryTitle,
      description: seo.freeQueryDescription,
      url: toAbsoluteUrl("/labs/query"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.freeQueryTitle,
      description: seo.freeQueryDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  const { pages } = getMessages(defaultLocale);

  return <FreeQueryPage locale={defaultLocale} copy={pages.freeQuery} />;
}
