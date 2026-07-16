"use client";

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

function AssetSection({
  asset,
  copy
}: {
  asset: ProjectAsset;
  copy: Messages["pages"]["projects"];
}) {
  const assetLabel = copy.assetKind[asset.kind];

  if (asset.kind === "none") {
    return (
      <section className="feature-surface flex min-h-72 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="section-kicker">{copy.assetUnavailableLabel}</p>
          <h2 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {copy.assetTitle}
          </h2>
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
      </section>
    );
  }

  if (asset.kind === "doc") {
    const isExternal = /^https?:\/\//.test(asset.href);

    return (
      <section className="feature-surface flex min-h-72 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
          <h2 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {copy.assetTitle}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">{asset.description}</p>
        </div>
        <Link
          href={asset.href}
          prefetch={false}
          className="mt-6 w-fit btn-secondary"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {asset.label}
        </Link>
      </section>
    );
  }

  return (
    <section className="feature-surface overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
        <div>
          <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
          <h2 className="mt-1 text-lg font-semibold text-primary">{copy.assetTitle}</h2>
        </div>
        <span className="rounded-full border border-edge-strong px-3 py-1 text-xs font-semibold text-secondary">
          {assetLabel}
        </span>
      </div>
      <figure>
        <div className="aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/50">
          <Image
            src={asset.src}
            alt={asset.alt}
            width={1280}
            height={720}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-contain"
          />
        </div>
        <figcaption className="px-2 pt-3 text-sm leading-6 text-muted">
          {asset.caption}
        </figcaption>
      </figure>
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
    <nav className="flex flex-wrap gap-3" aria-label={title}>
      {project.links.map((link, index) => {
        const isExternal = link.external ?? /^https?:\/\//.test(link.href);

        return (
          <Link
            key={`${link.label}-${link.href}`}
            href={link.href}
            prefetch={false}
            className={index === 0 ? "btn-primary" : "btn-secondary"}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
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
          <div className="mt-7">
            <ProjectLinks project={project} title={copy.linksTitle} />
          </div>
        </div>

        <AssetSection asset={project.asset} copy={copy} />
      </header>

      <EvidenceSection title={copy.evidenceTitle} items={project.evidence} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <TextSection title={copy.problemTitle}>{project.problem}</TextSection>
        <TextSection title={copy.solutionTitle}>{project.solution}</TextSection>
      </div>

      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        <ListSection title={copy.roleTitle} items={project.role} />
        <ListSection title={copy.stackTitle} items={project.stack} />
        <ListSection title={copy.highlightsTitle} items={project.highlights} />
      </div>

      <TextSection title={copy.architectureTitle}>{project.architecture}</TextSection>

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
