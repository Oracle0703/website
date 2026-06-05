"use client";

import Link from "next/link";
import { useI18n } from "../components/language-provider";
import { getLocalePath } from "../lib/locale-routing";
import { TEXT_SM_MUTED, TEXT_SM_SECONDARY, TITLE_2XL } from "../lib/typography";

const SECONDARY_LINKS = ["/projects", "/blog", "/contact"];

export function NotFoundClient() {
  const { locale, messages } = useI18n();
  const copy = messages.notFound;
  const getHref = (href: string) => getLocalePath(href, locale);
  const secondaryLinks = messages.nav.items.filter((item) =>
    SECONDARY_LINKS.includes(item.href)
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 md:py-32">
      <p className="section-kicker">{copy.eyebrow}</p>
      <h1 className={`mt-3 ${TITLE_2XL}`}>{copy.title}</h1>
      <p className={`mt-4 max-w-xl ${TEXT_SM_SECONDARY} leading-relaxed`}>{copy.description}</p>
      <div className="mt-8">
        <Link href={getHref("/")} className="btn-primary">
          {copy.backHome}
        </Link>
      </div>
      <div
        className={`mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${TEXT_SM_MUTED}`}
      >
        {secondaryLinks.map((item) => (
          <Link key={item.href} href={getHref(item.href)} className="link-accent font-semibold">
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
