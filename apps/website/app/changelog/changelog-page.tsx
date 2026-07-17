import Link from "next/link";
import {
  getChangelogCopy,
  getChangelogEntries,
  type ChangelogEntryView
} from "../../lib/changelog";
import type { Locale } from "../../lib/i18n-core";
import { getLocalePath } from "../../lib/locale-routing";

function formatReleaseDate(releasedAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Shanghai"
  }).format(new Date(releasedAt));
}

function ReleaseLinks({ entry, locale }: { entry: ChangelogEntryView; locale: Locale }) {
  const copy = getChangelogCopy(locale).page;

  if (entry.links.length === 0) return null;

  return (
    <div className="mt-7 border-t border-edge/70 pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {copy.relatedLinksTitle}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
        {entry.links.map((link) => {
          const isExternal = /^https?:\/\//.test(link.href);

          return isExternal ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent"
            >
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link
              key={link.href}
              href={getLocalePath(link.href, locale)}
              className="link-accent"
            >
              {link.label} <span aria-hidden="true">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ChangelogPage({ locale }: { locale: Locale }) {
  const entries = getChangelogEntries(locale);
  const copy = getChangelogCopy(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="grid gap-8 border-b border-edge/70 pb-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pb-14">
        <div className="max-w-4xl">
          <p className="section-kicker">{copy.page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-primary sm:text-5xl md:text-6xl">
            {copy.page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-secondary sm:text-lg">
            {copy.page.description}
          </p>
        </div>
        <div className="rounded-xl border border-edge/80 bg-surface/55 px-5 py-4 text-sm md:min-w-52">
          <p className="font-semibold text-primary">{copy.page.releaseCount}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-accent-secondary">
            {entries.length}
          </p>
        </div>
      </header>

      <ol className="mt-12 space-y-6 md:mt-16 md:space-y-8">
        {entries.map((entry) => {
          const titleId = `${entry.id}-title`;

          return (
            <li key={entry.id}>
              <article
                id={entry.id}
                aria-labelledby={titleId}
                className="scroll-mt-24 rounded-2xl border border-edge/80 bg-surface/45 p-5 sm:p-7 md:grid md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8 md:p-8"
              >
                <div className="flex items-center justify-between gap-4 md:block">
                  <time
                    dateTime={entry.releasedAt}
                    className="text-sm font-semibold text-secondary"
                  >
                    {formatReleaseDate(entry.releasedAt, locale)}
                  </time>
                  <p className="mt-0 text-xs font-semibold uppercase tracking-[0.12em] text-accent-secondary md:mt-3">
                    {copy.kindLabels[entry.kind]}
                  </p>
                </div>

                <div className="mt-6 md:mt-0">
                  <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                    {entry.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary sm:text-base">
                    {entry.summary}
                  </p>

                  <div className="mt-7">
                    <h3 className="text-sm font-semibold text-primary">{copy.page.highlightsTitle}</h3>
                    <ul className="mt-3 space-y-3 text-sm leading-7 text-muted">
                      {entry.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-3">
                          <span
                            className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                            aria-hidden="true"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ReleaseLinks entry={entry} locale={locale} />
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 border-t border-edge/70 pt-8 md:mt-16">
        <Link href={getLocalePath("/", locale)} className="link-accent text-sm font-semibold">
          <span aria-hidden="true">←</span> {copy.page.backToHome}
        </Link>
      </div>
    </main>
  );
}
