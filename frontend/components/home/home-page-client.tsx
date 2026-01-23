"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RevealSection } from "../reveal-section";
import { useI18n } from "../language-provider";

export function HomePageClient() {
  const { messages } = useI18n();
  const copy = messages.home;
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
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className={heroMotion("delay-0")}>
              {copy.heroTitle}
            </h1>
            <p className={`${heroMotion("delay-100")} text-base text-secondary`}>
              {copy.heroSubtitle}
            </p>
            <p className={`${heroMotion("delay-200")} text-sm text-muted`}>
              {copy.heroIntro}
            </p>
          </div>
          <div className={`flex flex-wrap gap-4 ${heroMotion("delay-300")}`}>
            <Link
              href="/enter"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {copy.ctaEnter}
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-edge-strong px-6 py-3 text-sm font-semibold text-primary transition hover:border-edge-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {copy.ctaBlog}
            </Link>
          </div>
        </div>
        <div
          className={`${heroMotion(
            "delay-200"
          )} relative rounded-2xl border border-edge bg-surface/70 p-6`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
          <div className="relative space-y-4">
            <p className="text-sm text-muted">
              {copy.primarySectionsLabel}
            </p>
            <div className="grid gap-3">
              {copy.primarySections.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border border-edge bg-base/40 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-edge-strong motion-reduce:transform-none"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-muted">\u2192</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-16 grid gap-6 md:grid-cols-3 ${heroMotion("delay-500")}`}>
        {copy.entryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-edge bg-surface/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-edge-strong hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none"
          >
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-muted">{card.subtitle}</p>
          </Link>
        ))}
      </section>

      <RevealSection className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{copy.latestBlog}</h2>
          <Link href="/blog" className="text-sm text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.blogItems.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-edge bg-surface/60 p-5"
            >
              <p className="text-xs text-muted">{item.date}</p>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{copy.labsTitle}</h2>
          <Link href="/labs" className="text-sm text-muted hover:text-primary">
            {copy.viewAll}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.labItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-edge bg-surface/60 p-5"
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mt-20 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-edge bg-surface/60 p-6">
          <h2 className="text-xl font-semibold">{copy.trackerTitle}</h2>
          <p className="mt-2 text-sm text-muted">{copy.trackerDesc}</p>
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
            <span aria-hidden>\u2192</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-edge bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/20 p-6">
          <h2 className="text-xl font-semibold">{copy.aboutTitle}</h2>
          <p className="mt-2 text-sm text-muted">{copy.aboutDesc}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-subtle">
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
