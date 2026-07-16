"use client";

import Link from "next/link";
import { getLocalePath } from "../../lib/locale-routing";
import type { Locale, Messages } from "../../lib/i18n";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../lib/typography";

type AboutClientProps = {
  locale: Locale;
  copy: Messages["pages"]["about"];
  common: Messages["pages"]["common"];
};

export function AboutClient({ locale, copy, common }: AboutClientProps) {
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
          {copy.title}
        </h1>
        <p className={`mt-5 max-w-3xl ${TEXT_SM_MUTED} text-base leading-7 sm:text-lg`}>
          {copy.description}
        </p>
        <Link href={getHref("/")} className="link-muted mt-6 inline-flex text-sm font-medium">
          {common.backToHome}
        </Link>
      </header>

      <section className="grid gap-px border-b border-edge/70 bg-edge/70 md:grid-cols-3">
        {copy.sections.map((section, index) => (
          <article key={section.title} className="bg-base py-8 md:px-7 md:py-12 md:first:pl-0 md:last:pr-0">
            <p className="text-xs font-semibold text-accent-secondary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className={`mt-5 ${TITLE_2XL}`}>{section.title}</h2>
            <p className={`mt-4 ${TEXT_SM_MUTED} leading-7`}>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="brand-banner my-14 grid gap-7 p-6 sm:p-8 md:my-20 md:grid-cols-[0.42fr_0.58fr] md:p-10">
        <h2 className={TITLE_2XL}>{copy.principlesTitle}</h2>
        <ul className={`divide-y divide-edge/70 border-y border-edge/70 ${TEXT_SM_MUTED}`}>
          {copy.principles.map((principle) => (
            <li key={principle} className="flex gap-3 py-4 leading-7">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
