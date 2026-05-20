"use client";

import Link from "next/link";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL, TITLE_BASE } from "../../lib/typography";

export function AboutClient() {
  const { locale, messages } = useI18n();
  const copy = messages.pages.about;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6 md:py-20">
      <header className="panel-surface p-6 sm:p-9">
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
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {copy.sections.map((section) => (
          <article key={section.title} className="panel-surface p-5 sm:p-6">
            <h2 className={TITLE_BASE}>{section.title}</h2>
            <p className={`mt-3 ${TEXT_SM_MUTED} leading-relaxed`}>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="panel-surface p-5 sm:p-6">
        <h2 className={TITLE_BASE}>{copy.principlesTitle}</h2>
        <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
          {copy.principles.map((principle) => (
            <li key={principle} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
