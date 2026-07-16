"use client";

import { useSearchParams } from "next/navigation";
import { useI18n } from "../../components/language-provider";
import {
  BlogListView,
  type BlogListPost,
  type BlogListSeries
} from "./blog-list-view";

export type { BlogListPost, BlogListSeries } from "./blog-list-view";

type BlogClientProps = {
  posts: BlogListPost[];
  series: BlogListSeries[];
};

function normalizeTopicParam(topic: string | null) {
  if (!topic) return "";

  return topic.trim();
}

export function BlogClient({ posts, series }: BlogClientProps) {
  const searchParams = useSearchParams();
  const { locale, messages } = useI18n();
  const selectedTopic = normalizeTopicParam(searchParams.get("topic"));

  return (
    <BlogListView
      posts={posts}
      series={series}
      locale={locale}
      copy={messages.pages.blog}
      common={messages.pages.common}
      selectedTopic={selectedTopic}
    />
  );
}
