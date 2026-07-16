"use client";

import { useSearchParams } from "next/navigation";
import type { Locale, Messages } from "../../lib/i18n";
import {
  BlogListView,
  type BlogListPost,
  type BlogListSeries
} from "./blog-list-view";

export type { BlogListPost, BlogListSeries } from "./blog-list-view";

type BlogClientProps = {
  posts: BlogListPost[];
  series: BlogListSeries[];
  locale: Locale;
  copy: Messages["pages"]["blog"];
  common: Messages["pages"]["common"];
};

function normalizeTopicParam(topic: string | null) {
  if (!topic) return "";

  return topic.trim();
}

export function BlogClient({ posts, series, locale, copy, common }: BlogClientProps) {
  const searchParams = useSearchParams();
  const selectedTopic = normalizeTopicParam(searchParams.get("topic"));

  return (
    <BlogListView
      posts={posts}
      series={series}
      locale={locale}
      copy={copy}
      common={common}
      selectedTopic={selectedTopic}
    />
  );
}
