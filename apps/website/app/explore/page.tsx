import type { Metadata } from "next";
import { defaultLocale } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";
import { ExplorePage } from "./explore-page";

const title = "探索工具、作品与当前建设";
const description = "集中发现 Meaningful · Ink 的工具、产品原型、文章、项目案例与个人动态。";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: getLanguageAlternates("/explore"),
  openGraph: { title, description, url: toAbsoluteUrl("/explore"), images: [toAbsoluteUrl("/og.png")] },
  twitter: { title, description, images: [toAbsoluteUrl("/og.png")] }
});

export default function Page() {
  return <ExplorePage locale={defaultLocale} />;
}
