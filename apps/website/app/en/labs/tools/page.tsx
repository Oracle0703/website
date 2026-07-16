import type { Metadata } from "next";
import { DeveloperToolsPage } from "../../../labs/tools/developer-tools-page";
import type { Locale } from "../../../../lib/i18n";
import { getLanguageAlternates } from "../../../../lib/seo";
import { toAbsoluteUrl } from "../../../../lib/site-url";

const locale: Locale = "en";
const title = "Browser-native developer toolbox";
const description = "Process JSON, URL/Base64, UUID, SHA-256, and color contrast locally in your browser.";

export const generateMetadata = (): Metadata => ({
  title,
  description,
  alternates: {
    ...getLanguageAlternates("/en/labs/tools"),
    canonical: toAbsoluteUrl("/en/labs/tools")
  },
  openGraph: { title, description, url: toAbsoluteUrl("/en/labs/tools"), images: [toAbsoluteUrl("/og.png")] },
  twitter: { title, description, images: [toAbsoluteUrl("/og.png")] }
});

export default function Page() {
  return <DeveloperToolsPage locale={locale} />;
}
