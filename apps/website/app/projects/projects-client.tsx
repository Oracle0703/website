import Image from "next/image";
import Link from "next/link";
import { getLocalePath } from "../../lib/locale-routing";
import type { Locale, Messages } from "../../lib/i18n";
import type { ProjectView } from "../../lib/projects";

type ProjectsClientProps = {
  archiveProjects: ProjectView[];
  featuredProjects: ProjectView[];
  locale: Locale;
  copy: Messages["pages"]["projects"];
  common: Messages["pages"]["common"];
  relatedLabels: {
    blog: string;
    labs: string;
  };
};

type ProjectsCopy = Messages["pages"]["projects"];
type ProjectsLocale = Locale;

function ProjectMeta({ project, copy }: { project: ProjectView; copy: ProjectsCopy }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span className="font-semibold text-secondary">{copy.status[project.status]}</span>
      <span aria-hidden="true">·</span>
      <span>{copy.type[project.type]}</span>
    </div>
  );
}

function ProjectAssetPreview({
  project,
  copy,
  priority = false,
  className = ""
}: {
  project: ProjectView;
  copy: ProjectsCopy;
  priority?: boolean;
  className?: string;
}) {
  const { asset } = project;

  if (asset.kind === "none") {
    return null;
  }

  if (asset.kind === "doc") {
    return (
      <div className={`flex min-h-40 flex-col justify-end bg-surface/70 p-5 ${className}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {copy.assetKind.doc}
        </p>
        <p className="mt-3 text-base font-semibold text-primary">{asset.label}</p>
        <p className="mt-2 text-sm leading-6 text-secondary">{asset.description}</p>
      </div>
    );
  }

  return (
    <figure className={`bg-surface/55 ${className}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 52vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transform-none"
        />
      </div>
      <figcaption className="border-t border-edge/60 px-4 py-3 text-xs leading-5 text-muted">
        {asset.caption}
      </figcaption>
    </figure>
  );
}

function FlagshipProject({
  project,
  locale,
  copy
}: {
  project: ProjectView;
  locale: ProjectsLocale;
  copy: ProjectsCopy;
}) {
  const href = getLocalePath(`/projects/${encodeURIComponent(project.slug)}`, locale);
  const evidence = project.evidence[0];
  const stackPreview = project.stack.slice(0, 4);

  return (
    <article>
      <Link
        href={href}
        prefetch={false}
        className="feature-surface group grid overflow-hidden transition-colors hover:border-edge-strong lg:grid-cols-[1.08fr_0.92fr]"
      >
        <ProjectAssetPreview
          project={project}
          copy={copy}
          priority
          className="border-b border-edge/70 lg:border-b-0 lg:border-r"
        />
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <ProjectMeta project={project} copy={copy} />
          <h3 className="mt-5 text-2xl font-semibold leading-tight text-primary sm:text-3xl">
            {project.title}
          </h3>
          <p className="mt-3 text-base leading-7 text-secondary sm:text-lg">
            {project.subtitle}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {project.summary}
          </p>
          {stackPreview.length > 0 ? (
            <p className="mt-5 text-xs font-medium leading-5 text-muted">
              {stackPreview.join(" · ")}
            </p>
          ) : null}
          {evidence ? (
            <div className="mt-5 border-l-2 border-accent/60 pl-4">
              <p className="text-xs font-semibold text-secondary">{evidence.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{evidence.value}</p>
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-accent transition-colors group-hover:text-accent-strong">
              {copy.viewDetail} →
            </span>
            <span className="text-xs text-muted">
              {copy.updatedAtLabel}: {project.updatedAt}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function SupportingFeaturedProject({
  project,
  locale,
  copy
}: {
  project: ProjectView;
  locale: ProjectsLocale;
  copy: ProjectsCopy;
}) {
  const href = getLocalePath(`/projects/${encodeURIComponent(project.slug)}`, locale);
  const evidence = project.evidence[0];
  const stackPreview = project.stack.slice(0, 3);

  return (
    <article className="h-full">
      <Link
        href={href}
        prefetch={false}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-edge bg-base/35 transition-colors hover:border-edge-strong hover:bg-base/55"
      >
        <ProjectAssetPreview
          project={project}
          copy={copy}
          className="border-b border-edge/70"
        />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <ProjectMeta project={project} copy={copy} />
          <h3 className="mt-4 text-xl font-semibold leading-snug text-primary">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-secondary">{project.subtitle}</p>
          {evidence ? (
            <div className="mt-4 border-l-2 border-edge-strong pl-3">
              <p className="text-xs font-semibold text-secondary">{evidence.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{evidence.value}</p>
            </div>
          ) : null}
          {stackPreview.length > 0 ? (
            <p className="mt-4 text-xs leading-5 text-muted">{stackPreview.join(" · ")}</p>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm">
            <span className="font-semibold text-accent transition-colors group-hover:text-accent-strong">
              {copy.viewDetail} →
            </span>
            <span className="text-xs text-muted">
              {copy.updatedAtLabel}: {project.updatedAt}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArchiveProjectRow({
  project,
  locale,
  copy
}: {
  project: ProjectView;
  locale: ProjectsLocale;
  copy: ProjectsCopy;
}) {
  const href = getLocalePath(`/projects/${encodeURIComponent(project.slug)}`, locale);
  const stackPreview = project.stack.slice(0, 3);

  return (
    <Link
      href={href}
      prefetch={false}
      className="group grid gap-4 py-5 transition-colors hover:text-primary sm:py-6 md:grid-cols-[minmax(0,1.7fr)_minmax(10rem,0.75fr)_auto] md:items-center"
    >
      <div className="min-w-0">
        <ProjectMeta project={project} copy={copy} />
        <h3 className="mt-2 text-lg font-semibold leading-snug text-primary sm:text-xl">
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">{project.summary}</p>
      </div>
      <p className="text-xs leading-5 text-muted">
        {stackPreview.length > 0 ? stackPreview.join(" · ") : project.subtitle}
      </p>
      <div className="flex items-center justify-between gap-4 text-xs text-muted md:justify-end">
        <span>
          {copy.updatedAtLabel}: {project.updatedAt}
        </span>
        <span
          aria-hidden="true"
          className="text-base text-accent transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
        >
          →
        </span>
      </div>
    </Link>
  );
}

export function ProjectsClient({
  archiveProjects,
  featuredProjects,
  locale,
  copy,
  common,
  relatedLabels
}: ProjectsClientProps) {
  const getHref = (href: string) => getLocalePath(href, locale);
  const [flagshipProject, ...supportingFeaturedProjects] = featuredProjects;
  const hasProjects = Boolean(flagshipProject) || archiveProjects.length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <header className="space-y-5 border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
          {copy.title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-secondary sm:text-lg">
          {copy.description}
        </p>
      </header>

      {!hasProjects ? (
        <section className="panel-surface p-6 text-center sm:p-8">
          <h2 className="text-xl font-semibold text-primary">{copy.emptyTitle}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{copy.emptyDescription}</p>
        </section>
      ) : (
        <>
          {flagshipProject ? (
            <section aria-labelledby="featured-projects-title">
              <div className="max-w-3xl">
                <h2
                  id="featured-projects-title"
                  className="text-xl font-semibold text-primary sm:text-2xl"
                >
                  {copy.featuredTitle}
                </h2>
                <p className="mt-2 text-base leading-7 text-secondary">
                  {copy.featuredDescription}
                </p>
              </div>
              <div className="mt-6">
                <FlagshipProject project={flagshipProject} locale={locale} copy={copy} />
              </div>
              {supportingFeaturedProjects.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {supportingFeaturedProjects.map((project) => (
                    <SupportingFeaturedProject
                      key={project.slug}
                      project={project}
                      locale={locale}
                      copy={copy}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {archiveProjects.length > 0 ? (
            <section aria-labelledby="project-archive-title">
              <div className="max-w-3xl">
                <h2
                  id="project-archive-title"
                  className="text-xl font-semibold text-primary sm:text-2xl"
                >
                  {copy.allTitle}
                </h2>
                <p className="mt-2 text-base leading-7 text-secondary">
                  {copy.allDescription}
                </p>
              </div>
              <div className="mt-5 divide-y divide-edge/70 border-y border-edge/70">
                {archiveProjects.map((project) => (
                  <ArchiveProjectRow
                    key={project.slug}
                    project={project}
                    locale={locale}
                    copy={copy}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <section className="border-t border-edge/70 pt-8">
        <h2 className="text-lg font-semibold text-primary">{copy.backLinksTitle}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5 text-base text-muted">
          <Link href={getHref("/")} className="link-muted font-medium">
            {common.backToHome}
          </Link>
          <Link href={getHref("/blog")} className="link-accent font-medium">
            {relatedLabels.blog}
          </Link>
          <Link href={getHref("/labs")} className="link-accent font-medium">
            {relatedLabels.labs}
          </Link>
        </div>
      </section>
    </main>
  );
}
