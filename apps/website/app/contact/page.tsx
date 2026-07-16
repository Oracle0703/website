import type { Metadata } from "next";
import { ContactClient } from "./contact-client";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.contactTitle,
    description: seo.contactDescription,
    alternates: getLanguageAlternates("/contact"),
    openGraph: {
      title: seo.contactTitle,
      description: seo.contactDescription,
      url: toAbsoluteUrl("/contact"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.contactTitle,
      description: seo.contactDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  const { pages } = getMessages(defaultLocale);

  return <ContactClient locale={defaultLocale} copy={pages.contact} common={pages.common} />;
}
