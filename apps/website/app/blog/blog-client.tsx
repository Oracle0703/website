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

function normalizeTagParam(tag: string | null) {
  if (!tag) return "";

  return tag.trim();
}

export function BlogClient({ posts, series }: BlogClientProps) {
  const searchParams = useSearchParams();
  const { locale, messages } = useI18n();
  const selectedTag = normalizeTagParam(searchParams.get("tag"));

  return (
    <BlogListView
      posts={posts}
      series={series}
      locale={locale}
      copy={messages.pages.blog}
      common={messages.pages.common}
      selectedTag={selectedTag}
    />
  );
}
