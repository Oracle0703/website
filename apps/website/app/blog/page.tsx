import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import { getPublishedPosts } from "../../lib/blog";
import { TITLE_3XL } from "../../lib/typography";

type PageProps = {
  searchParams?: {
    tag?: string | string[];
  };
};

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.blogTitle,
    description: seo.blogDescription,
  };
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function getCover(post: ReturnType<typeof getPublishedPosts>[number]) {
  if (typeof post.cover === "string") {
    return { src: post.cover, alt: post.title };
  }
  return post.cover;
}

function normalizeTagParam(tag?: string | string[]) {
  const raw = Array.isArray(tag) ? tag[0] : tag;
  if (!raw) return "";
  const decoded = decodeURIComponent(raw).trim();
  return decoded;
}

export default function Page({ searchParams }: PageProps) {
  const locale = getLocale();
  const { pages } = getMessages(locale);
  const copy = pages.blog;
  const common = pages.common;
  const posts = getPublishedPosts();
  const selectedTag = normalizeTagParam(searchParams?.tag);

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  const hasSelectedTag = selectedTag.length > 0 && tagCounts.has(selectedTag);
  const filteredPosts = hasSelectedTag
    ? posts.filter((post) => (post.tags ?? []).includes(selectedTag))
    : posts;

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

        {sortedTags.length > 0 && (
          <div className="mt-5 space-y-3 rounded-xl border border-edge/70 bg-base/30 p-3.5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{copy.tagFilterLabel}</span>
              <Link
                href="/blog"
                className={
                  hasSelectedTag
                    ? "rounded-full border border-edge px-2.5 py-1 text-xs text-secondary hover:bg-primary hover-text-base"
                    : "rounded-full border border-accent/70 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                }
              >
                {copy.allTags}
              </Link>
              {sortedTags.map(([tag, count]) => {
                const isActive = hasSelectedTag && tag === selectedTag;
                return (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className={
                      isActive
                        ? "rounded-full border border-accent/70 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                        : "rounded-full border border-edge px-2.5 py-1 text-xs text-secondary hover:bg-primary hover-text-base"
                    }
                  >
                    {tag} ({count})
                  </Link>
                );
              })}
            </div>
            {hasSelectedTag && (
              <p className="text-xs text-muted">
                {copy.filterActive}:{" "}
                <span className="text-secondary">{selectedTag}</span>
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
              const cover = getCover(post);
              const showUpdated =
                post.updatedAt && post.updatedAt !== post.date;

              return (
                <article
                  key={post.slug}
                  className="group card-interactive rounded-2xl border border-edge bg-base/40 p-5 sm:p-6"
                >
                  <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-stretch">
                    <div className="flex flex-col gap-5 md:h-full">
                      <div className="space-y-4 sm:space-y-5">
                        <Link
                          href={`/blog/${encodeURIComponent(post.slug)}`}
                          className="-mx-1 rounded-sm px-1 text-lg font-semibold leading-snug text-primary transition-colors hover:bg-accent/15 hover:text-accent-strong sm:text-xl"
                        >
                          {post.title}
                        </Link>
                        <p
                          className="text-sm leading-6 sm:text-base sm:leading-8 mt-4"
                          style={{
                            color: "rgb(var(--ui-text-secondary-rgb) / 1)",
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

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-sm text-secondary mt-4">
                            <span className="inline-flex items-center text-muted">
                              {copy.tagsLabel}:
                            </span>
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border border-edge-strong px-2.5 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <Link
                          href={`/blog/${encodeURIComponent(post.slug)}`}
                          className="inline-flex pt-1 text-base font-semibold text-accent transition-colors hover:text-accent-strong text-primary mt-2"
                        >
                          {copy.readMore} {common.arrowRight}
                        </Link>
                      </div>
                    </div>

                    {cover?.src && (
                      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-edge bg-base/40 md:aspect-auto md:h-full">
                        <img
                          src={cover.src}
                          alt={cover.alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
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
