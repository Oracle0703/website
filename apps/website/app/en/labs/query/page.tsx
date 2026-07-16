import type { Metadata } from "next";
import { FreeQueryPage } from "../../../labs/query/free-query-page";
import { getMessages, type Locale } from "../../../../lib/i18n";
import { getLanguageAlternates } from "../../../../lib/seo";
import { toAbsoluteUrl } from "../../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.freeQueryTitle,
    description: seo.freeQueryDescription,
    alternates: {
      ...getLanguageAlternates("/en/labs/query"),
      canonical: toAbsoluteUrl("/en/labs/query")
    },
    openGraph: {
      title: seo.freeQueryTitle,
      description: seo.freeQueryDescription,
      url: toAbsoluteUrl("/en/labs/query"),
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
  const { pages } = getMessages(locale);

  return <FreeQueryPage locale={locale} copy={pages.freeQuery} />;
}
