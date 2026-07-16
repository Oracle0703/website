import type { Metadata } from "next";
import { ResumePage } from "../../resume/resume-page";
import type { Locale } from "../../../lib/i18n-core";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";
const title = "Capability Resume";
const description =
  "A capability-based resume for Meaningful · Ink, grounded in public AI product, full-stack web, and engineering delivery evidence.";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: {
    ...getLanguageAlternates("/en/resume"),
    canonical: toAbsoluteUrl("/en/resume")
  },
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/en/resume"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <ResumePage locale={locale} />;
}
