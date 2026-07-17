import type { Metadata } from "next";
import { HomePageClient } from "../../components/home/home-page-client";
import { getPublishedPostsForLocale } from "../../lib/blog";
import { getMessages, type Locale } from "../../lib/i18n";
import { getFeaturedProjectViews, getProjectViews } from "../../lib/projects";
import { getJsonLdLanguage, getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";
import { getChangelogCopy, getRecentChangelogEntries } from "../../lib/changelog";
import { getPersonStructuredData, siteIdentity } from "../../lib/site-identity";

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
  const { seo, home, pages } = getMessages(locale);
  const changelogCopy = getChangelogCopy(locale);
  const latestChangelogItems = getRecentChangelogEntries(locale, 3);
  const projectViews = getProjectViews(locale);
  const proofMetrics = {
    projectCount: projectViews.length,
    demoCount: projectViews.filter((project) => project.entry.demo.status === "available").length
  };
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
      evidence: project.evidence[0]?.value,
      asset:
        project.asset.kind === "screenshot" ||
        project.asset.kind === "mock" ||
        project.asset.kind === "diagram"
          ? {
              src: project.asset.src,
              alt: project.asset.alt,
              caption: project.asset.caption
            }
          : undefined,
      href: `/en/projects/${encodeURIComponent(project.slug)}`
    }));

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
      getPersonStructuredData(locale, toAbsoluteUrl(`/en${siteIdentity.profilePath}`))
    ]
  };

  return (
    <>
      <HomePageClient
        locale={locale}
        copy={home}
        common={pages.common}
        projectStatusLabels={pages.projects.status}
        latestBlogItems={latestBlogItems}
        latestChangelogItems={latestChangelogItems}
        changelogCopy={changelogCopy.home}
        changelogKindLabels={changelogCopy.kindLabels}
        featuredProjects={featuredProjects}
        proofMetrics={proofMetrics}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
