import type { Metadata } from "next";
import { HomePageClient } from "../components/home/home-page-client";
import { getLocale } from "../lib/i18n-server";
import { getHtmlLang, getMessages } from "../lib/i18n";
import { getPublishedPosts } from "../lib/blog";
import { toAbsoluteUrl } from "../lib/site-url";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    alternates: {
      canonical: toAbsoluteUrl("/")
    },
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
  const locale = getLocale();
  const { seo } = getMessages(locale);
  const latestBlogItems = getPublishedPosts()
    .slice(0, 3)
    .map((post) => ({
      title: post.title,
      subtitle: post.summary,
      date: post.date,
      href: `/blog/${encodeURIComponent(post.slug)}`
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: seo.siteName,
        url: toAbsoluteUrl("/"),
        description: seo.jsonLd.siteDescription,
        inLanguage: getHtmlLang(locale)
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
      <HomePageClient latestBlogItems={latestBlogItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
