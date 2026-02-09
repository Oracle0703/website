import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import {
  TEXT_SM_MUTED,
  TEXT_SM_SECONDARY,
  TEXT_SM_SEMIBOLD_PRIMARY,
  TEXT_XS_MUTED,
  TITLE_LG,
  TITLE_XL
} from "../lib/typography";

type CalloutProps = {
  tone?: "info" | "warning" | "success";
  title?: string;
  children: ReactNode;
};

const CALLOUT_STYLES: Record<NonNullable<CalloutProps["tone"]>, string> = {
  info: "border-blue-500/40 bg-blue-500/10 text-secondary",
  warning: "border-amber-500/40 bg-amber-500/10 text-secondary",
  success: "border-emerald-500/40 bg-emerald-500/10 text-secondary"
};

export function Callout({ tone = "info", title, children }: CalloutProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${CALLOUT_STYLES[tone]}`}>
      {title ? <p className={TEXT_SM_SEMIBOLD_PRIMARY}>{title}</p> : null}
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

type CodeBlockProps = {
  children: ReactNode;
  language?: string;
};

export function CodeBlock({ children, language }: CodeBlockProps) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-edge bg-base/60 p-4 text-sm text-primary">
      {language ? <span className={`mb-2 block ${TEXT_XS_MUTED}`}>{language}</span> : null}
      <code>{children}</code>
    </pre>
  );
}

type ImageProps = ComponentProps<"img">;

export function Image({ src, alt = "", className, ...props }: ImageProps) {
  const mergedClassName = ["rounded-xl border border-edge bg-base/40", className]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={mergedClassName}
      {...props}
    />
  );
}

type AnchorProps = ComponentProps<"a">;

export function MDXLink({ href, children, className, ...rest }: AnchorProps) {
  const safeHref = href ?? "";
  const isExternal = /^https?:\/\//i.test(safeHref);
  const mergedClassName = ["text-accent hover:text-accent-strong", className]
    .filter(Boolean)
    .join(" ");

  if (isExternal) {
    return (
      <a
        href={safeHref}
        target={rest.target ?? "_blank"}
        rel={rest.rel ?? "noreferrer"}
        className={mergedClassName}
        {...rest}
      >
        {children}
      </a>
    );
  }

  // For internal links, MDX usually gives a string href.
  // Fallback to <a> if href is missing.
  if (!safeHref) {
    return (
      <a className={mergedClassName} {...rest}>
        {children}
      </a>
    );
  }

  // next/link accepts anchor props; keep it simple for MDX usage.
  return (
    <Link href={safeHref} className={mergedClassName} {...rest}>
      {children}
    </Link>
  );
}

export const mdxComponents = {
  Callout,
  CodeBlock,
  Image,
  Link: MDXLink,
  a: MDXLink,
  img: Image,
  h2: (props: ComponentProps<"h2">) => (
    <h2 className={`mt-8 ${TITLE_XL}`} {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className={`mt-6 ${TITLE_LG}`} {...props} />
  ),
  p: (props: ComponentProps<"p">) => <p className={`mt-4 ${TEXT_SM_SECONDARY}`} {...props} />,
  ul: (props: ComponentProps<"ul">) => (
    <ul className={`mt-4 list-disc space-y-2 pl-5 ${TEXT_SM_SECONDARY}`} {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className={`mt-4 list-decimal space-y-2 pl-5 ${TEXT_SM_SECONDARY}`} {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className={TEXT_SM_SECONDARY} {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className={`mt-4 border-l-2 border-edge-strong pl-4 ${TEXT_SM_MUTED}`} {...props} />
  ),
  code: (props: ComponentProps<"code">) => {
    const { className = "", ...rest } = props;
    const isBlock = className.includes("language-");
    const inlineClasses = "rounded bg-base/60 px-1 py-0.5 text-xs text-primary";
    return <code className={isBlock ? className : inlineClasses} {...rest} />;
  },
  pre: (props: ComponentProps<"pre">) => (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-edge bg-base/60 p-4 text-sm text-primary" {...props} />
  )
};
