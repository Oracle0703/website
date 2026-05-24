"use client";

import Link from "next/link";
import { useI18n } from "../../components/language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import type { ProjectView } from "../../lib/projects";
import { TEXT_SM_MUTED, TITLE_3XL } from "../../lib/typography";

type ProjectsClientProps = {
  projects: ProjectView[];
  featuredProjects: ProjectView[];
};

function ProjectCard({
  project,
  locale,
  copy
}: {
  project: ProjectView;
  locale: ReturnType<typeof useI18n>["locale"];
  copy: ReturnType<typeof useI18n>["messages"]["pages"]["projects"];
}) {
  const href = getLocalePath(`/projects/${encodeURIComponent(project.slug)}`, locale);
  const evidencePreview = project.evidence.slice(0, 2);
  const stackPreview = project.stack.slice(0, 3);

  return (
    <Link
      href={href}
      className="group card-interactive flex h-full flex-col rounded-2xl border border-edge bg-base/40 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-secondary">
        <span className="rounded-full border border-edge-strong px-2.5 py-1">
          {copy.status[project.status]}
        </span>
        <span className="rounded-full border border-edge px-2.5 py-1 text-muted">
          {copy.type[project.type]}
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-3">
        <h3 className="text-lg font-semibold leading-snug text-primary sm:text-xl">
          {project.title}
        </h3>
        <p className="text-sm leading-6 text-secondary sm:text-base sm:leading-7">
          {project.subtitle}
        </p>
        <p className="text-sm leading-6 text-muted">{project.summary}</p>
        {stackPreview.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {stackPreview.map((item) => (
              <span key={item} className="rounded-full border border-edge bg-surface/70 px-2 py-0.5 text-[11px] font-semibold text-muted">
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {evidencePreview.length > 0 ? (
          <div className="mt-1 space-y-2">
            {evidencePreview.map((item) => (
              <div key={item.label} className="rounded-lg border border-edge/70 bg-surface/50 px-3 py-2">
                <p className="text-xs font-semibold text-secondary">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-accent transition-colors group-hover:text-accent-strong">
          {copy.viewDetail}
        </span>
        <span className="text-xs text-muted">
          {copy.updatedAtLabel}: {project.updatedAt}
        </span>
      </div>
    </Link>
  );
}

export function ProjectsClient({ projects, featuredProjects }: ProjectsClientProps) {
  const { locale, messages } = useI18n();
  const copy = messages.pages.projects;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-14 sm:px-6 md:space-y-12 md:py-20">
      <header className="space-y-5">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`${TITLE_3XL} sm:text-4xl`}>{copy.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-secondary sm:text-lg">
          {copy.description}
        </p>
      </header>

      {projects.length === 0 ? (
        <section className="panel-surface p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold text-primary">{copy.emptyTitle}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{copy.emptyDescription}</p>
        </section>
      ) : (
        <>
          {featuredProjects.length > 0 && (
            <section className="panel-surface p-5 sm:p-6">
              <div className="max-w-3xl">
                <h2 className="text-xl font-semibold text-primary sm:text-2xl">
                  {copy.featuredTitle}
                </h2>
                <p className="mt-2 text-base leading-7 text-secondary">
                  {copy.featuredDescription}
                </p>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} locale={locale} copy={copy} />
                ))}
              </div>
            </section>
          )}

          <section className="panel-surface p-5 sm:p-6">
            <div className="max-w-3xl">
              <h2 className="text-xl font-semibold text-primary sm:text-2xl">
                {copy.allTitle}
              </h2>
              <p className="mt-2 text-base leading-7 text-secondary">
                {copy.allDescription}
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} locale={locale} copy={copy} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="panel-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-primary">{copy.backLinksTitle}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5 text-base text-muted">
          <Link href={getHref("/")} className="link-muted font-medium">
            {common.backToHome}
          </Link>
          <Link href={getHref("/blog")} className="link-accent font-medium">
            {messages.pages.blog.title}
          </Link>
          <Link href={getHref("/labs")} className="link-accent font-medium">
            {messages.pages.labs.title}
          </Link>
        </div>
      </section>
    </main>
  );
}
