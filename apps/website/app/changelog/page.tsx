import type { Metadata } from "next";
import { defaultLocale } from "../../lib/i18n-core";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";
import { ChangelogPage } from "./changelog-page";

const title = "网站更新日志";
const description = "查看 Meaningful · Ink 已经上线并可以验证的功能、改进与修复。";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: getLanguageAlternates("/changelog"),
  openGraph: {
    title,
    description,
    url: toAbsoluteUrl("/changelog"),
    images: [toAbsoluteUrl("/og.png")]
  },
  twitter: {
    title,
    description,
    images: [toAbsoluteUrl("/og.png")]
  }
});

export default function Page() {
  return <ChangelogPage locale={defaultLocale} />;
}
