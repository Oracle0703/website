import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getLocale } from "../../../lib/i18n-server";
import { getMessages } from "../../../lib/i18n";
import { getPostBySlug, getPublishedPosts, isPublished } from "../../../lib/blog";
import { mdxComponents } from "../../../components/mdx-components";

type PageProps = {
  params: { slug: string };
};

export const generateStaticParams = () => {
  return getPublishedPosts().map((post) => ({
    slug: post.slug
  }));
};

function getCoverSrc(cover: string | { src: string }) {
  if (typeof cover === "string") return cover;
  return cover.src;
}

export const generateMetadata = ({ params }: PageProps): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);
  const post = getPostBySlug(params.slug);

  if (!post || !isPublished(post)) {
    return {
      title: seo.blogTitle,
      description: seo.blogDescription
    };
  }

  const description = post.seo?.description ?? post.summary;
  const cover = post.seo?.ogImage ?? getCoverSrc(post.cover);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: cover ? [cover] : []
    },
    robots: post.seo?.noindex ? { index: false, follow: false } : undefined
  };
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(date));
}

export default async function Page({ params }: PageProps) {
  const locale = getLocale();
  const { pages } = getMessages(locale);
  const copy = pages.blog;
  const common = pages.common;
  const post = getPostBySlug(params.slug);

  if (!post || !isPublished(post)) {
    notFound();
  }

  let mdxContent: ReactNode = null;
  let mdxError = false;

  try {
    const compiled = await compileMDX({
      source: post.content,
      components: mdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm]
        }
      }
    });
    mdxContent = compiled.content;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[blog] failed to compile MDX for ${post.slug}`, error);
    }
    mdxError = true;
  }

  const coverSrc = getCoverSrc(post.cover);
  const coverAlt = typeof post.cover === "string" ? post.title : post.cover.alt;
  const showUpdated = post.updatedAt && post.updatedAt !== post.date;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 md:space-y-10 md:py-16">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{copy.publishedAt} · {formatDate(post.date, locale)}</span>
          {showUpdated && (
            <span>{copy.updatedAt} · {formatDate(post.updatedAt, locale)}</span>
          )}
          <span>{copy.readingTime} · {post.readingTime} {copy.minute}</span>
        </div>
        <h1 className="text-2xl font-semibold text-primary sm:text-3xl">{post.title}</h1>
        <p className="text-sm text-muted">{post.summary}</p>
        <div className="flex flex-wrap gap-3 text-xs text-secondary">
          <span className="text-muted">{post.author}</span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-muted">{copy.tagsLabel}:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-edge-strong px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {coverSrc ? (
        <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-edge bg-base/40 md:aspect-auto">
          <img src={coverSrc} alt={coverAlt} className="h-full w-full object-cover" />
        </div>
      ) : null}

      <article className="space-y-6">
        {mdxError ? (
          <div className="rounded-xl border border-dashed border-edge p-6 text-sm text-muted">
            {copy.invalidContent}
          </div>
        ) : (
          mdxContent
        )}
      </article>

      <div className="flex gap-4 text-sm">
        <Link href="/blog" className="text-accent hover:text-accent-strong">
          {copy.title}
        </Link>
        <Link href="/enter" className="text-accent hover:text-accent-strong">
          {common.backToEnter}
        </Link>
        <Link href="/" className="text-muted hover:text-primary">
          {common.backToHome}
        </Link>
      </div>
    </main>
  );
}
