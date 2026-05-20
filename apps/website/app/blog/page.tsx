import type { Metadata } from "next";
import { Suspense } from "react";
import type { BlogPost } from "../../lib/blog";
import type { BlogSeries } from "../../lib/blog-series";
import { getPublishedPosts } from "../../lib/blog";
import { getPublishedSeries } from "../../lib/blog-series";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";
import { BlogClient, type BlogListPost, type BlogListSeries } from "./blog-client";
import { BlogListView } from "./blog-list-view";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.blogTitle,
    description: seo.blogDescription,
    alternates: getLanguageAlternates("/blog"),
    openGraph: {
      title: seo.blogTitle,
      description: seo.blogDescription,
      url: toAbsoluteUrl("/blog"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.blogTitle,
      description: seo.blogDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

function getCover(post: BlogPost) {
  if (typeof post.cover === "string") {
    return { src: post.cover, alt: post.title };
  }

  return post.cover;
}

function mapPostForList(post: BlogPost): BlogListPost {
  return {
    title: post.title,
    slug: post.slug,
    date: post.date,
    updatedAt: post.updatedAt,
    summary: post.summary,
    cover: getCover(post),
    tags: post.tags,
    readingTime: post.readingTime
  };
}

function mapSeriesForList(series: BlogSeries): BlogListSeries {
  return {
    id: series.id,
    title: series.title,
    posts: series.posts.map((post) => ({
      title: post.title,
      slug: post.slug
    }))
  };
}

export default function Page() {
  const posts = getPublishedPosts().map(mapPostForList);
  const series = getPublishedSeries().map(mapSeriesForList);
  const { pages } = getMessages(defaultLocale);

  return (
    <Suspense
      fallback={
        <BlogListView
          posts={posts}
          series={series}
          locale={defaultLocale}
          copy={pages.blog}
          common={pages.common}
        />
      }
    >
      <BlogClient posts={posts} series={series} />
    </Suspense>
  );
}
