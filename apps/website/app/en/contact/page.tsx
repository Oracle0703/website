import type { Metadata } from "next";
import { ContactClient } from "../../contact/contact-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.contactTitle,
    description: seo.contactDescription,
    alternates: {
      ...getLanguageAlternates("/en/contact"),
      canonical: toAbsoluteUrl("/en/contact")
    },
    openGraph: {
      title: seo.contactTitle,
      description: seo.contactDescription,
      url: toAbsoluteUrl("/en/contact"),
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
  return <ContactClient />;
}
