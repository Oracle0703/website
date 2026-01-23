"use client";

import type { MouseEvent, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../components/use-prefers-reduced-motion";

type Entry = {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  href: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

const copy = {
  heading: "\u8fdb\u5165\u7ad9\u70b9",
  headingEn: "Enter Site",
  prompt: "\u9009\u62e9\u4f60\u7684\u5165\u53e3",
  promptEn: "Choose your path",
  back: "\u8fd4\u56de\u9996\u9875",
  backEn: "Back",
  hint:
    "\u652f\u6301\u952e\u76d8\u5bfc\u822a\uff0c\u51cf\u5c11\u52a8\u6548\u53ef\u5728\u7cfb\u7edf\u8bbe\u7f6e\u4e2d\u542f\u7528\u3002",
  enter: "\u8fdb\u5165"
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

const entries: Entry[] = [
  {
    title: "\u535a\u5ba2",
    titleEn: "Blog",
    subtitle: "\u9605\u8bfb\u4e0e\u601d\u8003",
    subtitleEn: "Read & Reflect",
    href: "/blog",
    Icon: BlogIcon
  },
  {
    title: "\u5b9e\u9a8c\u5ba4",
    titleEn: "Labs",
    subtitle: "\u5b9e\u9a8c\u4e0e\u539f\u578b",
    subtitleEn: "Experiments & Prototypes",
    href: "/labs",
    Icon: LabsIcon
  },
  {
    title: "\u6253\u5361",
    titleEn: "Tracker",
    subtitle: "\u4e60\u60ef\u4e0e\u8fdb\u5ea6",
    subtitleEn: "Habits & Progress",
    href: "/tracker",
    Icon: TrackerIcon
  }
];

export function EnterClient() {
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
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(91,140,255,0.12),_transparent_55%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
        <div className="h-full w-full animate-pulse bg-[radial-gradient(circle,_rgba(91,140,255,0.12)_1px,_transparent_1px)] [background-size:24px_24px] motion-reduce:animate-none" />
      </div>
      <div
        className={`relative w-full max-w-5xl space-y-10 transition-all ease-out ${containerDuration} ${containerState} motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            onClick={handleBack}
            className="text-sm font-semibold tracking-wide text-slate-100 hover:text-white"
          >
            Developer Studio
          </Link>
          <p className="text-sm text-slate-400">
            {copy.prompt} <span lang="en">/ {copy.promptEn}</span>
          </p>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {copy.heading} <span className="text-lg text-slate-400" lang="en">/ {copy.headingEn}</span>
          </h1>
          <p className="text-sm text-slate-400">{copy.hint}</p>
        </div>

        <div className={`grid gap-6 md:grid-cols-3 ${isNavigating ? "pointer-events-none" : ""}`}>
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
                  "group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-surface/70 p-6 transition duration-300",
                  "hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10",
                  "motion-reduce:transform-none motion-reduce:transition-none",
                  isDimmed ? "opacity-40 scale-95" : "",
                  isActive ? "z-10 scale-[1.03] border-blue-400/80 shadow-xl shadow-blue-500/20" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="space-y-3">
                  <entry.Icon className="h-6 w-6 text-blue-300" />
                  <h2 className="text-xl font-semibold">
                    {entry.title}{" "}
                    <span className="text-xs text-slate-400" lang="en">
                      / {entry.titleEn}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-400">{entry.subtitle}</p>
                  <p className="text-xs text-slate-400" lang="en">
                    {entry.subtitleEn}
                  </p>
                </div>
                <span className="mt-6 text-sm text-slate-400 group-hover:text-blue-200">
                  {copy.enter} \u2192
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3 text-xs text-slate-400">
          <Link
            href="/"
            onClick={handleBack}
            className="text-sm text-slate-400 hover:text-white"
          >
            \u2190 {copy.back} <span lang="en">/ {copy.backEn}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
