import type { BlogPost } from "./blog";
import { getPublishedPosts, getPublishedPostsForLocale } from "./blog";
import type { Locale } from "./i18n";

export type BlogSeries = {
  id: string;
  title: string;
  posts: BlogPost[];
};

function bySeriesOrder(a: BlogPost, b: BlogPost) {
  const orderDiff = (a.series?.order ?? 0) - (b.series?.order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function groupPublishedSeries(posts: BlogPost[]) {
  const groups = new Map<string, BlogSeries>();

  for (const post of posts) {
    if (!post.series) continue;

    const existing = groups.get(post.series.id) ?? {
      id: post.series.id,
      title: post.series.title,
      posts: []
    };

    existing.posts.push(post);
    groups.set(post.series.id, existing);
  }

  return [...groups.values()]
    .map((series) => ({
      ...series,
      posts: series.posts.sort(bySeriesOrder)
    }))
    .sort((a, b) => {
      const firstA = a.posts[0];
      const firstB = b.posts[0];
      if (!firstA || !firstB) return a.title.localeCompare(b.title);
      return new Date(firstB.date).getTime() - new Date(firstA.date).getTime();
    });
}

export function getPublishedSeries() {
  return groupPublishedSeries(getPublishedPosts());
}

export function getPublishedSeriesForLocale(locale: Locale) {
  return groupPublishedSeries(getPublishedPostsForLocale(locale));
}

export function getSeriesByPostSlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return (
    getPublishedSeries().find((series) =>
      series.posts.some((post) => post.slug === decodedSlug)
    ) ?? null
  );
}

export function getSeriesByPostSlugForLocale(slug: string, locale: Locale) {
  const decodedSlug = decodeURIComponent(slug);
  return (
    getPublishedSeriesForLocale(locale).find((series) =>
      series.posts.some((post) => post.slug === decodedSlug)
    ) ?? null
  );
}
