import Image from "next/image";
import Link from "next/link";
import { RevealSection } from "../reveal-section";
import { getLocalePath } from "../../lib/locale-routing";
import type { Locale, Messages } from "../../lib/i18n";
import {
  EYEBROW_ACCENT,
  TEXT_BASE_SECONDARY,
  TEXT_SM_MUTED,
  TEXT_XS_MUTED,
  TITLE_BASE_SM_LG,
  TITLE_XL
} from "../../lib/typography";
import type { ProjectStatus, ProjectType } from "../../lib/projects";
import type {
  ChangelogCopy,
  ChangelogEntryView,
  ChangelogKind
} from "../../lib/changelog";

type HomeLatestBlogItem = {
  title: string;
  subtitle: string;
  date: string;
  href: string;
};

type HomeProjectAsset = {
  src: string;
  alt: string;
  caption: string;
};

type HomeProjectItem = {
  title: string;
  subtitle: string;
  status: ProjectStatus;
  type?: ProjectType;
  stack?: string[];
  evidence?: string;
  asset?: HomeProjectAsset;
  href: string;
};

type HomePageClientProps = {
  locale: Locale;
  copy: Messages["home"];
  common: Messages["pages"]["common"];
  projectStatusLabels: Messages["pages"]["projects"]["status"];
  latestBlogItems?: HomeLatestBlogItem[];
  latestChangelogItems?: ChangelogEntryView[];
  changelogCopy: ChangelogCopy["home"];
  changelogKindLabels: Record<ChangelogKind, string>;
  featuredProjects?: HomeProjectItem[];
};

function formatChangelogDate(releasedAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Shanghai"
  }).format(new Date(releasedAt));
}

