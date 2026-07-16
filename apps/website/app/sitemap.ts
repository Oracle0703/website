import type { MetadataRoute } from "next";
import { getPublishedPosts, hasPostLocale } from "../lib/blog";
import { getAllProjects } from "../lib/projects";
import { getLocalePath } from "../lib/locale-routing";
import { PUBLIC_WEBSITE_LOCALE_ROUTES } from "../lib/public-routes";
import { getSiteBaseUrl } from "../lib/site-url";

const NON_INDEXABLE_ROUTES = new Set(["/enter", "/en/enter"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();

  const entries: MetadataRoute.Sitemap = PUBLIC_WEBSITE_LOCALE_ROUTES
    .filter((route) => !NON_INDEXABLE_ROUTES.has(route.canonicalPath))
    .map((route) => ({
      url: `${baseUrl}${route.canonicalPath === "/" ? "" : route.canonicalPath}`
    }));

  const posts = getPublishedPosts().filter((post) => !post.seo?.noindex);
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

  const projects = getAllProjects();
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
