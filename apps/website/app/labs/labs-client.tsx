"use client";

import Link from "next/link";
import { getLocalePath } from "../../lib/locale-routing";
import type { Locale, Messages } from "../../lib/i18n";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../lib/typography";
import { TimestampTool } from "./timestamp-tool";

type LabsClientProps = {
  locale: Locale;
  copy: Messages["pages"]["labs"];
  common: Messages["pages"]["common"];
};

export function LabsClient({ locale, copy, common }: LabsClientProps) {
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:px-6 md:py-20">
      <div className="panel-surface p-6 sm:p-9">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-2 ${TITLE_2XL}`}>{copy.title}</h1>
        <p className={`mt-4 max-w-2xl ${TEXT_SM_MUTED} leading-relaxed`}>{copy.description}</p>
        <div className={`mt-6 flex flex-wrap items-center gap-5 ${TEXT_SM_MUTED}`}>
          <Link href={getHref("/enter")} className="link-accent font-medium">
            {common.backToEnter}
          </Link>
          <Link href={getHref("/")} className="link-muted font-medium">
            {common.backToHome}
          </Link>
        </div>
      </div>

      <section className="feature-surface grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="section-kicker">{copy.queryEyebrow}</p>
          <h2 className={`mt-2 ${TITLE_2XL}`}>{copy.queryTitle}</h2>
          <p className={`mt-3 max-w-2xl ${TEXT_SM_MUTED} leading-7`}>
            {copy.queryDescription}
          </p>
        </div>
        <Link href={getHref("/labs/query")} className="btn-primary md:mb-1">
          {copy.queryAction} <span aria-hidden="true">{common.arrowRight}</span>
        </Link>
      </section>

      <section className="feature-surface grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="section-kicker">{copy.toolsEyebrow}</p>
          <h2 className={`mt-2 ${TITLE_2XL}`}>{copy.toolsTitle}</h2>
          <p className={`mt-3 max-w-2xl ${TEXT_SM_MUTED} leading-7`}>
            {copy.toolsDescription}
          </p>
        </div>
        <Link href={getHref("/labs/tools")} className="btn-primary md:mb-1">
          {copy.toolsAction} <span aria-hidden="true">{common.arrowRight}</span>
        </Link>
      </section>

      <TimestampTool />
    </main>
  );
}
