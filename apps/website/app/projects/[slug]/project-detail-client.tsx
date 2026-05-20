"use client";

import Link from "next/link";
import type { ProjectView } from "../../../lib/projects";
import { useI18n } from "../../../components/language-provider";
import { getLocalePath } from "../../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../../lib/typography";

function ListSection({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="panel-surface p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-edge bg-base/40 px-4 py-3 text-sm leading-6 text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TextSection({ title, children }: { title: string; children: string }) {
  return (
    <section className="panel-surface p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-secondary">{children}</p>
    </section>
  );
}

function ProjectLinks({
  project,
  title
}: {
  project: ProjectView;
  title: string;
}) {
  if (project.links.length === 0) return null;

  return (
    <section className="panel-surface p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {project.links.map((link) => {
          const isExternal = link.external ?? /^https?:\/\//.test(link.href);
          return (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="card-interactive rounded-xl border border-edge bg-base/40 px-4 py-3 text-sm font-semibold text-accent"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ProjectDetailClient({ project }: { project: ProjectView }) {
  const { locale, messages } = useI18n();
  const copy = messages.pages.projects;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-14 sm:px-6 md:space-y-10 md:py-20">
      <header className="panel-surface p-6 sm:p-9">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={`mt-3 ${TITLE_2XL}`}>{project.title}</h1>
        <p className="mt-3 text-lg leading-8 text-secondary">{project.subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-secondary">
          <span className="rounded-full border border-edge-strong px-2.5 py-1">
            {copy.statusLabel}: {copy.status[project.status]}
          </span>
          <span className="rounded-full border border-edge px-2.5 py-1 text-muted">
            {copy.typeLabel}: {copy.type[project.type]}
          </span>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-8 text-secondary">
          {project.summary}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <TextSection title={copy.problemTitle}>{project.problem}</TextSection>
        <TextSection title={copy.solutionTitle}>{project.solution}</TextSection>
      </div>

      <ListSection title={copy.roleTitle} items={project.role} />
      <ListSection title={copy.stackTitle} items={project.stack} />
      <ListSection title={copy.highlightsTitle} items={project.highlights} />
      <ListSection title={copy.limitationsTitle} items={project.limitations} />
      <ListSection title={copy.nextStepsTitle} items={project.nextSteps} />
      <ProjectLinks project={project} title={copy.linksTitle} />

      <div className="flex flex-wrap items-center gap-5 text-lg text-muted">
        <Link href={getHref("/projects")} className="link-accent font-medium">
          {copy.backToProjects}
        </Link>
        <Link href={getHref("/")} className="link-muted font-medium">
          {common.backToHome}
        </Link>
      </div>
    </main>
  );
}
