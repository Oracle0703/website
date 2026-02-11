import type { Metadata } from "next";
import { EnterClient } from "./enter-client";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.enterTitle,
    description: seo.enterDescription
  };
};

export default function EnterPage() {
  return <EnterClient />;
}
