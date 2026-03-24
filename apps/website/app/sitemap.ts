import type { MetadataRoute } from "next";
import { getPublishedPosts } from "../lib/blog";
import { getSiteBaseUrl } from "../lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const now = new Date();

  const staticPages = ["/", "/blog", "/labs", "/tracker", "/about", "/contact", "/enter", "/ai-page-analysis"];

  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path === "/" ? "" : path}`,
    lastModified: now
  }));

  const posts = getPublishedPosts();
  for (const post of posts) {
    const slug = encodeURIComponent(post.slug);
    const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date(post.date);
    entries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified
    });
  }

  return entries;
}
