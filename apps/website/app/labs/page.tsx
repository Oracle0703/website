import type { Metadata } from "next";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";
import { LabsClient } from "./labs-client";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.labsTitle,
    description: seo.labsDescription,
    alternates: getLanguageAlternates("/labs"),
    openGraph: {
      title: seo.labsTitle,
      description: seo.labsDescription,
      url: toAbsoluteUrl("/labs"),
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
