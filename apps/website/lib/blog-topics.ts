import type { Locale } from "./i18n";

export const BLOG_TOPICS = [
  { id: "engineering", zh: "工程实践", en: "Engineering" },
  { id: "product", zh: "产品设计", en: "Product Design" },
  { id: "security", zh: "安全与运维", en: "Security & Ops" },
  { id: "seo", zh: "内容与 SEO", en: "Content & SEO" },
  { id: "labs", zh: "实验工具", en: "Labs & Tools" }
] as const;

export type BlogTopicId = (typeof BLOG_TOPICS)[number]["id"];

export function isBlogTopicId(value: unknown): value is BlogTopicId {
  return typeof value === "string" && BLOG_TOPICS.some((topic) => topic.id === value);
}

export function getBlogTopicLabel(topicId: string, locale: Locale) {
  const topic = BLOG_TOPICS.find((item) => item.id === topicId);
  return topic ? topic[locale] : topicId;
}
