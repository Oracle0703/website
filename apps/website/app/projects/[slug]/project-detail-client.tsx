"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProjectAsset, ProjectView } from "../../../lib/projects";
import { useI18n } from "../../../components/language-provider";
import { getLocalePath } from "../../../lib/locale-routing";
import { TEXT_SM_MUTED, TITLE_2XL } from "../../../lib/typography";

function ListSection({
  title,
  items,
  id
}: {
  title: string;
  items: string[];
  id?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="panel-surface scroll-mt-24 p-5 sm:p-6">
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

function TextSection({
  title,
  children,
  id
}: {
  title: string;
  children: string;
  id?: string;
}) {
  return (
    <section id={id} className="panel-surface scroll-mt-24 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-secondary">{children}</p>
    </section>
  );
}

function EvidenceSection({
  title,
  items,
  id
}: {
  title: string;
  items: ProjectView["evidence"];
  id?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="panel-surface scroll-mt-24 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <article key={item.label} className="evidence-card">
            <p className="text-sm font-semibold text-primary">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssetSection({
  asset,
  copy,
  id
}: {
  asset: ProjectAsset;
  copy: ReturnType<typeof useI18n>["messages"]["pages"]["projects"];
  id?: string;
}) {
  const assetLabel = copy.assetKind[asset.kind];

  if (asset.kind === "none") {
    return (
      <section id={id} className="panel-surface scroll-mt-24 p-5 sm:p-6">
        <p className="section-kicker">{copy.assetUnavailableLabel}</p>
        <h2 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
          {copy.assetTitle}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="evidence-card">
            <p className="text-sm font-semibold text-primary">
              {copy.assetKindLabel}: {assetLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{asset.reason}</p>
          </article>
          <article className="evidence-card">
            <p className="text-sm font-semibold text-primary">{copy.nextAssetStepLabel}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{asset.nextAssetStep}</p>
          </article>
        </div>
      </section>
    );
  }

  if (asset.kind === "doc") {
    const isExternal = /^https?:\/\//.test(asset.href);

    return (
      <section id={id} className="panel-surface scroll-mt-24 p-5 sm:p-6">
        <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
        <h2 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
          {copy.assetTitle}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{asset.description}</p>
        <Link
          href={asset.href}
          className="mt-4 inline-flex btn-secondary"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {asset.label}
        </Link>
      </section>
    );
  }

  return (
    <section id={id} className="panel-surface scroll-mt-24 overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">{copy.assetKindLabel}: {assetLabel}</p>
          <h2 className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {copy.assetTitle}
          </h2>
        </div>
        <span className="rounded-full border border-edge-strong px-3 py-1 text-xs font-semibold text-secondary">
          {assetLabel}
        </span>
      </div>
      <figure className="mt-4">
        <div className="aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/40">
          <Image
            src={asset.src}
            alt={asset.alt}
            width={1280}
            height={720}
            sizes="(max-width: 1024px) 100vw, 768px"
            className={`h-full w-full ${asset.kind === "screenshot" ? "object-cover" : "object-contain p-2"}`}
          />
        </div>
        <figcaption className="mt-3 text-sm leading-6 text-muted">
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

  // In-page anchor nav — only sections that actually render are listed.
  const tocItems = [
    project.problem && { id: "problem", title: copy.problemTitle },
    project.solution && { id: "solution", title: copy.solutionTitle },
    { id: "asset", title: copy.assetTitle },
    project.role.length > 0 && { id: "role", title: copy.roleTitle },
    project.stack.length > 0 && { id: "stack", title: copy.stackTitle },
    project.highlights.length > 0 && { id: "highlights", title: copy.highlightsTitle },
    project.evidence.length > 0 && { id: "evidence", title: copy.evidenceTitle },
    project.architecture && { id: "architecture", title: copy.architectureTitle },
    project.tradeoffs.length > 0 && { id: "tradeoffs", title: copy.tradeoffsTitle },
    project.roadmap.length > 0 && { id: "roadmap", title: copy.roadmapTitle },
    project.limitations.length > 0 && { id: "limitations", title: copy.limitationsTitle },
    project.nextSteps.length > 0 && { id: "nextSteps", title: copy.nextStepsTitle }
  ].filter(Boolean) as Array<{ id: string; title: string }>;

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
        <div className="mt-6">
          <Link href={getHref("/contact")} className="btn-primary">
            {messages.pages.contact.title}
          </Link>
        </div>
      </header>

      {tocItems.length > 0 ? (
        <nav aria-label={copy.onThisPage} className="panel-surface p-4 sm:p-5">
          <p className={`mb-3 ${TEXT_SM_MUTED}`}>{copy.onThisPage}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="link-accent font-medium">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <TextSection id="problem" title={copy.problemTitle}>{project.problem}</TextSection>
        <TextSection id="solution" title={copy.solutionTitle}>{project.solution}</TextSection>
      </div>

      <AssetSection asset={project.asset} copy={copy} id="asset" />
      <ListSection id="role" title={copy.roleTitle} items={project.role} />
      <ListSection id="stack" title={copy.stackTitle} items={project.stack} />
      <ListSection id="highlights" title={copy.highlightsTitle} items={project.highlights} />
      <EvidenceSection id="evidence" title={copy.evidenceTitle} items={project.evidence} />
      <TextSection id="architecture" title={copy.architectureTitle}>{project.architecture}</TextSection>
      <ListSection id="tradeoffs" title={copy.tradeoffsTitle} items={project.tradeoffs} />
      <ListSection id="roadmap" title={copy.roadmapTitle} items={project.roadmap} />
      <ListSection id="limitations" title={copy.limitationsTitle} items={project.limitations} />
      <ListSection id="nextSteps" title={copy.nextStepsTitle} items={project.nextSteps} />
      <ProjectLinks project={project} title={copy.linksTitle} />

      <section className="panel-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-primary sm:text-2xl">{copy.relatedEntryTitle}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={getHref("/blog")} className="btn-secondary">
            {messages.pages.blog.title}
          </Link>
          <Link href={getHref("/contact")} className="btn-primary">
            {messages.pages.contact.title}
          </Link>
        </div>
      </section>

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
