import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import { getPublishedPosts } from "../../lib/blog";
import { TITLE_3XL } from "../../lib/typography";

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
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-14 sm:px-6 md:space-y-12 md:py-20">
      <header className="space-y-5">
        <p className="text-base text-muted sm:text-lg">{copy.eyebrow}</p>
        <h1 className={`${TITLE_3XL} sm:text-5xl`}>{copy.title}</h1>
        <p className="max-w-3xl text-lg leading-8 text-secondary">{copy.description}</p>
      </header>

      <section className="panel-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">{copy.listTitle}</h2>
            <p className="mt-2 text-lg leading-8 text-secondary">{copy.listDescription}</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-edge p-6 text-center">
            <p className="text-lg font-semibold text-primary">{copy.emptyTitle}</p>
            <p className="mt-2 text-lg text-muted">{copy.emptyDescription}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {posts.map((post) => {
              const cover = getCover(post);
              const showUpdated = post.updatedAt && post.updatedAt !== post.date;

              return (
                <article
                  key={post.slug}
                  className="group card-interactive rounded-2xl border border-edge bg-base/40 p-6"
                >
                  <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Link
                          href={`/blog/${encodeURIComponent(post.slug)}`}
                          className="-mx-1 rounded-sm px-1 text-2xl font-semibold leading-snug text-primary transition-colors hover:bg-primary hover-text-base sm:text-[1.75rem]"
                        >
                          {post.title}
                        </Link>
                        <p className="text-lg leading-8 text-secondary">{post.summary}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-base text-muted">
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
                        <div className="flex flex-wrap gap-2.5 text-base text-secondary">
                          <span className="text-muted">{copy.tagsLabel}:</span>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-edge-strong px-3 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/blog/${encodeURIComponent(post.slug)}`}
                        className="text-lg font-semibold text-accent transition-colors hover:text-accent-strong"
                      >
                        {copy.readMore} {common.arrowRight}
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


