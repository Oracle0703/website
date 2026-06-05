import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { MDXCodeBlock } from "./mdx-code-block";
import { slugifyHeading } from "../lib/blog-headings";
import {
  TEXT_SM_MUTED,
  TEXT_SM_SECONDARY,
  TEXT_SM_SEMIBOLD_PRIMARY,
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

const DEFAULT_MDX_IMAGE_WIDTH = 1200;
const DEFAULT_MDX_IMAGE_HEIGHT = 630;

function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((item) => getNodeText(item)).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return getNodeText(props.children);
  }
  return "";
}

function parseCodeBlock(children: ReactNode) {
  const childList = Array.isArray(children) ? children : [children];
  const codeChild = childList.find(
    (child): child is ReactElement => isValidElement(child) && child.type === "code"
  );

  if (codeChild) {
    const props = codeChild.props as {
      children?: ReactNode;
      className?: string;
    };
    const className = props.className ?? "";
    const language = className.match(/language-([\w-]+)/)?.[1];
    const code = getNodeText(props.children).replace(/\n$/, "");

    return { code, language };
  }

  const code = getNodeText(children).replace(/\n$/, "");
  if (!code) return null;

  return { code, language: undefined as string | undefined };
}

function MdxHeading2(props: ComponentProps<"h2">) {
  const headingText = getNodeText(props.children).trim();
  const fallbackId = headingText ? slugifyHeading(headingText) : undefined;

  return (
    <h2
      {...props}
      id={props.id ?? fallbackId}
      className={[`mt-8 ${TITLE_XL} scroll-mt-24`, props.className].filter(Boolean).join(" ")}
    />
  );
}

function MdxHeading3(props: ComponentProps<"h3">) {
  const headingText = getNodeText(props.children).trim();
  const fallbackId = headingText ? slugifyHeading(headingText) : undefined;

  return (
    <h3
      {...props}
      id={props.id ?? fallbackId}
      className={[`mt-6 ${TITLE_LG} scroll-mt-24`, props.className].filter(Boolean).join(" ")}
    />
  );
}

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
  return <MDXCodeBlock code={getNodeText(children).replace(/\n$/, "")} language={language} />;
}

type ImageProps = ComponentProps<"img">;

export function Image({ src, alt = "", className, width, height, ...props }: ImageProps) {
  const mergedClassName = ["rounded-xl border border-edge bg-base/40", className]
    .filter(Boolean)
    .join(" ");
  const imageWidth = Number(width) || DEFAULT_MDX_IMAGE_WIDTH;
  const imageHeight = Number(height) || DEFAULT_MDX_IMAGE_HEIGHT;
  const imageSrc = typeof src === "string" ? src : "";

  if (!imageSrc) return null;

  return (
    <NextImage
      src={imageSrc}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      sizes="(max-width: 768px) 100vw, 768px"
      className={mergedClassName}
      {...props}
    />
  );
}

type AnchorProps = ComponentProps<"a">;

export function MDXLink({ href, children, className, ...rest }: AnchorProps) {
  const safeHref = href ?? "";
  const isExternal = /^https?:\/\//i.test(safeHref);
  const mergedClassName = [
    "text-accent underline decoration-accent/40 underline-offset-4 rounded-sm px-1 -mx-1 transition-colors hover:bg-accent hover:text-white",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (isExternal) {
    return (
      <a
        href={safeHref}
        target={rest.target ?? "_blank"}
        rel={rest.rel ?? "noopener noreferrer"}
        className={mergedClassName}
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (!safeHref) {
    return (
      <a className={mergedClassName} {...rest}>
        {children}
      </a>
    );
  }

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
  h2: MdxHeading2,
  h3: MdxHeading3,
  p: (props: ComponentProps<"p">) => (
    <p className={`mt-4 ${TEXT_SM_SECONDARY} leading-7`} {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className={`mt-4 list-disc space-y-2 pl-5 ${TEXT_SM_SECONDARY} leading-7`}
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className={`mt-4 list-decimal space-y-2 pl-5 ${TEXT_SM_SECONDARY} leading-7`}
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => (
    <li className={`${TEXT_SM_SECONDARY} leading-7`} {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className={`mt-4 border-l-2 border-edge-strong pl-4 ${TEXT_SM_MUTED}`}
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => {
    const { className = "", ...rest } = props;
    const isBlock = className.includes("language-");
    const inlineClasses = "rounded-sm bg-base/60 px-1 py-0.5 text-xs text-primary";
    return <code className={isBlock ? className : inlineClasses} {...rest} />;
  },
  pre: (props: ComponentProps<"pre">) => {
    const codeBlock = parseCodeBlock(props.children);

    if (!codeBlock) {
      return (
        <pre
          className="mt-4 overflow-x-auto rounded-xl border border-edge bg-base/60 p-4 text-sm text-primary"
          {...props}
        />
      );
    }

    return (
      <MDXCodeBlock code={codeBlock.code} language={codeBlock.language}>
        {props.children}
      </MDXCodeBlock>
    );
  }
};
