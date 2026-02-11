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
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className={`${heroMotion("delay-0")} text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl`}>
              {copy.heroTitle}
            </h1>
            <p className={`${heroMotion("delay-100")} ${TEXT_BASE_SECONDARY} sm:text-lg`}>
              {copy.heroSubtitle}
            </p>
            <p className={`${heroMotion("delay-200")} ${TEXT_SM_MUTED} sm:text-base`}>
              {copy.heroIntro}
            </p>
          </div>
          <div className={`flex flex-wrap gap-3 sm:gap-4 ${heroMotion("delay-300")}`}>
            <Link
              href="/enter"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-6"
            >
              {copy.ctaEnter}
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-edge-strong px-5 py-3 text-sm font-semibold text-primary transition hover:border-edge-strong hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-6"
            >
              {copy.ctaBlog}
            </Link>
          </div>
        </div>
        <div
          className={`${heroMotion(
            "delay-200"
          )} relative min-w-0 rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6`}
        >
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />
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
                  className="group flex items-center justify-between rounded-xl border border-edge bg-base/40 px-4 py-3 text-sm transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none"
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

      <section className={`mt-12 grid gap-4 sm:gap-6 md:grid-cols-3 ${heroMotion("delay-500")}`}>
        {copy.entryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-edge bg-surface/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none sm:p-6"
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
          <Link href="/blog" className="text-sm text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.blogItems.map((item) => (
            <article
              key={item.title}
              className="group rounded-xl border border-edge bg-surface/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none sm:p-5"
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
          <Link href="/labs" className="text-sm text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.labItems.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-edge bg-surface/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none sm:p-5"
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
        <div className="rounded-2xl border border-edge bg-surface/60 p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.trackerTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.trackerDesc}</p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {copy.trackerPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/tracker"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-strong"
          >
            {copy.trackerEnter}
            <span aria-hidden>{common.arrowRight}</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-edge bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/20 p-5 sm:p-6">
          <h2 className={TITLE_XL}>{copy.aboutTitle}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{copy.aboutDesc}</p>
          <div className={`mt-4 flex flex-wrap gap-2 ${TEXT_XS_SUBTLE}`}>
            {copy.skillTags.map((skill) => (
              <span key={skill} className="rounded-full border border-edge-strong px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
