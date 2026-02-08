"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  delayClass?: string;
};

export function RevealSection({
  children,
  className = "",
  delayClass = ""
}: RevealSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const motionClasses = [
    "transition-all duration-500 ease-out",
    delayClass,
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
    "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={ref} className={motionClasses}>
      {children}
    </section>
  );
}
