import type { Metadata } from "next";
import { HomePageClient } from "../../components/home/home-page-client";
import { getPublishedPostsForLocale } from "../../lib/blog";
import { getPublishedSeriesForLocale } from "../../lib/blog-series";
import { getMessages, type Locale } from "../../lib/i18n";
import { getFeaturedProjectViews } from "../../lib/projects";
import { getJsonLdLanguage, getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    alternates: {
      ...getLanguageAlternates("/en"),
      canonical: toAbsoluteUrl("/en")
    },
    openGraph: {
      title: seo.homeTitle,
      description: seo.homeDescription,
      url: toAbsoluteUrl("/en"),
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
  const { seo } = getMessages(locale);
  const latestBlogItems = getPublishedPostsForLocale(locale)
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      subtitle: post.summary,
      date: post.date,
      href: `/en/blog/${encodeURIComponent(post.slug)}`
    }));
  const featuredProjects = getFeaturedProjectViews("en")
    .slice(0, 3)
    .map((project) => ({
      title: project.title,
      subtitle: project.subtitle,
      status: project.status,
      type: project.type,
      stack: project.stack,
      href: `/en/projects/${encodeURIComponent(project.slug)}`
    }));
  const featuredSeries = getPublishedSeriesForLocale(locale)
    .slice(0, 3)
    .flatMap((series) => {
      const firstPost = series.posts[0];
      if (!firstPost) return [];
      return [
        {
          title: series.title,
          count: series.posts.length,
          href: `/en/blog/${encodeURIComponent(firstPost.slug)}`
        }
      ];
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: seo.siteName,
        url: toAbsoluteUrl("/en"),
        description: seo.jsonLd.siteDescription,
        inLanguage: getJsonLdLanguage(locale)
      },
      {
        "@type": "Person",
        name: seo.siteName,
        jobTitle: seo.jsonLd.jobTitle,
        url: toAbsoluteUrl("/en")
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
