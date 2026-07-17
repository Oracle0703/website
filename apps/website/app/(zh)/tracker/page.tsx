import type { Metadata } from "next";
import { defaultLocale, getMessages } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { TrackerClient } from "../../tracker/tracker-client";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.trackerTitle,
    description: seo.trackerDescription,
    alternates: getLanguageAlternates("/tracker"),
    openGraph: {
      title: seo.trackerTitle,
      description: seo.trackerDescription,
      url: toAbsoluteUrl("/tracker"),
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
  const { pages } = getMessages(defaultLocale);

  return <TrackerClient locale={defaultLocale} copy={pages.tracker} common={pages.common} />;
}
