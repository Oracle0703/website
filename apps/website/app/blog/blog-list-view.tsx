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
import { TITLE_3XL } from "../../lib/typography";

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

export function BlogListView({
  posts,
  series,
  locale,
  copy,
  common,
  selectedTopic = ""
}: BlogListViewProps) {
  const topicCounts = new Map<BlogTopicId, number>();
  for (const post of posts) {
    if (!post.category) continue;
    topicCounts.set(post.category, (topicCounts.get(post.category) ?? 0) + 1);
  }

  const availableTopics = BLOG_TOPICS.filter((topic) => topicCounts.has(topic.id));

  const hasSelectedTopic = isBlogTopicId(selectedTopic) && topicCounts.has(selectedTopic);
  const filteredPosts = hasSelectedTopic
    ? posts.filter((post) => post.category === selectedTopic)
    : posts;
  const getHref = (href: string) => getLocalePath(href, locale);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-14 sm:px-6 md:space-y-12 md:py-20">
      <header className="space-y-5">
        <p className="text-base text-muted sm:text-lg">{copy.eyebrow}</p>
        <h1 className={`${TITLE_3XL} sm:text-4xl`}>{copy.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-secondary sm:text-lg">
          {copy.description}
        </p>
      </header>

      <section className="panel-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary sm:text-2xl">
              {copy.listTitle}
            </h2>
            <p className="mt-2 text-base leading-7 text-secondary ">
              {copy.listDescription}
            </p>
          </div>
        </div>

        {series.length > 0 && (
          <section className="mt-5 rounded-xl border border-edge/70 bg-base/30 p-4">
            <div className="max-w-3xl">
              <h3 className="text-lg font-semibold text-primary">
                {copy.seriesTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {copy.seriesDescription}
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {series.map((item) => {
                const firstPost = item.posts[0];
                if (!firstPost) return null;

                return (
                  <Link
                    key={item.id}
                    href={getHref(`/blog/${encodeURIComponent(firstPost.slug)}`)}
                    className="card-interactive rounded-xl border border-edge bg-surface/60 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {item.posts.length} {copy.seriesCountSuffix}
                    </p>
                    <h4 className="mt-2 text-base font-semibold text-primary">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-secondary">
                      {firstPost.title}
                    </p>
                    <span className="mt-3 inline-flex text-sm font-semibold text-accent">
                      {copy.seriesFirstPost} {common.arrowRight}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {availableTopics.length > 0 && (
          <div className="mt-5 space-y-3 rounded-xl border border-edge/70 bg-base/30 p-3.5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{copy.topicFilterLabel}</span>
              <Link
                href={getHref("/blog")}
                className={
                  hasSelectedTopic
                    ? "rounded-full border border-edge px-2.5 py-1 text-xs text-secondary hover:bg-primary hover-text-base"
                    : "rounded-full border border-accent/70 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                }
              >
                {copy.allTopics}
              </Link>
              {availableTopics.map((topic) => {
                const count = topicCounts.get(topic.id) ?? 0;
                const isActive = hasSelectedTopic && topic.id === selectedTopic;
                return (
                  <Link
                    key={topic.id}
                    href={`${getHref("/blog")}?topic=${encodeURIComponent(topic.id)}`}
                    className={
                      isActive
                        ? "rounded-full border border-accent/70 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                        : "rounded-full border border-edge px-2.5 py-1 text-xs text-secondary hover:bg-primary hover-text-base"
                    }
                  >
                    {getBlogTopicLabel(topic.id, locale)} ({count})
                  </Link>
                );
              })}
            </div>
            {hasSelectedTopic && (
              <p className="text-xs text-muted">
                {copy.filterActive}:{" "}
                <span className="text-secondary">
                  {getBlogTopicLabel(selectedTopic, locale)}
                </span>
              </p>
            )}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-edge p-6 text-center">
            <p className="text-lg font-semibold text-primary">
              {copy.emptyTitle}
            </p>
            <p className="mt-2 text-lg text-muted">{copy.emptyDescription}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {filteredPosts.map((post) => {
              const showUpdated = post.updatedAt && post.updatedAt !== post.date;

              return (
                <article
                  key={post.slug}
                  className="group card-interactive rounded-2xl border border-edge bg-base/40 p-5 sm:p-6"
                >
                  <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-stretch">
                    <div className="flex flex-col gap-5 md:h-full">
                      <div className="space-y-4 sm:space-y-5">
                        <Link
                          href={getHref(`/blog/${encodeURIComponent(post.slug)}`)}
                          className="-mx-1 rounded-sm px-1 text-lg font-semibold leading-snug text-primary transition-colors hover:bg-accent/15 hover:text-accent-strong sm:text-xl"
                        >
                          {post.title}
                        </Link>
                        <p
                          className="mt-4 text-sm leading-6 sm:text-base sm:leading-8"
                          style={{
                            color: "rgb(var(--ui-text-secondary-rgb) / 1)"
                          }}
                        >
                          {post.summary}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                          <span>
                            {copy.publishedAt} · {formatDate(post.date, locale)}
                          </span>
                          {showUpdated && (
                            <span>
                              {copy.updatedAt} ·{" "}
                              {formatDate(post.updatedAt, locale)}
                            </span>
                          )}
                          <span>
                            {copy.readingTime} · {post.readingTime}{" "}
                            {copy.minute}
                          </span>
                        </div>

                        {post.category && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-secondary">
                            <span className="inline-flex items-center text-muted">
                              {copy.topicLabel}:
                            </span>
                            <span className="inline-flex items-center rounded-full border border-edge-strong px-2.5 py-0.5">
                              {getBlogTopicLabel(post.category, locale)}
                            </span>
                          </div>
                        )}

                        <Link
                          href={getHref(`/blog/${encodeURIComponent(post.slug)}`)}
                          className="mt-2 inline-flex pt-1 text-base font-semibold text-accent text-primary transition-colors hover:text-accent-strong"
                        >
                          {copy.readMore} {common.arrowRight}
                        </Link>
                      </div>
                    </div>

                    {post.cover?.src && (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/40 md:aspect-auto md:h-full">
                        <BlogCoverImage
                          src={post.cover.src}
                          alt={post.cover.alt}
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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
