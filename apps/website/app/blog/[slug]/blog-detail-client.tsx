import type { ReactNode } from "react";
import Link from "next/link";
import type { BlogPost } from "../../../lib/blog";
import type { BlogSeries } from "../../../lib/blog-series";
import type { TocHeading } from "../../../lib/blog-headings";
import type { Locale, Messages } from "../../../lib/i18n";
import { BlogCoverImage } from "../../../components/blog-cover-image";
import { getLocalePath } from "../../../lib/locale-routing";
import { getBlogTopicLabel } from "../../../lib/blog-topics";

type BlogDetailPost = Pick<
  BlogPost,
  | "title"
  | "slug"
  | "date"
  | "updatedAt"
  | "summary"
  | "cover"
  | "author"
  | "category"
  | "readingTime"
>;

type BlogDetailClientProps = {
  locale: Locale;
  copy: Messages["pages"]["blog"];
  common: Messages["pages"]["common"];
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
  locale,
  copy,
  common,
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
  const getHref = (href: string) => getLocalePath(href, locale);
  const hasReadingRail = tocHeadings.length > 0 || Boolean(currentSeries);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <header className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-muted">
          {post.category ? (
            <span className="section-kicker">{getBlogTopicLabel(post.category, locale)}</span>
          ) : null}
          <span>{post.author}</span>
        </div>

        <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-primary sm:text-5xl md:text-6xl">
          {post.title}
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-secondary sm:text-xl sm:leading-9">
          {post.summary}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-edge/70 pt-4 text-sm text-muted">
          <span>
            {copy.publishedAt} · <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </span>
          {showUpdated ? (
            <span>
              {copy.updatedAt} ·{" "}
              <time dateTime={post.updatedAt}>{formatDate(post.updatedAt, locale)}</time>
            </span>
          ) : null}
          <span>
            {copy.readingTime} · {post.readingTime} {copy.minute}
          </span>
        </div>
      </header>

      {coverSrc ? (
        <figure>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-edge/80 bg-surface">
            <BlogCoverImage
              src={coverSrc}
              alt={coverAlt}
              priority
              sizes="(max-width: 1200px) 100vw, 1152px"
            />
          </div>
        </figure>
      ) : null}

      <div
        className={
          hasReadingRail
            ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16"
            : "max-w-3xl"
        }
      >
        {hasReadingRail ? (
          <aside
            className="space-y-9 lg:order-2"
            aria-label={currentSeries ? copy.seriesNavigationTitle : copy.tableOfContents}
          >
            {tocHeadings.length > 0 ? (
              <section className="border-t border-edge/70 pt-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  {copy.tableOfContents}
                </h2>
                <nav className="mt-3" aria-label={copy.tableOfContents}>
                  <ol className="divide-y divide-edge/60">
                    {tocHeadings.map((heading, index) => (
                      <li key={`${heading.id}-${index}`}>
                        <a
                          href={`#${heading.id}`}
                          className={`block py-2.5 text-sm leading-5 text-muted transition-colors hover:text-accent ${
                            heading.depth === 3 ? "pl-4" : ""
                          }`}
                        >
                          {heading.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </section>
            ) : null}

            {currentSeries ? (
              <section className="border-t border-edge/70 pt-5">
                <p className="section-kicker">{copy.seriesNavigationTitle}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-6 text-primary">
                    {currentSeries.title}
                  </h2>
                  <span className="shrink-0 text-xs font-semibold text-muted">
                    {currentSeries.posts.length} {copy.seriesCountSuffix}
                  </span>
                </div>

                <ol className="mt-4 divide-y divide-edge/60 border-y border-edge/60">
                  {currentSeries.posts.map((seriesPost) => {
                    const isCurrent = seriesPost.slug === post.slug;

                    return (
                      <li key={seriesPost.slug}>
                        <Link
                          href={getHref(`/blog/${encodeURIComponent(seriesPost.slug)}`)}
                          prefetch={false}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`block py-3 text-sm leading-5 transition-colors hover:text-accent ${
                            isCurrent
                              ? "border-l-2 border-accent pl-3 font-semibold text-primary"
                              : "text-muted"
                          }`}
                        >
                          <span>
                            {seriesPost.series?.order}. {seriesPost.title}
                          </span>
                          {isCurrent ? (
                            <span className="mt-1 block text-xs font-semibold text-accent">
                              {copy.currentPost}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ol>

                {previousSeriesPost || nextSeriesPost ? (
                  <nav className="mt-4 grid gap-3" aria-label={copy.seriesNavigationTitle}>
                    {previousSeriesPost ? (
                      <Link
                        href={getHref(`/blog/${encodeURIComponent(previousSeriesPost.slug)}`)}
                        prefetch={false}
                        className="group border-l border-edge-strong pl-3"
                      >
                        <span className="text-xs font-semibold text-muted">
                          {common.arrowLeft} {copy.previousPost}
                        </span>
                        <span className="mt-1 block text-sm font-semibold leading-5 text-primary transition-colors group-hover:text-accent">
                          {previousSeriesPost.title}
                        </span>
                      </Link>
                    ) : null}
                    {nextSeriesPost ? (
                      <Link
                        href={getHref(`/blog/${encodeURIComponent(nextSeriesPost.slug)}`)}
                        prefetch={false}
                        className="group border-l border-edge-strong pl-3"
                      >
                        <span className="text-xs font-semibold text-muted">
                          {copy.nextPost} {common.arrowRight}
                        </span>
                        <span className="mt-1 block text-sm font-semibold leading-5 text-primary transition-colors group-hover:text-accent">
                          {nextSeriesPost.title}
                        </span>
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </section>
            ) : null}
          </aside>
        ) : null}

        <article className="min-w-0 border-y border-edge/70 py-8 sm:py-11 lg:order-1">
          {mdxError ? (
            <div className="rounded-xl border border-dashed border-edge p-6 text-lg leading-8 text-muted">
              {copy.invalidContent}
            </div>
          ) : (
            children
          )}
        </article>
      </div>

      {previousPost || nextPost ? (
        <section className="section-plain pt-8">
          <p className="section-kicker">{copy.readMore}</p>
          <h2 className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
            {copy.postNavigationTitle}
          </h2>
          <nav
            className="mt-6 grid border-y border-edge/70 sm:grid-cols-2 sm:divide-x sm:divide-edge/70"
            aria-label={copy.postNavigationTitle}
          >
            {previousPost ? (
              <Link
                href={getHref(`/blog/${encodeURIComponent(previousPost.slug)}`)}
                prefetch={false}
                className="group py-5 sm:pr-7"
              >
                <span className="text-xs font-semibold text-muted">
                  {common.arrowLeft} {copy.previousPost}
                </span>
                <span className="mt-2 block text-lg font-semibold text-primary transition-colors group-hover:text-accent">
                  {previousPost.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">{previousPost.summary}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextPost ? (
              <Link
                href={getHref(`/blog/${encodeURIComponent(nextPost.slug)}`)}
                prefetch={false}
                className="group border-t border-edge/70 py-5 sm:border-t-0 sm:pl-7"
              >
                <span className="text-xs font-semibold text-muted">
                  {copy.nextPost} {common.arrowRight}
                </span>
                <span className="mt-2 block text-lg font-semibold text-primary transition-colors group-hover:text-accent">
                  {nextPost.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted">{nextPost.summary}</span>
              </Link>
            ) : null}
          </nav>
        </section>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="section-plain pt-8">
          <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
            {copy.relatedPostsTitle}
          </h2>
          <div className="mt-5 divide-y divide-edge/70 border-y border-edge/70">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={getHref(`/blog/${encodeURIComponent(relatedPost.slug)}`)}
                prefetch={false}
                className="group grid gap-2 py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-5"
              >
                <time dateTime={relatedPost.date} className="text-xs text-muted">
                  {formatDate(relatedPost.date, locale)}
                </time>
                <span>
                  <span className="block text-base font-semibold text-primary transition-colors group-hover:text-accent">
                    {relatedPost.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {relatedPost.summary}
                  </span>
                </span>
                <span className="text-sm font-semibold text-accent">
                  {copy.readMore} {common.arrowRight}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="brand-banner grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="section-kicker">{copy.articleCtaTitle}</p>
          <h2 className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">
            {copy.articleEvidenceTitle}
          </h2>
          <p className="mt-3 text-base leading-7 text-secondary">
            {copy.articleEvidenceDescription}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{copy.articleCtaDescription}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={getHref("/projects")} className="btn-primary">
            {copy.viewProjects}
          </Link>
          <Link href={getHref("/contact")} className="btn-secondary">
            {copy.contactMe}
          </Link>
          <Link href={getHref("/blog")} className="link-accent self-center font-semibold">
            {copy.readMoreArticles} {common.arrowRight}
          </Link>
        </div>
      </section>

      <nav
        className="flex flex-wrap items-center gap-5 border-t border-edge/70 pt-6 text-base"
        aria-label={copy.postNavigationTitle}
      >
        <Link href={getHref("/blog")} className="link-accent font-medium">
          {copy.title}
        </Link>
        <Link href={getHref("/")} className="link-muted font-medium">
          {common.backToHome}
        </Link>
      </nav>
    </main>
  );
}
