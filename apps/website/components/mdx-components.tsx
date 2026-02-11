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
      {title ? <p className="text-base font-semibold text-primary">{title}</p> : null}
      <div className="mt-2 text-lg leading-8">{children}</div>
    </div>
  );
}

type CodeBlockProps = {
  children: ReactNode;
  language?: string;
};

export function CodeBlock({ children, language }: CodeBlockProps) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-edge bg-base/60 p-4 text-base text-primary sm:text-lg">
      {language ? <span className="mb-2 block text-sm text-muted">{language}</span> : null}
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
  const mergedClassName = [
    "text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-strong",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
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
    <h2 className="mt-10 text-2xl font-semibold text-primary sm:text-3xl" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-8 text-xl font-semibold text-primary sm:text-2xl" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mt-5 text-lg leading-8 text-secondary" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="mt-5 list-disc space-y-2.5 pl-6 text-lg leading-8 text-secondary" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="mt-5 list-decimal space-y-2.5 pl-6 text-lg leading-8 text-secondary" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="text-lg leading-8 text-secondary" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-6 border-l-2 border-edge-strong pl-4 text-lg leading-8 text-muted"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => {
    const { className = "", ...rest } = props;
    const isBlock = className.includes("language-");
    const inlineClasses = "rounded bg-base/60 px-1.5 py-0.5 text-base text-primary";
    return <code className={isBlock ? className : inlineClasses} {...rest} />;
  },
  pre: (props: ComponentProps<"pre">) => (
    <pre className="mt-5 overflow-x-auto rounded-xl border border-edge bg-base/60 p-4 text-base text-primary sm:text-lg" {...props} />
  )
};
