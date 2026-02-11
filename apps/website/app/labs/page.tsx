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
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:px-6 md:py-20">
      <div className="panel-surface p-6 sm:p-9">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-2 ${TITLE_2XL}`}>{copy.title}</h1>
        <p className={`mt-4 max-w-2xl ${TEXT_SM_MUTED} leading-relaxed`}>{copy.description}</p>
        <div className={`mt-6 flex flex-wrap items-center gap-5 ${TEXT_SM_MUTED}`}>
          <Link href="/enter" className="link-accent font-medium">
            {common.backToEnter}
          </Link>
          <Link href="/" className="link-muted font-medium">
            {common.backToHome}
          </Link>
        </div>
      </div>

      <TimestampTool locale={locale} />
    </main>
  );
}
