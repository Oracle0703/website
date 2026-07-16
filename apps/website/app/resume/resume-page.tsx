import Link from "next/link";
import type { Locale } from "../../lib/i18n-core";
import { getLocalePath } from "../../lib/locale-routing";
import { getProjectViews } from "../../lib/projects";
import {
  getResumeNowCopy,
  profileUpdatedAt,
  resumeProjectSlugs
} from "../../lib/resume-now";
import { PrintResumeButton } from "./print-resume-button";

type ResumePageProps = {
  locale: Locale;
};

export function ResumePage({ locale }: ResumePageProps) {
  const copy = getResumeNowCopy(locale).resume;
  const evidenceProjects = getProjectViews(locale).filter((project) =>
    resumeProjectSlugs.some((slug) => slug === project.slug)
  );
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <>
      <main className="resume-page mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <header className="border-b border-edge/70 pb-10 md:pb-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="section-kicker">{copy.eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 text-sm font-semibold text-accent-secondary sm:text-base">
                {copy.role}
              </p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-secondary sm:text-lg">
                {copy.introduction}
              </p>
              <p className="resume-print-contact mt-4 hidden text-sm leading-6 text-secondary">
                Meaningful Ink / Oracle0703 · meaningful.ink/contact · github.com/Oracle0703
              </p>
            </div>
            <div className="resume-no-print flex flex-wrap gap-3 lg:max-w-64 lg:justify-end">
              <PrintResumeButton label={copy.printAction} />
              <Link href={getHref("/contact")} className="btn-primary">
                {copy.contactAction}
              </Link>
              <a
                href="https://github.com/Oracle0703"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {copy.githubAction}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <p className="mt-7 max-w-4xl border-l-2 border-edge-strong pl-4 text-xs leading-6 text-muted sm:text-sm">
            {copy.evidenceBoundary}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)]">
          <section aria-labelledby="resume-capabilities-title">
            <p className="section-kicker">01</p>
            <h2 id="resume-capabilities-title" className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
              {copy.capabilitiesTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {copy.capabilitiesDescription}
            </p>
            <div className="mt-7 divide-y divide-edge/70 border-y border-edge/70">
              {copy.capabilities.map((capability) => (
                <article key={capability.title} className="resume-print-card py-7 first:pt-6">
                  <h3 className="text-xl font-semibold text-primary">{capability.title}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary">
                    {capability.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label={capability.title}>
                    {capability.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="rounded-full border border-edge/80 bg-surface/60 px-3 py-1 text-xs text-muted"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-10">
            <section className="resume-print-card panel-surface p-5 sm:p-6" aria-labelledby="resume-stack-title">
              <p className="section-kicker">02</p>
              <h2 id="resume-stack-title" className="mt-2 text-xl font-semibold text-primary">
                {copy.stackTitle}
              </h2>
              <div className="mt-5 space-y-5">
                {copy.stackGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                      {group.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{group.items.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="resume-style-title">
              <p className="section-kicker">03</p>
              <h2 id="resume-style-title" className="mt-2 text-xl font-semibold text-primary">
                {copy.workingStyleTitle}
              </h2>
              <ul className="mt-5 divide-y divide-edge/70 border-y border-edge/70 text-sm leading-6 text-secondary">
                {copy.workingStyle.map((item) => (
                  <li key={item} className="flex gap-3 py-4">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <section className="mt-16 border-t border-edge/70 pt-12 md:mt-20 md:pt-16" aria-labelledby="resume-evidence-title">
          <div className="grid gap-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:items-end">
            <div>
              <p className="section-kicker">04</p>
              <h2 id="resume-evidence-title" className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
                {copy.evidenceTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted md:justify-self-end">
              {copy.evidenceDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {evidenceProjects.map((project) => (
              <article key={project.slug} className="resume-print-card panel-surface flex flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                  <span className="font-semibold text-accent-secondary">{copy.status[project.status]}</span>
                  <span>{project.stack.slice(0, 3).join(" · ")}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary">{project.title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{project.summary}</p>
                {project.evidence[0] ? (
                  <div className="mt-4 border-l-2 border-edge-strong pl-3 text-xs leading-5 text-muted">
                    <p className="font-semibold text-secondary">{project.evidence[0].label}</p>
                    <p className="mt-1">{project.evidence[0].value}</p>
                  </div>
                ) : null}
                <Link
                  href={getHref(`/projects/${encodeURIComponent(project.slug)}`)}
                  className="resume-no-print link-accent mt-auto pt-5 text-sm font-semibold"
                >
                  {copy.evidenceAction} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-print-card brand-banner mt-14 grid gap-6 p-6 sm:p-8 md:mt-20 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-10">
          <div>
            <p className="section-kicker">{copy.collaborationTitle}</p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-secondary">
              {copy.collaborationBody}
            </p>
            <p className="mt-4 text-xs text-muted">
              {copy.updatedLabel}: {profileUpdatedAt}
            </p>
          </div>
          <Link href={getHref("/contact")} className="resume-no-print btn-primary">
            {copy.collaborationAction}
          </Link>
        </section>
      </main>

      <style>{`
        @media print {
          @page { size: A4; margin: 13mm; }
          body { background: #fff !important; }
          body:has(.resume-page) .min-h-screen > header,
          body:has(.resume-page) .min-h-screen > footer,
          body:has(.resume-page) .min-h-screen > .skip-link,
          .resume-no-print { display: none !important; }
          .resume-print-contact { display: block !important; }
          .resume-page { max-width: none !important; padding: 0 !important; }
          .resume-page, .resume-page * {
            color: #171717 !important;
            border-color: #c9c9c9 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .resume-page .panel-surface,
          .resume-page .brand-banner,
          .resume-page [class*="bg-surface"] { background: transparent !important; }
          .resume-page .resume-print-card { break-inside: avoid; page-break-inside: avoid; }
          .resume-page a { text-decoration: none !important; }
        }
      `}</style>
    </>
  );
}
