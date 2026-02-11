import type { Metadata } from "next";
import { HomePageClient } from "../components/home/home-page-client";
import { getLocale } from "../lib/i18n-server";
import { getHtmlLang, getMessages } from "../lib/i18n";
import { getPublishedPosts } from "../lib/blog";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.homeTitle,
    description: seo.homeDescription
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
        url: "/",
        description: seo.jsonLd.siteDescription,
        inLanguage: getHtmlLang(locale)
      },
      {
        "@type": "Person",
        name: seo.siteName,
        jobTitle: seo.jsonLd.jobTitle,
        url: "/"
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
