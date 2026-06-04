"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProjectAsset, ProjectView } from "../../../lib/projects";
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

function EvidenceSection({
  title,
  items
}: {
  title: string;
  items: ProjectView["evidence"];
}) {
  if (items.length === 0) return null;

  return (
    <section className="panel-surface p-5 sm:p-6">
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

function CaseStudySection({
  caseStudy,
  copy
}: {
  caseStudy: ProjectView["caseStudy"];
  copy: ReturnType<typeof useI18n>["messages"]["pages"]["projects"];
}) {
  const groups = [
    { title: copy.caseStudyConstraintsTitle, items: caseStudy.constraints },
    { title: copy.caseStudyDecisionsTitle, items: caseStudy.decisions },
    { title: copy.caseStudyImplementationTitle, items: caseStudy.implementation },
    { title: copy.caseStudyResultTitle, items: caseStudy.result },
    { title: copy.caseStudyNextTitle, items: caseStudy.next }
  ];

  return (
    <section className="panel-surface p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary sm:text-2xl">
        {copy.caseStudyTitle}
      </h2>
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-primary">
          {copy.caseStudyProblemTitle}
        </h3>
        <p className="mt-4 text-base leading-8 text-secondary">{caseStudy.problem}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <article key={group.title} className="evidence-card">
            <h3 className="text-sm font-semibold text-primary">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="text-sm leading-6 text-muted">
                  {item}
                </li>
              ))}
            </ul>
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
  copy: ReturnType<typeof useI18n>["messages"]["pages"]["projects"];
}) {
  const assetLabel = copy.assetKind[asset.kind];

  if (asset.kind === "none") {
    return (
      <section className="panel-surface p-5 sm:p-6">
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
      <section className="panel-surface p-5 sm:p-6">
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
    <section className="panel-surface overflow-hidden p-5 sm:p-6">
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
            className="h-full w-full object-cover"
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
      <EvidenceSection title={copy.evidenceTitle} items={project.evidence} />
      <AssetSection asset={project.asset} copy={copy} />
      <CaseStudySection caseStudy={project.caseStudy} copy={copy} />
      <TextSection title={copy.architectureTitle}>{project.architecture}</TextSection>
      <ListSection title={copy.tradeoffsTitle} items={project.tradeoffs} />
      <ListSection title={copy.roadmapTitle} items={project.roadmap} />
      <ListSection title={copy.limitationsTitle} items={project.limitations} />
      <ListSection title={copy.nextStepsTitle} items={project.nextSteps} />
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
