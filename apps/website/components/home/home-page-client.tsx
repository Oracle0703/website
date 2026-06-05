"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RevealSection } from "../reveal-section";
import { useI18n } from "../language-provider";
import { getLocalePath } from "../../lib/locale-routing";
import {
  TEXT_BASE_SECONDARY,
  TEXT_SM_SECONDARY,
  TEXT_SM_MUTED,
  TEXT_XS_MUTED,
  TITLE_BASE_SM_LG,
  TITLE_XL
} from "../../lib/typography";
import type { ProjectStatus, ProjectType } from "../../lib/projects";
import { ParticleTime } from "./particle-time";

type HomeLatestBlogItem = {
  title: string;
  subtitle: string;
  date: string;
  href: string;
};

type HomeProjectItem = {
  title: string;
  subtitle: string;
  status: ProjectStatus;
  type?: ProjectType;
  stack?: string[];
  href: string;
};

type HomeSeriesItem = {
  title: string;
  count: number;
  href: string;
};

type HomePageClientProps = {
  latestBlogItems?: HomeLatestBlogItem[];
  featuredProjects?: HomeProjectItem[];
  featuredSeries?: HomeSeriesItem[];
};

export function HomePageClient({
  latestBlogItems = [],
  featuredProjects = [],
  featuredSeries = []
}: HomePageClientProps) {
  const { locale, messages } = useI18n();
  const copy = messages.home;
  const common = messages.pages.common;
  const projectStatusLabels = messages.pages.projects.status;
  const getHref = (href: string) => getLocalePath(href, locale);
  const [isMounted, setIsMounted] = useState(false);
  const latestBlogSectionItems =
    latestBlogItems.length > 0
      ? latestBlogItems
      : copy.blogItems.map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
          date: item.date,
          href: "/blog"
        }));
  const featuredSeriesSectionItems = featuredSeries;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const heroMotion = (delayClass: string) =>
    [
      "transition-all duration-500 ease-out",
      delayClass,
      isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100"
    ].join(" ");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-12">
        <div className="space-y-7">
          <div className="space-y-4">
            <h1 className={`${heroMotion("delay-0")} text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl`}>
              {copy.heroTitle}
            </h1>
            <p className={`${heroMotion("delay-100")} max-w-2xl ${TEXT_BASE_SECONDARY} leading-relaxed sm:text-lg`}>
              {copy.heroSubtitle}
            </p>
            <p className={`${heroMotion("delay-200")} max-w-2xl ${TEXT_SM_SECONDARY} leading-relaxed sm:text-base`}>
              {copy.heroIntro}
            </p>
          </div>
          <div className={`flex flex-wrap gap-3 sm:gap-4 ${heroMotion("delay-300")}`}>
            <Link
              href={getHref("/projects")}
              className="btn-primary px-5 py-3 sm:px-6 sm:text-base"
            >
              {copy.ctaProjects}
            </Link>
            <Link
              href={getHref("/blog")}
              className="btn-secondary px-5 py-3 sm:px-6 sm:text-base"
            >
              {copy.ctaBlog}
            </Link>
          </div>
        </div>
        <div
          className={`${heroMotion(
            "delay-200"
          )} min-w-0 space-y-4`}
        >
          <div className="evidence-card bg-surface/70 backdrop-blur-sm">
            <ParticleTime />
            <p className="section-kicker mt-4">
              {copy.heroEvidenceTitle}
            </p>
          </div>
          <div className="grid gap-3">
            {copy.heroEvidenceItems.map((item) => (
              <article key={item.label} className="evidence-card">
                <p className="text-sm font-semibold text-primary">{item.label}</p>
                <p className={`mt-1 ${TEXT_SM_MUTED} leading-6`}>{item.value}</p>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className={TEXT_XS_MUTED}>{copy.primarySectionsLabel}</span>
            {copy.primarySections.map((item) => (
              <Link key={item.href} href={getHref(item.href)} className="link-accent font-semibold">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RevealSection className="mt-14 md:mt-16">
        <div className="panel-surface grid gap-5 p-5 sm:p-6 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className={TEXT_XS_MUTED}>{copy.currentFocusMeta}</p>
            <h2 className={`mt-2 ${TITLE_XL}`}>{copy.currentFocusTitle}</h2>
          </div>
          <div>
            <p className={`${TEXT_SM_MUTED} leading-7`}>{copy.currentFocusDescription}</p>
            <Link
              href={getHref(copy.currentFocusHref)}
              className="link-accent mt-4 inline-flex items-center gap-2 text-sm font-semibold"
            >
              {copy.currentFocusAction}
              <span aria-hidden>{common.arrowRight}</span>
            </Link>
          </div>
        </div>
      </RevealSection>

      {featuredProjects.length > 0 && (
        <RevealSection className="mt-16 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className={TITLE_XL}>{copy.featuredProjectsTitle}</h2>
              <p className={`mt-2 ${TEXT_SM_SECONDARY}`}>{copy.featuredProjectsDescription}</p>
            </div>
            <Link href={getHref("/projects")} className="text-sm font-medium text-muted hover:text-primary">
              {copy.viewAll}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.href}
                href={getHref(project.href)}
                className="group panel-surface card-interactive rounded-xl p-4 sm:p-5"
              >
                <p className={`${TEXT_XS_MUTED} group-hover:text-secondary`}>
                  {projectStatusLabels[project.status]}
                </p>
                <h3 className={`mt-2 ${TITLE_BASE_SM_LG}`}>{project.title}</h3>
                <p className={`mt-2 ${TEXT_SM_MUTED} group-hover:text-secondary`}>
                  {project.subtitle}
                </p>
                {project.stack && project.stack.length > 0 ? (
                  <p className={`mt-3 ${TEXT_SM_SECONDARY}`}>
                    {project.stack.slice(0, 2).join(" · ")}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </RevealSection>
      )}

      <RevealSection className="mt-16 md:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={TITLE_XL}>
              {featuredSeriesSectionItems.length > 0 ? copy.featuredSeriesTitle : copy.latestFallbackTitle}
            </h2>
            <p className={`mt-2 ${TEXT_SM_SECONDARY}`}>
              {featuredSeriesSectionItems.length > 0 ? copy.featuredSeriesDescription : copy.latestBlog}
            </p>
          </div>
          <Link href={getHref("/blog")} className="text-sm font-medium text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        {featuredSeriesSectionItems.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredSeriesSectionItems.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className="group panel-surface card-interactive rounded-xl p-4 sm:p-5"
              >
                <p className={`${TEXT_XS_MUTED} group-hover:text-secondary`}>
                  {item.count} {messages.pages.blog.seriesCountSuffix}
                </p>
                <h3 className={`mt-2 ${TITLE_BASE_SM_LG}`}>{item.title}</h3>
                <span className="mt-3 inline-flex text-sm font-semibold text-accent">
                  {messages.pages.blog.seriesFirstPost} {common.arrowRight}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {latestBlogSectionItems.map((item) => (
              <article
                key={item.title}
                className="group panel-surface card-interactive rounded-xl p-4 sm:p-5"
              >
                <p className={`${TEXT_XS_MUTED} group-hover:text-secondary`}>
                  {item.date}
                </p>
                <h3 className={`mt-2 ${TITLE_BASE_SM_LG}`}>
                  <Link href={getHref(item.href)} className="link-accent font-semibold">
                    {item.title}
                  </Link>
                </h3>
                <p className={`mt-1 ${TEXT_SM_MUTED} group-hover:text-secondary`}>
                  {item.subtitle}
                </p>
              </article>
            ))}
          </div>
        )}
      </RevealSection>

      <RevealSection className="mt-16 md:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={TITLE_XL}>{copy.labsTrackerTitle}</h2>
            <p className={`mt-2 ${TEXT_SM_SECONDARY}`}>{copy.labsTrackerDescription}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.entryCards.map((card) => (
            <Link
              key={card.title}
              href={getHref(card.href)}
              className="group panel-surface card-interactive p-5 sm:p-6"
            >
              <h3 className={TITLE_BASE_SM_LG}>
                {card.title}
              </h3>
              <p className={`mt-2 ${TEXT_SM_MUTED}`}>{card.subtitle}</p>
            </Link>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mt-16 grid gap-6 md:mt-20 md:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.trackerTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.trackerDesc}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-secondary sm:text-base">
            {copy.trackerPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 rounded-lg border border-edge/70 bg-surface/60 px-2.5 py-1.5 text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={getHref("/tracker")}
            className="link-accent mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            {copy.trackerEnter}
            <span aria-hidden>{common.arrowRight}</span>
          </Link>
        </div>
        <div className="panel-surface bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/20 p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.contactTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.contactDescription}</p>
          <div className={`mt-4 flex flex-wrap gap-2 ${TEXT_XS_MUTED}`}>
            {copy.skillTags.map((skill) => (
              <span key={skill} className="rounded-full border border-edge-strong bg-base/35 px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
          <Link
            href={getHref("/contact")}
            className="link-accent mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            {copy.contactAction}
            <span aria-hidden>{common.arrowRight}</span>
          </Link>
        </div>
      </RevealSection>
    </main>
  );
}
