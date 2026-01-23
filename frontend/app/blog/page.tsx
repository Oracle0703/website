import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import { getPublishedPosts } from "../../lib/blog";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.blogTitle,
    description: seo.blogDescription
  };
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(date));
}

function getCover(post: ReturnType<typeof getPublishedPosts>[number]) {
  if (typeof post.cover === "string") {
    return { src: post.cover, alt: post.title };
  }
  return post.cover;
}

export default function Page() {
  const locale = getLocale();
  const { pages } = getMessages(locale);
  const copy = pages.blog;
  const common = pages.common;
  const posts = getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-12 sm:px-6 md:space-y-12 md:py-16">
      <header className="space-y-3">
        <p className="text-sm text-muted">{copy.eyebrow}</p>
        <h1 className="text-3xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-muted">{copy.description}</p>
      </header>

      <section className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{copy.listTitle}</h2>
            <p className="mt-1 text-sm text-muted">{copy.listDescription}</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-edge p-6 text-center">
            <p className="text-sm font-semibold text-primary">{copy.emptyTitle}</p>
            <p className="mt-2 text-xs text-muted">{copy.emptyDescription}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {posts.map((post) => {
              const cover = getCover(post);
              const showUpdated = post.updatedAt && post.updatedAt !== post.date;

              return (
                <article
                  key={post.slug}
                  className="rounded-2xl border border-edge bg-base/40 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Link
                          href={`/blog/${encodeURIComponent(post.slug)}`}
                          className="text-lg font-semibold text-primary hover:text-accent"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-muted">{post.summary}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted">
                        <span>
                          {copy.publishedAt} · {formatDate(post.date, locale)}
                        </span>
                        {showUpdated && (
                          <span>
                            {copy.updatedAt} · {formatDate(post.updatedAt, locale)}
                          </span>
                        )}
                        <span>
                          {copy.readingTime} · {post.readingTime} {copy.minute}
                        </span>
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-secondary">
                          <span className="text-muted">{copy.tagsLabel}:</span>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-edge-strong px-2 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        className="text-sm font-semibold text-accent hover:text-accent-strong"
                      >
                        {copy.readMore} →
                      </Link>
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

      <div className="flex gap-4 text-sm">
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
