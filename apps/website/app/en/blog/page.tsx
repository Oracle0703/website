import type { Metadata } from "next";
import { Suspense } from "react";
import type { BlogPost } from "../../../lib/blog";
import type { BlogSeries } from "../../../lib/blog-series";
import { getPublishedPostsForLocale } from "../../../lib/blog";
import { getPublishedSeriesForLocale } from "../../../lib/blog-series";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { BlogClient, type BlogListPost, type BlogListSeries } from "../../blog/blog-client";
import { BlogListView } from "../../blog/blog-list-view";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.blogTitle,
    description: seo.blogDescription,
    alternates: {
      ...getLanguageAlternates("/en/blog"),
      canonical: toAbsoluteUrl("/en/blog")
    },
    openGraph: {
      title: seo.blogTitle,
      description: seo.blogDescription,
      url: toAbsoluteUrl("/en/blog"),
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
    category: post.category,
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
  const posts = getPublishedPostsForLocale(locale).map(mapPostForList);
  const series = getPublishedSeriesForLocale(locale).map(mapSeriesForList);
  const { pages } = getMessages(locale);

  return (
    <Suspense
      fallback={
        <BlogListView
          posts={posts}
          series={series}
          locale={locale}
          copy={pages.blog}
          common={pages.common}
        />
      }
    >
      <BlogClient
        posts={posts}
        series={series}
        locale={locale}
        copy={pages.blog}
        common={pages.common}
      />
    </Suspense>
  );
}
