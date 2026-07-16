import type { Metadata } from "next";
import { ChangelogPage } from "../../changelog/changelog-page";
import type { Locale } from "../../../lib/i18n-core";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";
const title = "Website changelog";
const description = "Browse the Meaningful · Ink features, improvements, and fixes that are live and verifiable.";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: {
    ...getLanguageAlternates("/en/changelog"),
    canonical: toAbsoluteUrl("/en/changelog")
  },
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/en/changelog"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <ChangelogPage locale={locale} />;
}
