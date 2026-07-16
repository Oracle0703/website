import type { Metadata } from "next";
import { TrackerClient } from "../../tracker/tracker-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.trackerTitle,
    description: seo.trackerDescription,
    alternates: {
      ...getLanguageAlternates("/en/tracker"),
      canonical: toAbsoluteUrl("/en/tracker")
    },
    openGraph: {
      title: seo.trackerTitle,
      description: seo.trackerDescription,
      url: toAbsoluteUrl("/en/tracker"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.trackerTitle,
      description: seo.trackerDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  const { pages } = getMessages(locale);

  return <TrackerClient locale={locale} copy={pages.tracker} common={pages.common} />;
}
