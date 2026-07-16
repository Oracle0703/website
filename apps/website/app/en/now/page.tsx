import type { Metadata } from "next";
import { NowPage } from "../../now/now-page";
import type { Locale } from "../../../lib/i18n-core";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";
const title = "Now";
const description =
  "The current Meaningful · Ink snapshot: active build directions, recently completed work, learning themes, and next decisions.";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: {
    ...getLanguageAlternates("/en/now"),
    canonical: toAbsoluteUrl("/en/now")
  },
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/en/now"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <NowPage locale={locale} />;
}
