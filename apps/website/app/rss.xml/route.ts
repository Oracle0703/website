import { getPublishedPostsForLocale } from "../../lib/blog";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { renderRssFeed } from "../../lib/rss.mjs";
import { toAbsoluteUrl } from "../../lib/site-url";

export const dynamic = "force-static";

export function GET() {
  const { seo } = getMessages(defaultLocale);
  const posts = getPublishedPostsForLocale(defaultLocale).filter(
    (post) => !post.seo?.noindex
  );
  const xml = renderRssFeed({
    title: `${seo.siteName} RSS`,
    description: seo.defaultDescription,
    siteUrl: toAbsoluteUrl("/"),
    feedUrl: toAbsoluteUrl("/rss.xml"),
    language: "zh-CN",
    items: posts.map((post) => ({
      title: post.title,
      url: toAbsoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      summary: post.summary,
      publishedAt: post.date,
      updatedAt: post.updatedAt,
      categories: post.category ? [post.category] : []
    }))
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
