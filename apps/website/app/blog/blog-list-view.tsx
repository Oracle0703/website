import Link from "next/link";
import { BlogCoverImage } from "../../components/blog-cover-image";
import type { CoverImage } from "../../lib/blog";
import {
  BLOG_TOPICS,
  getBlogTopicLabel,
  isBlogTopicId,
  type BlogTopicId
} from "../../lib/blog-topics";
import type { Locale, getMessages } from "../../lib/i18n";
import { getLocalePath } from "../../lib/locale-routing";

type Messages = ReturnType<typeof getMessages>;
type BlogCopy = Messages["pages"]["blog"];
type CommonCopy = Messages["pages"]["common"];

export type BlogListPost = {
  title: string;
  slug: string;
  date: string;
  updatedAt: string;
  summary: string;
  cover: CoverImage;
  category?: BlogTopicId;
  readingTime: number;
};

export type BlogListSeries = {
  id: string;
  title: string;
  posts: {
    title: string;
    slug: string;
  }[];
};

type BlogListViewProps = {
  posts: BlogListPost[];
  series: BlogListSeries[];
  locale: Locale;
  copy: BlogCopy;
  common: CommonCopy;
  selectedTopic?: string;
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(date));
}

function hasDistinctCover(cover: CoverImage) {
  const sourcePath = cover.src.split(/[?#]/, 1)[0];
  return Boolean(sourcePath && sourcePath !== "/og.png");
}

export function BlogListView({
  posts,
  series,
  locale,
  copy,
  common,
  selectedTopic = ""
}: BlogListViewProps) {
  const hasSelectedTopic = isBlogTopicId(selectedTopic);
  const filteredPosts = hasSelectedTopic
    ? posts.filter((post) => post.category === selectedTopic)
    : posts;
  const [featuredPost, ...latestPosts] = filteredPosts;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-14 sm:px-6 md:space-y-12 md:py-20">
      <header className="space-y-5 border-b border-edge/70 pb-10 md:pb-14">
        <p className="section-kicker">{copy.eyebrow}</p>
        <h1 className="text-4xl font-semibold tracking-[-0.035em] text-primary sm:text-5xl">
          {copy.title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-secondary sm:text-lg">
          {copy.description}
        </p>
      </header>

      <section aria-labelledby="latest-posts-heading" className="space-y-7">
        <div className="max-w-3xl">
          <h2
            id="latest-posts-heading"
            className="text-xl font-semibold text-primary sm:text-2xl"
          >
            {copy.listTitle}
          </h2>
          <p className="mt-2 text-base leading-7 text-secondary">
            {copy.listDescription}
          </p>
        </div>

        <nav aria-label={copy.topicFilterLabel} className="border-b border-edge">
          <div className="flex items-end gap-5 overflow-x-auto">
            <span className="shrink-0 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {copy.topicFilterLabel}
            </span>
            <Link
              href={getHref("/blog")}
              prefetch={false}
              aria-current={!hasSelectedTopic ? "page" : undefined}
              className={`shrink-0 border-b-2 py-3 text-sm font-medium transition-colors ${
                hasSelectedTopic
                  ? "border-transparent text-muted hover:border-edge-strong hover:text-primary"
                  : "border-accent text-accent"
              }`}
            >
              {copy.allTopics}
            </Link>
            {BLOG_TOPICS.map((topic) => {
              const isActive = hasSelectedTopic && topic.id === selectedTopic;
              return (
                <Link
                  key={topic.id}
                  href={`${getHref("/blog")}?topic=${encodeURIComponent(topic.id)}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 border-b-2 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:border-edge-strong hover:text-primary"
                  }`}
                >
                  {getBlogTopicLabel(topic.id, locale)}
                </Link>
              );
            })}
          </div>
        </nav>

        {hasSelectedTopic && (
          <p className="text-sm text-muted">
            {copy.filterActive}:{" "}
            <span className="font-medium text-secondary">
              {getBlogTopicLabel(selectedTopic, locale)}
            </span>
          </p>
        )}

        {!featuredPost ? (
          <div className="border-y border-dashed border-edge py-10 text-center">
            <p className="text-lg font-semibold text-primary">
              {copy.emptyTitle}
            </p>
            <p className="mt-2 text-lg text-muted">{copy.emptyDescription}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <article className="border-b border-edge pb-8">
              <div
                className={
                  hasDistinctCover(featuredPost.cover)
                    ? "grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center"
                    : "max-w-3xl"
                }
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span>
                      {copy.publishedAt} · {formatDate(featuredPost.date, locale)}
                    </span>
                    {featuredPost.updatedAt &&
                      featuredPost.updatedAt !== featuredPost.date && (
                        <span>
                          {copy.updatedAt} ·{" "}
                          {formatDate(featuredPost.updatedAt, locale)}
                        </span>
                      )}
                    <span>
                      {copy.readingTime} · {featuredPost.readingTime} {copy.minute}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-primary sm:text-3xl">
                    <Link
                      href={getHref(
                        `/blog/${encodeURIComponent(featuredPost.slug)}`
                      )}
                      prefetch={false}
                      className="rounded-sm transition-colors hover:text-accent-strong"
                    >
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-base leading-7 text-secondary sm:text-lg sm:leading-8">
                    {featuredPost.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {featuredPost.category && (
                      <span className="text-sm text-muted">
                        {copy.topicLabel}: {" "}
                        <span className="font-medium text-secondary">
                          {getBlogTopicLabel(featuredPost.category, locale)}
                        </span>
                      </span>
                    )}
                    <Link
                      href={getHref(
                        `/blog/${encodeURIComponent(featuredPost.slug)}`
                      )}
                      prefetch={false}
                      className="text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                    >
                      {copy.readMore} {common.arrowRight}
                    </Link>
                  </div>
                </div>

                {hasDistinctCover(featuredPost.cover) && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/40">
                    <BlogCoverImage
                      src={featuredPost.cover.src}
                      alt={featuredPost.cover.alt}
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                )}
              </div>
            </article>

            {latestPosts.length > 0 && (
              <div className="divide-y divide-edge border-y border-edge">
                {latestPosts.map((post) => {
                  const showUpdated =
                    post.updatedAt && post.updatedAt !== post.date;
                  const showCover = hasDistinctCover(post.cover);

                  return (
                    <article
                      key={post.slug}
                      className={`grid gap-5 py-6 sm:py-7 ${
                        showCover
                          ? "sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center"
                          : "max-w-3xl"
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                          <span>{formatDate(post.date, locale)}</span>
                          {showUpdated && (
                            <span>
                              {copy.updatedAt} ·{" "}
                              {formatDate(post.updatedAt, locale)}
                            </span>
                          )}
                          <span>
                            {post.readingTime} {copy.minute}
                          </span>
                          {post.category && (
                            <span>
                              {getBlogTopicLabel(post.category, locale)}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-semibold leading-snug text-primary sm:text-xl">
                          <Link
                            href={getHref(
                              `/blog/${encodeURIComponent(post.slug)}`
                            )}
                            prefetch={false}
                            className="rounded-sm transition-colors hover:text-accent-strong"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-secondary sm:text-base sm:leading-7">
                          {post.summary}
                        </p>
                      </div>

                      {showCover && (
                        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-edge bg-base/40">
                          <BlogCoverImage
                            src={post.cover.src}
                            alt={post.cover.alt}
                            sizes="(max-width: 640px) 100vw, 12rem"
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {series.length > 0 && (
        <section
          aria-labelledby="blog-series-heading"
          className="border-t border-edge pt-8"
        >
          <div className="max-w-3xl">
            <h2
              id="blog-series-heading"
              className="text-lg font-semibold text-primary sm:text-xl"
            >
              {copy.seriesTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy.seriesDescription}
            </p>
          </div>

          <ol className="mt-5 divide-y divide-edge border-y border-edge">
            {series.map((item) => {
              const firstPost = item.posts[0];
              if (!firstPost) return null;

              return (
                <li
                  key={item.id}
                  className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                >
                  <div>
                    <Link
                      href={getHref(
                        `/blog/${encodeURIComponent(firstPost.slug)}`
                      )}
                      prefetch={false}
                      className="font-semibold text-primary transition-colors hover:text-accent-strong"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-secondary">
                      {firstPost.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted sm:justify-end">
                    <span>
                      {item.posts.length} {copy.seriesCountSuffix}
                    </span>
                    <Link
                      href={getHref(
                        `/blog/${encodeURIComponent(firstPost.slug)}`
                      )}
                      prefetch={false}
                      className="font-semibold text-accent transition-colors hover:text-accent-strong"
                    >
                      {copy.seriesFirstPost} {common.arrowRight}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-5 text-lg text-muted">
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
