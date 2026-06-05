import type { MetadataRoute } from "next";
import { getPublishedPosts, hasPostLocale } from "../lib/blog";
import { getAllProjects } from "../lib/projects";
import { getLocalePath } from "../lib/locale-routing";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../lib/public-routes";
import { getSiteBaseUrl } from "../lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const posts = getPublishedPosts();
  const projects = getAllProjects();

  // Freshness hint for the static routes: the most recent content update across
  // posts and projects (ISO date strings sort lexicographically).
  const contentDates = [
    ...posts.map((post) => post.updatedAt || post.date),
    ...projects.map((project) => project.updatedAt)
  ].filter((value): value is string => Boolean(value));
  const latestContent = contentDates.length
    ? new Date(contentDates.slice().sort().at(-1) as string)
    : undefined;

  const entries: MetadataRoute.Sitemap = PUBLIC_WEBSITE_LOCALE_ROUTES.map((route) => ({
    url: `${baseUrl}${route.canonicalPath === "/" ? "" : route.canonicalPath}`,
    ...(latestContent ? { lastModified: latestContent } : {})
  }));

  for (const post of posts) {
    const slug = encodeURIComponent(post.slug);
    const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date(post.date);
    for (const locale of ["zh", "en"] as const) {
      if (!hasPostLocale(post, locale)) continue;
      entries.push({
        url: `${baseUrl}${getLocalePath(`/blog/${slug}`, locale)}`,
        lastModified
      });
    }
  }

  for (const project of projects) {
    for (const locale of ["zh", "en"] as const) {
      entries.push({
        url: `${baseUrl}${getLocalePath(
          `/projects/${encodeURIComponent(project.slug)}`,
          locale
        )}`,
        lastModified: new Date(project.updatedAt)
      });
    }
  }

  return entries;
}
