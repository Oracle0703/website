import Image from "next/image";
import Link from "next/link";
import type { Locale, Messages } from "../../../lib/i18n";
import type { ProjectAsset, ProjectView } from "../../../lib/projects";
import { getLocalePath } from "../../../lib/locale-routing";

function ListSection({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-edge/70 pt-5">
      <h2 className="text-lg font-semibold text-primary sm:text-xl">{title}</h2>
      <ul className="mt-3 divide-y divide-edge/60 border-b border-edge/60">
        {items.map((item) => (
          <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-secondary">
            <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TextSection({ title, children }: { title: string; children: string }) {
  return (
    <section className="border-t border-edge/70 pt-5">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <p className="mt-3 text-base leading-8 text-secondary">{children}</p>
    </section>
  );
}

function EvidenceSection({
  title,
  items
}: {
  title: string;
  items: ProjectView["evidence"];
}) {
  if (items.length === 0) return null;

  return (
    <section className="section-plain pt-8">
      <h2 className="section-kicker">{title}</h2>
      <div className="mt-5 grid border-y border-edge/70 sm:grid-cols-3 sm:divide-x sm:divide-edge/70">
        {items.map((item) => (
          <article
            key={item.label}
            className="border-t border-edge/60 py-5 first:border-t-0 sm:border-t-0 sm:px-5 sm:first:pl-0 sm:last:pr-0"
          >
            <h3 className="text-sm font-semibold text-primary">{item.label}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectAssetCard({
  asset,
  copy,
  locale
}: {
  asset: ProjectAsset;
  copy: Messages["pages"]["projects"];
  locale: Locale;
}) {
  const assetLabel = copy.assetKind[asset.kind];

  if (asset.kind === "none") {
    return (
      <article className="feature-surface flex min-h-64 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="section-kicker">{copy.assetUnavailableLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-primary">{assetLabel}</h3>
        </div>
        <dl className="mt-8 divide-y divide-edge/70 border-y border-edge/70">
          <div className="py-4">
            <dt className="text-sm font-semibold text-primary">
              {copy.assetKindLabel}: {assetLabel}
            </dt>
            <dd className="mt-2 text-sm leading-6 text-muted">{asset.reason}</dd>
          </div>
          <div className="py-4">
            <dt className="text-sm font-semibold text-primary">{copy.nextAssetStepLabel}</dt>
            <dd className="mt-2 text-sm leading-6 text-muted">{asset.nextAssetStep}</dd>
          </div>
        </dl>
      </article>
    );
  }

  if (asset.kind === "doc") {
    const isExternal = /^https?:\/\//.test(asset.href);
    const href = isExternal ? asset.href : getLocalePath(asset.href, locale);

    return (
      <article className="feature-surface flex min-h-64 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
          <h3 className="mt-2 text-xl font-semibold text-primary">{asset.label}</h3>
          <p className="mt-4 text-sm leading-6 text-muted">{asset.description}</p>
        </div>
        <Link
          href={href}
          prefetch={false}
          className="mt-6 w-fit btn-secondary"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {asset.label}
        </Link>
      </article>
    );
  }

  const isDiagram = asset.kind === "diagram";

  return (
    <figure
      className={`feature-surface overflow-hidden p-4 sm:p-5 ${isDiagram ? "lg:col-span-2" : ""}`}
      data-project-asset-kind={asset.kind}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
        <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-edge-strong px-3 py-1 text-xs font-semibold text-secondary">
            {assetLabel}
          </span>
          {isDiagram ? (
            <a
              href={asset.src}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              data-testid="project-diagram-full-size-link"
            >
              {copy.openFullSizeDiagram}
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/50">
        <Image
          src={asset.src}
          alt={asset.alt}
          width={1280}
          height={720}
          sizes={
            isDiagram
              ? "(max-width: 1024px) 100vw, 72rem"
              : "(max-width: 1024px) 100vw, 50vw"
          }
          className="h-full w-full object-contain"
        />
      </div>
      <figcaption className="px-2 pt-3 text-sm leading-6 text-muted">
        {asset.caption}
      </figcaption>
    </figure>
  );
}

function ProjectAssetGallery({
  assets,
  copy,
  locale
}: {
  assets: ProjectAsset[];
  copy: Messages["pages"]["projects"];
  locale: Locale;
}) {
  if (assets.length === 0) return null;

  return (
    <section aria-labelledby="project-evidence-gallery-title">
      <div className="max-w-3xl">
        <p className="section-kicker">{copy.assetTitle}</p>
        <h2
          id="project-evidence-gallery-title"
          className="mt-2 text-2xl font-semibold text-primary sm:text-3xl"
        >
          {copy.evidenceGalleryTitle}
        </h2>
        <p className="mt-3 text-base leading-7 text-secondary">
          {copy.evidenceGalleryDescription}
        </p>
      </div>
      <div
        className="mt-6 grid gap-5 lg:grid-cols-2"
        data-testid="project-asset-gallery-grid"
      >
        {assets.map((asset, index) => {
          const key = asset.kind === "doc"
            ? `${asset.kind}-${asset.href}`
            : asset.kind === "none"
              ? `${asset.kind}-${index}`
              : `${asset.kind}-${asset.src}`;

          return (
            <ProjectAssetCard
              key={key}
              asset={asset}
              copy={copy}
              locale={locale}
            />
          );
        })}
      </div>
    </section>
  );
}

function ArchitectureDiagram({
  project,
  copy
}: {
  project: ProjectView;
  copy: Messages["pages"]["projects"];
}) {
  return (
    <section className="section-plain pt-8" aria-labelledby="project-architecture-title">
      <h2
        id="project-architecture-title"
        className="text-2xl font-semibold text-primary sm:text-3xl"
      >
        {copy.architectureTitle}
      </h2>
      <p className="mt-3 max-w-4xl text-base leading-8 text-secondary">
        {project.architecture}
      </p>
      <ol className="mt-7 flex flex-col gap-3 xl:flex-row">
        {project.architectureSteps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-3 xl:flex-row">
            <article className="h-full w-full rounded-2xl border border-edge bg-surface/65 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {copy.architectureStepLabel} {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-base font-semibold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
            </article>
            {index < project.architectureSteps.length - 1 ? (
              <span
                aria-hidden="true"
                className="shrink-0 rotate-90 text-xl font-semibold text-accent xl:rotate-0"
              >
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function DecisionSection({
  project,
  copy
}: {
  project: ProjectView;
  copy: Messages["pages"]["projects"];
}) {
  if (project.decisions.length === 0) return null;

  return (
    <section aria-labelledby="project-decisions-title">
      <h2 id="project-decisions-title" className="text-2xl font-semibold text-primary sm:text-3xl">
        {copy.decisionsTitle}
      </h2>
      <ol className="mt-6 grid gap-5 lg:grid-cols-3">
        {project.decisions.map((item, index) => (
          <li key={`${item.decision}-${index}`} className="rounded-2xl border border-edge bg-surface/55 p-5 sm:p-6">
            <p className="section-kicker">
              {copy.decisionLabel} {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 text-lg font-semibold leading-7 text-primary">{item.decision}</h3>
            <dl className="mt-5 divide-y divide-edge/70 border-y border-edge/70">
              <div className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  {copy.rationaleLabel}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{item.rationale}</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  {copy.impactLabel}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{item.impact}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProjectEntryPanel({
  project,
  copy,
  locale
}: {
  project: ProjectView;
  copy: Messages["pages"]["projects"];
  locale: Locale;
}) {
  const { demo, source } = project.entry;
  const demoIsExternal = demo.status === "available"
    ? demo.external ?? /^https?:\/\//.test(demo.href)
    : false;

  return (
    <section className="feature-surface flex min-h-72 flex-col p-6 sm:p-7" aria-labelledby="project-entry-title">
      <p className="section-kicker">{copy.entryEyebrow}</p>
      <h2 id="project-entry-title" className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
        {copy.entryTitle}
      </h2>

      <div className="mt-6 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          {demo.status === "available" ? copy.demoAvailableLabel : copy.demoUnavailableLabel}
        </p>
        {demo.status === "available" ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">{demo.description}</p>
            <Link
              href={demoIsExternal ? demo.href : getLocalePath(demo.href, locale)}
              prefetch={false}
              className="mt-5 btn-primary"
              target={demoIsExternal ? "_blank" : undefined}
              rel={demoIsExternal ? "noreferrer" : undefined}
            >
              {demo.label}
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">{demo.reason}</p>
        )}
      </div>

      <div className="mt-7 border-t border-edge/70 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          {copy.sourceEntryLabel}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{source.description}</p>
        <div className="mt-4">
          <Link
            href={source.href}
            prefetch={false}
            className="btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            {source.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

type ProjectDetailClientProps = {
  locale: Locale;
  copy: Messages["pages"]["projects"];
  common: Messages["pages"]["common"];
  relatedLabels: {
    blog: string;
    contact: string;
  };
  project: ProjectView;
};

export function ProjectDetailClient({
  locale,
  copy,
  common,
  relatedLabels,
  project
}: ProjectDetailClientProps) {
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-14 px-4 py-14 sm:px-6 md:space-y-20 md:py-20">
      <header className="grid items-center gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:gap-14">
        <div>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-primary sm:text-5xl md:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 text-xl leading-8 text-secondary">{project.subtitle}</p>

          <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-edge/70 py-4 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted">{copy.statusLabel}</dt>
              <dd className="font-semibold text-accent">{copy.status[project.status]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted">{copy.typeLabel}</dt>
              <dd className="font-semibold text-primary">{copy.type[project.type]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted">{copy.updatedAtLabel}</dt>
              <dd className="font-semibold text-primary">
                <time dateTime={project.updatedAt}>{project.updatedAt}</time>
              </dd>
            </div>
          </dl>

          <p className="mt-6 max-w-2xl text-base leading-8 text-secondary">{project.summary}</p>
        </div>

        <ProjectEntryPanel project={project} copy={copy} locale={locale} />
      </header>

      <EvidenceSection title={copy.evidenceTitle} items={project.evidence} />

      <ProjectAssetGallery
        assets={[project.asset, ...project.gallery]}
        copy={copy}
        locale={locale}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <TextSection title={copy.problemTitle}>{project.problem}</TextSection>
        <TextSection title={copy.solutionTitle}>{project.solution}</TextSection>
      </div>

      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        <ListSection title={copy.roleTitle} items={project.role} />
        <ListSection title={copy.stackTitle} items={project.stack} />
        <ListSection title={copy.highlightsTitle} items={project.highlights} />
      </div>

      <ArchitectureDiagram project={project} copy={copy} />

      <DecisionSection project={project} copy={copy} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ListSection title={copy.tradeoffsTitle} items={project.tradeoffs} />
        <ListSection title={copy.roadmapTitle} items={project.roadmap} />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ListSection title={copy.limitationsTitle} items={project.limitations} />
        <ListSection title={copy.nextStepsTitle} items={project.nextSteps} />
      </div>

      <section className="brand-banner grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="section-kicker">{copy.backLinksTitle}</p>
          <h2 className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
            {copy.relatedEntryTitle}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={getHref("/blog")} className="btn-secondary">
            {relatedLabels.blog}
          </Link>
          <Link href={getHref("/contact")} className="btn-primary">
            {relatedLabels.contact}
          </Link>
        </div>
      </section>

      <nav
        className="flex flex-wrap items-center gap-5 border-t border-edge/70 pt-6 text-base"
        aria-label={copy.backLinksTitle}
      >
        <Link href={getHref("/projects")} className="link-accent font-medium">
          {copy.backToProjects}
        </Link>
        <Link href={getHref("/")} className="link-muted font-medium">
          {common.backToHome}
        </Link>
      </nav>
    </main>
  );
}