export function HomePageClient({
  locale,
  copy,
  common,
  projectStatusLabels,
  latestBlogItems = [],
  latestChangelogItems = [],
  changelogCopy,
  changelogKindLabels,
  featuredProjects = []
}: HomePageClientProps) {
  const getHref = (href: string) => getLocalePath(href, locale);
  const flagshipProject = featuredProjects[0];
  const supportingProjects = featuredProjects.slice(1, 3);
  const latestBlogSectionItems =
    latestBlogItems.length > 0
      ? latestBlogItems.slice(0, 3)
      : copy.blogItems.slice(0, 3).map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
          date: item.date,
          href: "/blog"
        }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <section className="grid gap-10 pb-16 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:pb-20">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className={EYEBROW_ACCENT}>{copy.heroEyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-primary sm:text-5xl md:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className={`max-w-2xl ${TEXT_BASE_SECONDARY} text-lg leading-relaxed sm:text-xl`}>
              {copy.heroSubtitle}
            </p>
            <p className={`max-w-2xl ${TEXT_SM_MUTED} leading-7 sm:text-base`}>
              {copy.heroIntro}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href={getHref("/projects")} className="btn-primary px-5 py-3 sm:px-6">
              {copy.ctaProjects}
            </Link>
            <Link href={getHref("/contact")} className="btn-secondary px-5 py-3 sm:px-6">
              {copy.ctaContact}
            </Link>
            <Link
              href={getHref("/blog")}
              className="link-accent inline-flex items-center gap-2 px-1 py-3 text-sm font-semibold"
            >
              {copy.ctaBlog}
              <span aria-hidden>{common.arrowRight}</span>
            </Link>
          </div>
        </div>

        {flagshipProject ? (
          <Link
            href={getHref(flagshipProject.href)}
            className="feature-surface group block overflow-hidden"
          >
            {flagshipProject.asset ? (
              <div className="relative aspect-[16/10] overflow-hidden border-b border-edge/70 bg-surface">
                <Image
                  src={flagshipProject.asset.src}
                  alt={flagshipProject.asset.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 52vw, 100vw"
                  className="object-contain p-3 transition duration-500 group-hover:scale-[1.015]"
                />
              </div>
            ) : null}
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="section-kicker">{copy.currentFocusTitle}</p>
                <p className={TEXT_XS_MUTED}>{projectStatusLabels[flagshipProject.status]}</p>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                {flagshipProject.title}
              </h2>
              <p className={`mt-2 ${TEXT_SM_MUTED} leading-7`}>{flagshipProject.subtitle}</p>
              {flagshipProject.evidence ? (
                <p className="mt-5 border-l-2 border-accent pl-4 text-sm leading-6 text-secondary">
                  {flagshipProject.evidence}
                </p>
              ) : null}
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                {copy.currentFocusAction}
                <span aria-hidden>{common.arrowRight}</span>
              </span>
            </div>
          </Link>
        ) : (
          <div className="feature-surface p-6 sm:p-8">
            <p className="section-kicker">{copy.heroEvidenceTitle}</p>
            <div className="mt-5 divide-y divide-edge/70">
              {copy.heroEvidenceItems.map((item) => (
                <div key={item.label} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className={`mt-1 ${TEXT_SM_MUTED} leading-6`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {supportingProjects.length > 0 ? (
        <RevealSection className="section-plain py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={EYEBROW_ACCENT}>{copy.featuredProjectsTitle}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                {copy.featuredProjectsDescription}
              </h2>
            </div>
            <Link href={getHref("/projects")} className="link-accent text-sm font-semibold">
              {copy.viewAll} <span aria-hidden>{common.arrowRight}</span>
            </Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden border border-edge/70 bg-edge/70 md:grid-cols-2">
            {supportingProjects.map((project) => (
              <Link
                key={project.href}
                href={getHref(project.href)}
                className="group bg-base p-5 transition-colors hover:bg-surface sm:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="section-kicker">{projectStatusLabels[project.status]}</p>
                  {project.stack?.length ? (
                    <p className={TEXT_XS_MUTED}>{project.stack.slice(0, 2).join(" · ")}</p>
                  ) : null}
                </div>
                <h3 className={`mt-5 ${TITLE_BASE_SM_LG}`}>{project.title}</h3>
                <p className={`mt-2 ${TEXT_SM_MUTED} leading-6`}>{project.subtitle}</p>
                {project.evidence ? (
                  <p className="mt-5 border-t border-edge/70 pt-4 text-xs leading-6 text-secondary">
                    {project.evidence}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </RevealSection>
      ) : null}

      <RevealSection className="section-plain py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-[0.38fr_0.62fr] md:gap-14">
          <div>
            <p className={EYEBROW_ACCENT}>{copy.latestFallbackTitle}</p>
            <h2 className={`mt-2 ${TITLE_XL}`}>{copy.latestBlog}</h2>
            <Link href={getHref("/blog")} className="link-accent mt-5 inline-flex text-sm font-semibold">
              {copy.viewAll} <span className="ml-2" aria-hidden>{common.arrowRight}</span>
            </Link>
          </div>
          <div className="divide-y divide-edge/70 border-y border-edge/70">
            {latestBlogSectionItems.map((item) => (
              <Link
                key={`${item.href}-${item.title}`}
                href={getHref(item.href)}
                prefetch={false}
                className="group grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-5 sm:py-6"
              >
                <time className={TEXT_XS_MUTED}>{item.date}</time>
                <span>
                  <span className="block text-base font-semibold text-primary transition-colors group-hover:text-accent sm:text-lg">
                    {item.title}
                  </span>
                  <span className={`mt-1 block ${TEXT_SM_MUTED} leading-6`}>{item.subtitle}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      {latestChangelogItems.length > 0 ? (
        <RevealSection className="section-plain py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className={EYEBROW_ACCENT}>{changelogCopy.eyebrow}</p>
              <h2 className={`mt-2 ${TITLE_XL}`}>{changelogCopy.title}</h2>
              <p className={`mt-3 ${TEXT_SM_MUTED} leading-7`}>{changelogCopy.description}</p>
            </div>
            <Link href={getHref("/changelog")} className="link-accent text-sm font-semibold">
              {changelogCopy.viewAll} <span aria-hidden>{common.arrowRight}</span>
            </Link>
          </div>

          <ol className="mt-8 grid gap-px overflow-hidden border border-edge/70 bg-edge/70 md:grid-cols-3">
            {latestChangelogItems.slice(0, 3).map((entry) => (
              <li key={entry.id} className="bg-base">
                <Link
                  href={getHref(`/changelog#${entry.id}`)}
                  prefetch={false}
                  className="group flex h-full min-h-56 flex-col p-5 transition-colors hover:bg-surface sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <time dateTime={entry.releasedAt} className={TEXT_XS_MUTED}>
                      {formatChangelogDate(entry.releasedAt, locale)}
                    </time>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-secondary">
                      {changelogKindLabels[entry.kind]}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-primary transition-colors group-hover:text-accent">
                    {entry.title}
                  </h3>
                  <p className={`mt-3 ${TEXT_SM_MUTED} leading-6`}>{entry.summary}</p>
                  <span className="mt-auto pt-5 text-sm font-semibold text-secondary group-hover:text-accent">
                    {changelogCopy.viewEntry} <span aria-hidden>{common.arrowRight}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </RevealSection>
      ) : null}

      <RevealSection className="py-16 md:py-20">
        <div className="brand-banner grid gap-7 overflow-hidden p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end md:p-10">
          <div>
            <p className="section-kicker">{copy.contactEyebrow}</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {copy.contactTitle}
            </h2>
            <p className={`mt-3 max-w-2xl ${TEXT_SM_MUTED} leading-7`}>
              {copy.contactDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href={getHref(copy.currentFocusHref)} className="btn-secondary">
              {copy.currentFocusAction}
            </Link>
            <Link href={getHref("/contact")} className="btn-primary">
              {copy.contactAction}
            </Link>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
