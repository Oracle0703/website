"use client";

import Link from "next/link";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import { getActiveProfileLinks } from "../../lib/site-links";
import { TEXT_SM_MUTED, TEXT_XS_MUTED, TITLE_2XL, TITLE_BASE } from "../../lib/typography";

export function AboutClient() {
  const { locale, messages } = useI18n();
  const copy = messages.pages.about;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);
  const profileLinks = getActiveProfileLinks();

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

      <section className="panel-surface bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 p-5 sm:p-6">
        <h2 className={TITLE_BASE}>{copy.connectTitle}</h2>
        <p className={`mt-3 max-w-2xl ${TEXT_SM_MUTED} leading-relaxed`}>{copy.connectDescription}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={getHref("/projects")} className="btn-primary">
            {copy.connectProjectsCta}
          </Link>
          <Link href={getHref("/contact")} className="btn-secondary">
            {copy.connectContactCta}
          </Link>
        </div>
        {profileLinks.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={TEXT_XS_MUTED}>{copy.connectLinksLabel}</span>
            {profileLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent text-sm font-semibold"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
