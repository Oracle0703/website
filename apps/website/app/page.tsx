import type { Metadata } from "next";
import { HomePageClient } from "../components/home/home-page-client";
import { defaultLocale, getMessages } from "../lib/i18n";
import { getPublishedPosts } from "../lib/blog";
import { getPublishedSeries } from "../lib/blog-series";
import { getFeaturedProjectViews } from "../lib/projects";
import { getJsonLdLanguage, getLanguageAlternates } from "../lib/seo";
import { toAbsoluteUrl } from "../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    alternates: getLanguageAlternates("/"),
    openGraph: {
      title: seo.homeTitle,
      description: seo.homeDescription,
      url: toAbsoluteUrl("/"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.homeTitle,
      description: seo.homeDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function HomePage() {
  const { seo } = getMessages(defaultLocale);
  const latestBlogItems = getPublishedPosts()
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      subtitle: post.summary,
      date: post.date,
      href: `/blog/${encodeURIComponent(post.slug)}`
    }));
  const featuredProjects = getFeaturedProjectViews(defaultLocale)
    .slice(0, 3)
    .map((project) => ({
      title: project.title,
      subtitle: project.subtitle,
      status: project.status,
      type: project.type,
      stack: project.stack,
      href: `/projects/${encodeURIComponent(project.slug)}`
    }));
  const featuredSeries = getPublishedSeries()
    .slice(0, 3)
    .flatMap((series) => {
      const firstPost = series.posts[0];
      if (!firstPost) return [];
      return [
        {
          title: series.title,
          count: series.posts.length,
          href: `/blog/${encodeURIComponent(firstPost.slug)}`
        }
      ];
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: seo.siteName,
        url: toAbsoluteUrl("/"),
        description: seo.jsonLd.siteDescription,
        inLanguage: getJsonLdLanguage(defaultLocale)
      },
      {
        "@type": "Person",
        name: seo.siteName,
        jobTitle: seo.jsonLd.jobTitle,
        url: toAbsoluteUrl("/")
      }
    ]
  };

  return (
    <>
      <HomePageClient
        latestBlogItems={latestBlogItems}
        featuredProjects={featuredProjects}
        featuredSeries={featuredSeries}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
