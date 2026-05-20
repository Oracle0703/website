import type { Metadata } from "next";
import { LabsClient } from "../../labs/labs-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.labsTitle,
    description: seo.labsDescription,
    alternates: {
      ...getLanguageAlternates("/en/labs"),
      canonical: toAbsoluteUrl("/en/labs")
    },
    openGraph: {
      title: seo.labsTitle,
      description: seo.labsDescription,
      url: toAbsoluteUrl("/en/labs"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.labsTitle,
      description: seo.labsDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  return <LabsClient />;
}
