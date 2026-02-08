import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../lib/typography";
import { TimestampTool } from "./timestamp-tool";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.labsTitle,
    description: seo.labsDescription
  };
};

export default function Page() {
  const locale = getLocale();
  const { pages } = getMessages(locale);
  const copy = pages.labs;
  const common = pages.common;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-8">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-2 ${TITLE_2XL}`}>{copy.title}</h1>
        <p className={`mt-4 ${TEXT_SM_MUTED}`}>{copy.description}</p>
        <div className={`mt-6 flex gap-4 ${TEXT_SM_MUTED}`}>
          <Link href="/enter" className="text-accent hover:text-accent-strong">
            {common.backToEnter}
          </Link>
          <Link href="/" className="text-muted hover:text-primary">
            {common.backToHome}
          </Link>
        </div>
      </div>

      <TimestampTool locale={locale} />
    </main>
  );
}
