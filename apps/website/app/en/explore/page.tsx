import type { Metadata } from "next";
import { ExplorePage } from "../../explore/explore-page";
import type { Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";
const title = "Explore tools, work, and current builds";
const description = "Discover Meaningful · Ink tools, product prototypes, writing, project cases, and current work.";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: {
    ...getLanguageAlternates("/en/explore"),
    canonical: toAbsoluteUrl("/en/explore")
  },
  openGraph: { title, description, url: toAbsoluteUrl("/en/explore"), images: [toAbsoluteUrl("/og.png")] },
  twitter: { title, description, images: [toAbsoluteUrl("/og.png")] }
});

export default function Page() {
  return <ExplorePage locale={locale} />;
}
