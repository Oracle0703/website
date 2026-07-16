import type { Metadata } from "next";
import { defaultLocale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { DeveloperToolsPage } from "./developer-tools-page";

const title = "浏览器端开发者工具箱";
const description = "在浏览器本地完成 JSON、URL/Base64、UUID、SHA-256 与颜色对比度处理。";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: getLanguageAlternates("/labs/tools"),
  openGraph: { title, description, url: toAbsoluteUrl("/labs/tools"), images: [toAbsoluteUrl("/og.png")] },
  twitter: { title, description, images: [toAbsoluteUrl("/og.png")] }
});

export default function Page() {
  return <DeveloperToolsPage locale={defaultLocale} />;
}
