import type { Metadata } from "next";
import { ResumePage } from "./resume-page";
import { defaultLocale } from "../../lib/i18n-core";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

const title = "能力简历";
const description =
  "Meaningful · Ink 的能力型简历：以公开项目为证据，呈现 AI 产品、全栈 Web 实现与工程交付能力。";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: getLanguageAlternates("/resume"),
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/resume"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <ResumePage locale={defaultLocale} />;
}
