import type { Metadata } from "next";
import { NowPage } from "./now-page";
import { defaultLocale } from "../../lib/i18n-core";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

const title = "现在";
const description =
  "Meaningful · Ink 的 Now 页面：记录当前建设方向、近期完成内容、正在学习的主题与下一步计划。";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: getLanguageAlternates("/now"),
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/now"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <NowPage locale={defaultLocale} />;
}
