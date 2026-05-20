"use client";

import Link from "next/link";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL, TITLE_BASE } from "../../lib/typography";

export function ContactClient() {
  const { locale, messages } = useI18n();
  const copy = messages.pages.contact;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6 md:py-20">
      <header className="panel-surface p-6 sm:p-9">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-2 ${TITLE_2XL}`}>{copy.title}</h1>
        <p className={`mt-4 max-w-2xl ${TEXT_SM_MUTED} leading-relaxed`}>{copy.description}</p>
        <div className={`mt-6 flex flex-wrap items-center gap-5 ${TEXT_SM_MUTED}`}>
          <Link href={getHref("/projects")} className="link-accent font-medium">
            {copy.primaryAction}
          </Link>
          <Link href={getHref("/blog")} className="link-muted font-medium">
            {copy.secondaryAction}
          </Link>
        </div>
        <div className={`mt-6 flex flex-wrap items-center gap-5 ${TEXT_SM_MUTED}`}>
          <Link href={getHref("/enter")} className="link-accent font-medium">
            {common.backToEnter}
          </Link>
          <Link href={getHref("/")} className="link-muted font-medium">
            {common.backToHome}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_BASE}>{copy.collaborationTitle}</h2>
          <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
            {copy.collaborationAreas.map((area) => (
              <li key={area} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_BASE}>{copy.boundariesTitle}</h2>
          <ul className={`mt-4 space-y-3 ${TEXT_SM_MUTED}`}>
            {copy.boundaries.map((boundary) => (
              <li key={boundary} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{boundary}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
