import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "../../../lib/blog";
import { getLocale } from "../../../lib/i18n-server";
import { getMessages } from "../../../lib/i18n";
import { getPostBySlug, getPublishedPosts, isPublished } from "../../../lib/blog";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { mdxComponents } from "../../../components/mdx-components";
import { extractTocHeadings } from "../../../lib/blog-headings";
import { TITLE_2XL } from "../../../lib/typography";

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

function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit = 3) {
  const explicitRelated = new Set(currentPost.relatedPosts ?? []);
  const currentTags = new Set(currentPost.tags ?? []);

  const candidates = allPosts
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      let score = 0;

      if (explicitRelated.has(candidate.slug)) {
        score += 100;
      }

      const candidateTags = candidate.tags ?? [];
      const sharedTags = candidateTags.filter((tag) => currentTags.has(tag));
      score += sharedTags.length * 10;

      if (currentPost.category && currentPost.category === candidate.category) {
        score += 3;
      }

      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime();
    });

  return candidates.slice(0, limit).map((item) => item.candidate);
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
  const slug = encodeURIComponent(post.slug);
  const canonicalPath = `/blog/${slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: toAbsoluteUrl(canonicalPath)
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: toAbsoluteUrl(canonicalPath),
      images: cover ? [cover] : []
    },
    twitter: {
      title: post.title,
      description,
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
  const publishedPosts = getPublishedPosts();
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
  const tocHeadings = extractTocHeadings(post.content);
  const relatedPosts = getRelatedPosts(post, publishedPosts);
  const currentIndex = publishedPosts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < publishedPosts.length - 1
      ? publishedPosts[currentIndex + 1]
      : null;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-14 sm:px-6 md:space-y-10 md:py-20">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-4 text-base text-muted">
          <span>{copy.publishedAt} · {formatDate(post.date, locale)}</span>
          {showUpdated && (
            <span>{copy.updatedAt} · {formatDate(post.updatedAt, locale)}</span>
          )}
          <span>{copy.readingTime} · {post.readingTime} {copy.minute}</span>
        </div>
        <h1 className={`${TITLE_2XL} text-4xl leading-tight sm:text-5xl`}>{post.title}</h1>
        <p className="max-w-3xl text-lg leading-8 text-secondary">{post.summary}</p>
        <div className="flex flex-wrap items-center gap-3 text-base text-secondary">
          <span className="text-muted">{post.author}</span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-muted">{copy.tagsLabel}:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-edge-strong px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {coverSrc ? (
        <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-edge/80 bg-base/40 md:aspect-auto">
          <img src={coverSrc} alt={coverAlt} className="h-full w-full object-cover" />
        </div>
      ) : null}

      {tocHeadings.length > 0 && (
        <section className="panel-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-primary sm:text-xl">{copy.tableOfContents}</h2>
          <nav className="mt-3 space-y-1.5">
            {tocHeadings.map((heading, index) => (
              <a
                key={`${heading.id}-${index}`}
                href={`#${heading.id}`}
                className={`block rounded-md px-2 py-1 text-sm text-muted transition-colors hover:bg-primary hover-text-base ${
                  heading.depth === 3 ? "ml-4" : ""
                }`}
              >
                {heading.title}
              </a>
            ))}
          </nav>
        </section>
      )}

      <article className="panel-surface space-y-6 p-6 sm:p-10">
        {mdxError ? (
          <div className="rounded-xl border border-dashed border-edge p-6 text-lg leading-8 text-muted">
            {copy.invalidContent}
          </div>
        ) : (
          mdxContent
        )}
      </article>

      {(previousPost || nextPost) && (
        <section className="panel-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-primary sm:text-2xl">
            {copy.postNavigationTitle}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {previousPost && (
              <Link
                href={`/blog/${encodeURIComponent(previousPost.slug)}`}
                className="card-interactive rounded-xl border border-edge bg-base/40 p-4"
              >
                <p className="text-xs font-semibold text-muted">
                  {common.arrowLeft} {copy.previousPost}
                </p>
                <h3 className="mt-1 text-base font-semibold text-primary">
                  {previousPost.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{previousPost.summary}</p>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/blog/${encodeURIComponent(nextPost.slug)}`}
                className="card-interactive rounded-xl border border-edge bg-base/40 p-4"
              >
                <p className="text-xs font-semibold text-muted">
                  {copy.nextPost} {common.arrowRight}
                </p>
                <h3 className="mt-1 text-base font-semibold text-primary">{nextPost.title}</h3>
                <p className="mt-1 text-sm text-muted">{nextPost.summary}</p>
              </Link>
            )}
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="panel-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-primary sm:text-2xl">{copy.relatedPostsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${encodeURIComponent(relatedPost.slug)}`}
                className="card-interactive rounded-xl border border-edge bg-base/40 p-4"
              >
                <p className="text-xs text-muted">{formatDate(relatedPost.date, locale)}</p>
                <h3 className="mt-1 text-base font-semibold text-primary">{relatedPost.title}</h3>
                <p className="mt-1 text-sm text-muted">{relatedPost.summary}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  {copy.readMore} {common.arrowRight}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-5 text-lg text-muted">
        <Link href="/blog" className="link-accent font-medium">
          {copy.title}
        </Link>
        <Link href="/enter" className="link-accent font-medium">
          {common.backToEnter}
        </Link>
        <Link href="/" className="link-muted font-medium">
          {common.backToHome}
        </Link>
      </div>
    </main>
  );
}
