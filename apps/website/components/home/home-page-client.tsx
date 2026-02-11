"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RevealSection } from "../reveal-section";
import { useI18n } from "../language-provider";
import {
  TEXT_BASE_SECONDARY,
  TEXT_SM_MUTED,
  TEXT_XS_MUTED,
  TEXT_XS_SUBTLE,
  TITLE_BASE_SM_LG,
  TITLE_XL
} from "../../lib/typography";
import { ParticleTime } from "./particle-time";

export function HomePageClient() {
  const { messages } = useI18n();
  const copy = messages.home;
  const common = messages.pages.common;
  const [isMounted, setIsMounted] = useState(false);

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
            <p className={`${heroMotion("delay-200")} max-w-2xl ${TEXT_SM_MUTED} leading-relaxed sm:text-base`}>
              {copy.heroIntro}
            </p>
          </div>
          <div className={`flex flex-wrap gap-3 sm:gap-4 ${heroMotion("delay-300")}`}>
            <Link
              href="/enter"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-6 sm:text-base"
            >
              {copy.ctaEnter}
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-edge-strong bg-surface/75 px-5 py-3 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:border-edge-strong hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-6 sm:text-base"
              style={{ color: "rgb(var(--color-text-secondary) / 1)" }}
            >
              {copy.ctaBlog}
            </Link>
          </div>
        </div>
        <div
          className={`${heroMotion(
            "delay-200"
          )} panel-surface relative min-w-0 p-5 sm:p-6`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
          <div className="relative space-y-4">
            <ParticleTime />
            <p className={TEXT_SM_MUTED}>
              {copy.primarySectionsLabel}
            </p>
            <div className="grid gap-3">
              {copy.primarySections.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group card-interactive flex items-center justify-between rounded-xl border border-edge bg-base/40 px-4 py-3 text-sm"
                >
                  <span>{item.label}</span>
                  <span className={TEXT_XS_MUTED}>
                    {common.arrowRight}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-14 grid gap-4 sm:gap-6 md:grid-cols-3 ${heroMotion("delay-500")}`}>
        {copy.entryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group panel-surface card-interactive p-5 sm:p-6"
          >
            <h3 className={TITLE_BASE_SM_LG}>
              {card.title}
            </h3>
            <p className={`mt-2 ${TEXT_SM_MUTED}`}>{card.subtitle}</p>
          </Link>
        ))}
      </section>

      <RevealSection className="mt-16 md:mt-20">
        <div className="flex items-center justify-between">
          <h2 className={TITLE_XL}>{copy.latestBlog}</h2>
          <Link href="/blog" className="text-sm font-medium text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.blogItems.map((item) => (
            <article
              key={item.title}
              className="group panel-surface card-interactive rounded-xl p-4 sm:p-5"
            >
              <p className={`${TEXT_XS_MUTED} group-hover:text-secondary`}>
                {item.date}
              </p>
              <h3 className={`mt-2 ${TITLE_BASE_SM_LG}`}>
                {item.title}
              </h3>
              <p className={`mt-1 ${TEXT_SM_MUTED} group-hover:text-secondary`}>
                {item.subtitle}
              </p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mt-16 md:mt-20">
        <div className="flex items-center justify-between">
          <h2 className={TITLE_XL}>{copy.labsTitle}</h2>
          <Link href="/labs" className="text-sm font-medium text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.labItems.map((item) => (
            <div
              key={item.title}
              className="group panel-surface card-interactive rounded-xl p-4 sm:p-5"
            >
              <h3 className={TITLE_BASE_SM_LG}>
                {item.title}
              </h3>
              <p className={`mt-1 ${TEXT_SM_MUTED} group-hover:text-secondary`}>
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mt-16 grid gap-6 md:mt-20 md:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-surface p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.trackerTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.trackerDesc}</p>
          <ul
            className="mt-4 space-y-2.5 text-sm text-secondary sm:text-base"
            style={{ color: "rgb(var(--color-text-secondary) / 1)" }}
          >
            {copy.trackerPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 rounded-lg border border-edge/70 bg-surface/60 px-2.5 py-1.5 text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/tracker"
            className="link-accent mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            {copy.trackerEnter}
            <span aria-hidden>{common.arrowRight}</span>
          </Link>
        </div>
        <div className="panel-surface bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/20 p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.aboutTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.aboutDesc}</p>
          <div className={`mt-4 flex flex-wrap gap-2 ${TEXT_XS_SUBTLE}`}>
            {copy.skillTags.map((skill) => (
              <span key={skill} className="rounded-full border border-edge-strong bg-base/35 px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
