import { getPublishedPostsForLocale } from "../../../lib/blog";
import { getMessages, type Locale } from "../../../lib/i18n";
import { renderRssFeed } from "../../../lib/rss.mjs";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const dynamic = "force-static";

export function GET() {
  const { seo } = getMessages(locale);
  const posts = getPublishedPostsForLocale(locale).filter(
    (post) => !post.seo?.noindex
  );
  const xml = renderRssFeed({
    title: `${seo.siteName} English RSS`,
    description: seo.defaultDescription,
    siteUrl: toAbsoluteUrl("/en"),
    feedUrl: toAbsoluteUrl("/en/rss.xml"),
    language: "en",
    items: posts.map((post) => ({
      title: post.title,
      url: toAbsoluteUrl(`/en/blog/${encodeURIComponent(post.slug)}`),
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
