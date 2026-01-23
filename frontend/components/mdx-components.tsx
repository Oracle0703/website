import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

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
      {title ? <p className="text-sm font-semibold text-primary">{title}</p> : null}
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
      {language ? <span className="mb-2 block text-xs text-muted">{language}</span> : null}
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

type LinkProps = ComponentProps<typeof Link> & {
  href: string;
};

export function MDXLink({ href, children, ...props }: LinkProps) {
  const isExternal = href.startsWith("http");
  const { className, ...rest } = props;
  const mergedClassName = ["text-accent hover:text-accent-strong", className]
    .filter(Boolean)
    .join(" ");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={mergedClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={mergedClassName} {...rest}>
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
    <h2 className="mt-8 text-xl font-semibold text-primary" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 text-lg font-semibold text-primary" {...props} />
  ),
  p: (props: ComponentProps<"p">) => <p className="mt-4 text-sm text-secondary" {...props} />,
  ul: (props: ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-secondary" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-secondary" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="text-sm text-secondary" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="mt-4 border-l-2 border-edge-strong pl-4 text-sm text-muted" {...props} />
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
