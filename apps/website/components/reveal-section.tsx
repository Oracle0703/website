import type { ReactNode } from "react";

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
  const sectionClasses = [delayClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClasses}>
      {children}
    </section>
  );
}
