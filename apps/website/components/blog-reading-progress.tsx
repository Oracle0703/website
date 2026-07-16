"use client";

import { useEffect, useState } from "react";

type BlogReadingProgressProps = {
  targetId: string;
  label: string;
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function BlogReadingProgress({ targetId, label }: BlogReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame = 0;

    const measure = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const readableDistance = target.offsetHeight - window.innerHeight;
      const nextProgress =
        readableDistance <= 0
          ? window.scrollY >= targetTop
            ? 100
            : 0
          : ((window.scrollY - targetTop) / readableDistance) * 100;

      setProgress(clampProgress(nextProgress));
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [targetId]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-edge/35"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={`${progress}%`}
    >
      <span
        className="block h-full origin-left bg-accent transition-transform duration-150 motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />
    </div>
  );
}
