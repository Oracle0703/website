import Link from "next/link";
import type { Locale } from "../../lib/i18n-core";
import { getLocalePath } from "../../lib/locale-routing";
import { getResumeNowCopy, profileUpdatedAt } from "../../lib/resume-now";

type NowPageProps = {
  locale: Locale;
};

export function NowPage({ locale }: NowPageProps) {
  const copy = getResumeNowCopy(locale).now;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="grid gap-8 border-b border-edge/70 pb-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pb-14">
        <div>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-secondary sm:text-lg">
            {copy.introduction}
          </p>
        </div>
        <div className="rounded-xl border border-edge/80 bg-surface/55 px-5 py-4 text-sm md:min-w-56">
          <p className="font-semibold text-primary">{copy.updatedLabel}</p>
          <time className="mt-1 block text-accent-secondary" dateTime={profileUpdatedAt}>
            {profileUpdatedAt}
          </time>
          <p className="mt-3 max-w-64 text-xs leading-5 text-muted">{copy.snapshotNote}</p>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="now-current-title">
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1.58fr)]">
          <div>
            <p className="section-kicker">01</p>
            <h2 id="now-current-title" className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
              {copy.currentTitle}
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-edge/70 bg-edge/70">
            {copy.currentItems.map((item, index) => (
              <article key={item.title} className="grid gap-3 bg-base p-5 sm:p-6 md:grid-cols-[2.5rem_1fr]">
                <span className="text-xs font-semibold text-accent-secondary" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-edge/70 pt-12 md:mt-20 md:pt-16" aria-labelledby="now-shipped-title">
        <p className="section-kicker">02</p>
        <h2 id="now-shipped-title" className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
          {copy.shippedTitle}
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {copy.shippedItems.map((item) => (
            <article key={item.title} className="panel-surface p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-16 grid gap-12 border-t border-edge/70 pt-12 md:mt-20 md:grid-cols-2 md:pt-16">
        <section aria-labelledby="now-learning-title">
          <p className="section-kicker">03</p>
          <h2 id="now-learning-title" className="mt-2 text-2xl font-semibold text-primary">
            {copy.learningTitle}
          </h2>
          <ul className="mt-6 divide-y divide-edge/70 border-y border-edge/70 text-sm leading-7 text-secondary">
            {copy.learningItems.map((item) => (
              <li key={item} className="flex gap-3 py-4">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="now-next-title">
          <p className="section-kicker">04</p>
          <h2 id="now-next-title" className="mt-2 text-2xl font-semibold text-primary">
            {copy.nextTitle}
          </h2>
          <ol className="mt-6 divide-y divide-edge/70 border-y border-edge/70 text-sm leading-7 text-secondary">
            {copy.nextItems.map((item, index) => (
              <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-4">
                <span className="font-semibold text-accent-secondary" aria-hidden="true">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="brand-banner mt-14 p-6 sm:p-8 md:mt-20 md:p-10" aria-labelledby="now-links-title">
        <p className="section-kicker">{copy.linksTitle}</p>
        <h2 id="now-links-title" className="sr-only">{copy.linksTitle}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={getHref("/resume")} className="btn-primary">
            {copy.resumeAction}
          </Link>
          <Link href={getHref("/projects")} className="btn-secondary">
            {copy.projectsAction}
          </Link>
          <Link href={getHref("/contact")} className="btn-secondary">
            {copy.contactAction}
          </Link>
        </div>
      </section>
    </main>
  );
}
