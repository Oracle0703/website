import type { Metadata } from "next";
import { AIPageAnalysisLandingClient } from "../../../components/landing/ai-page-analysis-landing-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);
  const title = "AI Page Analysis and Redesign Assistant";
  const description =
    "A portfolio demo for turning URLs, screenshot notes, or product briefs into structured page diagnosis and redesign backlog.";

  return {
    title,
    description,
    alternates: {
      ...getLanguageAlternates("/en/ai-page-analysis"),
      canonical: toAbsoluteUrl("/en/ai-page-analysis")
    },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl("/en/ai-page-analysis"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title,
      description,
      images: [toAbsoluteUrl("/og.png")]
    },
    applicationName: seo.siteName
  };
};

export default function AIPageAnalysisPage() {
  return <AIPageAnalysisLandingClient locale="en" />;
}
