"use client";

import Link from "next/link";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../lib/typography";
import { TimestampTool } from "./timestamp-tool";

export function LabsClient() {
  const { locale, messages } = useI18n();
  const copy = messages.pages.labs;
  const common = messages.pages.common;
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

      <TimestampTool />
    </main>
  );
}
