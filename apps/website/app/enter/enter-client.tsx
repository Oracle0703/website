"use client";

import type { MouseEvent, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../components/use-prefers-reduced-motion";
import { useI18n } from "../../components/language-provider";
import { useTheme } from "../../components/theme-provider";
import {
  TEXT_SM_MUTED,
  TEXT_XS_MUTED,
  TEXT_XS_SEMIBOLD_SECONDARY,
  TITLE_2XL,
  TITLE_LG_SM_XL
} from "../../lib/typography";

type EntryId = "blog" | "labs" | "tracker";

type Entry = {
  id: EntryId;
  title: string;
  subtitle: string;
  href: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

const BlogIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 6h7m-7 4h10m-10 4h10m-10 4h7" />
    <rect x="5" y="4" width="14" height="16" rx="2" />
  </svg>
);

const LabsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7l7 4 7-4" />
  </svg>
);

const TrackerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8L14.8 10" />
  </svg>
);

const entryIcons: Record<EntryId, Entry["Icon"]> = {
  blog: BlogIcon,
  labs: LabsIcon,
  tracker: TrackerIcon
};

export function EnterClient() {
  const { locale, messages, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const copy = messages.enter;
  const common = messages.pages.common;
  const toggleLabel = locale === "zh" ? "EN" : "\u4e2d\u6587";
  const toggleAriaLabel =
    locale === "zh" ? messages.nav.switchToEnglish : messages.nav.switchToChinese;
  const themeLabel = theme === "dark" ? messages.theme.light : messages.theme.dark;
  const themeAriaLabel =
    theme === "dark" ? messages.theme.switchToLight : messages.theme.switchToDark;
  const entries: Entry[] = copy.entries.map((entry) => ({
    ...entry,
    Icon: entryIcons[entry.id as EntryId]
  }));
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBack = useCallback(
    (event?: MouseEvent<HTMLAnchorElement>) => {
      if (isNavigating) return;
      event?.preventDefault();

      setIsNavigating(true);

      if (prefersReducedMotion) {
        router.push("/");
        return;
      }

      setIsExiting(true);
      window.setTimeout(() => {
        router.push("/");
      }, 320);
    },
    [isNavigating, prefersReducedMotion, router]
  );

  const handleNavigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (isNavigating) return;
      event.preventDefault();

      setIsNavigating(true);

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      setActiveHref(href);
      window.setTimeout(() => {
        router.push(href);
      }, 260);
    },
    [isNavigating, prefersReducedMotion, router]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBack]);

  const containerState = isMounted && !isExiting ? "opacity-100 scale-100" : "opacity-0 scale-95";
  const containerDuration = isExiting ? "duration-300" : "duration-700";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,140,255,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
        <div className="h-full w-full animate-pulse bg-[radial-gradient(circle,rgba(91,140,255,0.12)_1px,transparent_1px)] bg-size-[24px_24px] motion-reduce:animate-none" />
      </div>
      <div
        className={`relative w-full max-w-5xl space-y-8 transition-all ease-out ${containerDuration} ${containerState} motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 md:space-y-10`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            onClick={handleBack}
            className="text-sm font-semibold tracking-wide text-primary hover:text-primary"
          >
            {messages.nav.brand}
          </Link>
          <div className={`flex items-center gap-3 ${TEXT_XS_MUTED} sm:text-sm`}>
            <p>{copy.prompt}</p>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeAriaLabel}
              className={`${TEXT_XS_SEMIBOLD_SECONDARY} transition hover:text-primary`}
            >
              {themeLabel}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={toggleAriaLabel}
              className={`${TEXT_XS_SEMIBOLD_SECONDARY} transition hover:text-primary`}
            >
              {toggleLabel}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className={TITLE_2XL}>{copy.heading}</h1>
          <p className={TEXT_SM_MUTED}>{copy.hint}</p>
        </div>

        <div className={`grid gap-4 sm:gap-6 md:grid-cols-3 ${isNavigating ? "pointer-events-none" : ""}`}>
          {entries.map((entry) => {
            const isActive = activeHref === entry.href;
            const isDimmed = activeHref !== null && !isActive;

            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={(event) => handleNavigate(event, entry.href)}
                aria-disabled={isNavigating ? true : undefined}
                className={[
                  "group flex h-full flex-col justify-between rounded-2xl border border-edge bg-surface/70 p-5 transition duration-300 sm:p-6",
                  "hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10",
                  "motion-reduce:transform-none motion-reduce:transition-none",
                  isDimmed ? "opacity-40 scale-95" : "",
                  isActive ? "z-10 scale-[1.03] border-blue-400/80 shadow-xl shadow-blue-500/20" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="space-y-3">
                  <entry.Icon className="h-6 w-6 text-accent" />
                  <h2 className={TITLE_LG_SM_XL}>{entry.title}</h2>
                  <p className={TEXT_SM_MUTED}>{entry.subtitle}</p>
                </div>
                <span className={`mt-6 ${TEXT_SM_MUTED} group-hover:text-accent-strong`}>
                  {copy.enterAction} {common.arrowRight}
                </span>
              </Link>
            );
          })}
        </div>

        <div className={`flex flex-col items-center gap-3 ${TEXT_XS_MUTED}`}>
          <Link
            href="/"
            onClick={handleBack}
            className={`${TEXT_SM_MUTED} hover:text-primary`}
          >
            {common.arrowLeft} {copy.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
