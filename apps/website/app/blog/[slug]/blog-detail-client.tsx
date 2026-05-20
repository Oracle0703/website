"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { BlogPost } from "../../../lib/blog";
import type { BlogSeries } from "../../../lib/blog-series";
import type { TocHeading } from "../../../lib/blog-headings";
import { BlogCoverImage } from "../../../components/blog-cover-image";
import { useI18n } from "../../../components/language-provider";
import { getLocalePath } from "../../../lib/locale-routing";
import { TITLE_2XL } from "../../../lib/typography";

type BlogDetailPost = Pick<
  BlogPost,
  | "title"
  | "slug"
  | "date"
  | "updatedAt"
  | "summary"
  | "cover"
  | "author"
  | "tags"
  | "readingTime"
>;

type BlogDetailClientProps = {
  post: BlogDetailPost;
  coverSrc: string;
  coverAlt: string;
  showUpdated: boolean;
  tocHeadings: TocHeading[];
  currentSeries: BlogSeries | null;
  previousSeriesPost: BlogPost | null;
  nextSeriesPost: BlogPost | null;
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
  relatedPosts: BlogPost[];
  mdxError: boolean;
  children: ReactNode;
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(date));
}

export function BlogDetailClient({
  post,
  coverSrc,
  coverAlt,
  showUpdated,
  tocHeadings,
  currentSeries,
  previousSeriesPost,
  nextSeriesPost,
  previousPost,
  nextPost,
  relatedPosts,
  mdxError,
  children
}: BlogDetailClientProps) {
  const { locale, messages } = useI18n();
  const copy = messages.pages.blog;
  const common = messages.pages.common;
  const getHref = (href: string) => getLocalePath(href, locale);

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
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-edge/80 bg-base/40">
          <BlogCoverImage
            src={coverSrc}
            alt={coverAlt}
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
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

      {currentSeries && (
        <section className="panel-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted">{copy.seriesNavigationTitle}</p>
              <h2 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">
                {currentSeries.title}
              </h2>
            </div>
            <span className="rounded-full border border-edge px-3 py-1 text-xs font-semibold text-secondary">
              {currentSeries.posts.length} {copy.seriesCountSuffix}
            </span>
          </div>
          <nav className="mt-4 space-y-2">
            {currentSeries.posts.map((seriesPost) => {
              const isCurrent = seriesPost.slug === post.slug;
              return (
                <Link
                  key={seriesPost.slug}
                  href={getHref(`/blog/${encodeURIComponent(seriesPost.slug)}`)}
                  className={
                    isCurrent
                      ? "block rounded-xl border border-accent/70 bg-accent/15 px-4 py-3"
                      : "block rounded-xl border border-edge bg-base/40 px-4 py-3 transition-colors hover:border-edge-strong hover:bg-base/70"
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {seriesPost.series?.order}. {seriesPost.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-accent">
                        {copy.currentPost}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          {(previousSeriesPost || nextSeriesPost) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {previousSeriesPost && (
                <Link
                  href={getHref(`/blog/${encodeURIComponent(previousSeriesPost.slug)}`)}
                  className="card-interactive rounded-xl border border-edge bg-base/40 p-4"
                >
                  <p className="text-xs font-semibold text-muted">
                    {common.arrowLeft} {copy.previousPost}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-primary">
                    {previousSeriesPost.title}
                  </h3>
                </Link>
              )}
              {nextSeriesPost && (
                <Link
                  href={getHref(`/blog/${encodeURIComponent(nextSeriesPost.slug)}`)}
                  className="card-interactive rounded-xl border border-edge bg-base/40 p-4"
                >
                  <p className="text-xs font-semibold text-muted">
                    {copy.nextPost} {common.arrowRight}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-primary">
                    {nextSeriesPost.title}
                  </h3>
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      <article className="panel-surface space-y-6 p-6 sm:p-10">
        {mdxError ? (
          <div className="rounded-xl border border-dashed border-edge p-6 text-lg leading-8 text-muted">
            {copy.invalidContent}
          </div>
        ) : (
          children
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
                href={getHref(`/blog/${encodeURIComponent(previousPost.slug)}`)}
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
                href={getHref(`/blog/${encodeURIComponent(nextPost.slug)}`)}
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
                href={getHref(`/blog/${encodeURIComponent(relatedPost.slug)}`)}
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

      <section className="panel-surface p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-primary sm:text-2xl">
          {copy.articleCtaTitle}
        </h2>
        <p className="mt-2 text-base leading-7 text-secondary">
          {copy.articleCtaDescription}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link
            href={getHref("/projects")}
            className="card-interactive rounded-xl border border-edge bg-base/40 p-4 text-sm font-semibold text-accent"
          >
            {copy.viewProjects}
          </Link>
          <Link
            href={getHref("/blog")}
            className="card-interactive rounded-xl border border-edge bg-base/40 p-4 text-sm font-semibold text-accent"
          >
            {copy.readMoreArticles}
          </Link>
          <Link
            href={getHref("/contact")}
            className="card-interactive rounded-xl border border-edge bg-base/40 p-4 text-sm font-semibold text-accent"
          >
            {copy.contactMe}
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-5 text-lg text-muted">
        <Link href={getHref("/blog")} className="link-accent font-medium">
          {copy.title}
        </Link>
        <Link href={getHref("/enter")} className="link-accent font-medium">
          {common.backToEnter}
        </Link>
        <Link href={getHref("/")} className="link-muted font-medium">
          {common.backToHome}
        </Link>
      </div>
    </main>
  );
}
