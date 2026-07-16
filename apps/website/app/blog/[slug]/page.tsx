import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "../../../lib/blog";
import { defaultLocale, getMessages } from "../../../lib/i18n";
import { getPostBySlug, getPublishedPosts, isPublished } from "../../../lib/blog";
import { getSeriesByPostSlug } from "../../../lib/blog-series";
import { getJsonLdLanguage, getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";
import { mdxComponents } from "../../../components/mdx-components";
import { extractTocHeadings } from "../../../lib/blog-headings";
import { BlogDetailClient } from "./blog-detail-client";

type PageProps = {
  params: { slug: string };
};

export const generateStaticParams = () => {
  return getPublishedPosts().map((post) => ({
    slug: post.slug
  }));
};

function getCoverSrc(cover: string | { src: string }) {
  if (typeof cover === "string") return cover;
  return cover.src;
}

function getStructuredDataImageUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") ? src : toAbsoluteUrl(src);
}

function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit = 3) {
  const explicitRelated = new Set(currentPost.relatedPosts ?? []);
  const currentTags = new Set(currentPost.tags ?? []);

  const candidates = allPosts
    .filter((candidate) => candidate.slug !== currentPost.slug)
    .map((candidate) => {
      let score = 0;

      if (explicitRelated.has(candidate.slug)) {
        score += 100;
      }

      const candidateTags = candidate.tags ?? [];
      const sharedTags = candidateTags.filter((tag) => currentTags.has(tag));
      score += sharedTags.length * 10;

      if (currentPost.category && currentPost.category === candidate.category) {
        score += 3;
      }

      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime();
    });

  return candidates.slice(0, limit).map((item) => item.candidate);
}

export const generateMetadata = ({ params }: PageProps): Metadata => {
  const { seo } = getMessages(defaultLocale);
  const post = getPostBySlug(params.slug);

  if (!post || !isPublished(post)) {
    return {
      title: seo.blogTitle,
      description: seo.blogDescription
    };
  }

  const description = post.seo?.description ?? post.summary;
  const cover = post.seo?.ogImage ?? getCoverSrc(post.cover);
  const slug = encodeURIComponent(post.slug);
  const canonicalPath = `/blog/${slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      ...getLanguageAlternates(canonicalPath, post.availableLocales ?? [defaultLocale]),
      canonical: toAbsoluteUrl(canonicalPath)
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: toAbsoluteUrl(canonicalPath),
      images: cover ? [cover] : []
    },
    twitter: {
      title: post.title,
      description,
      images: cover ? [cover] : []
    },
    robots: post.seo?.noindex ? { index: false, follow: true } : undefined
  };
};

export default async function Page({ params }: PageProps) {
  const publishedPosts = getPublishedPosts();
  const post = getPostBySlug(params.slug);

  if (!post || !isPublished(post)) {
    notFound();
  }

  let mdxContent: ReactNode = null;
  let mdxError = false;

  try {
    const compiled = await compileMDX({
      source: post.content,
      components: mdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm]
        }
      }
    });
    mdxContent = compiled.content;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[blog] failed to compile MDX for ${post.slug}`, error);
    }
    mdxError = true;
  }

  const coverSrc = getCoverSrc(post.cover);
  const coverAlt = typeof post.cover === "string" ? post.title : post.cover.alt;
  const showUpdated = Boolean(post.updatedAt && post.updatedAt !== post.date);
  const tocHeadings = extractTocHeadings(post.content);
  const relatedPosts = getRelatedPosts(post, publishedPosts);
  const currentSeries = getSeriesByPostSlug(post.slug);
  const seriesIndex =
    currentSeries?.posts.findIndex((seriesPost) => seriesPost.slug === post.slug) ?? -1;
  const previousSeriesPost =
    currentSeries && seriesIndex > 0 ? currentSeries.posts[seriesIndex - 1] : null;
  const nextSeriesPost =
    currentSeries && seriesIndex >= 0 && seriesIndex < currentSeries.posts.length - 1
      ? currentSeries.posts[seriesIndex + 1]
      : null;
  const currentIndex = publishedPosts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < publishedPosts.length - 1
      ? publishedPosts[currentIndex + 1]
      : null;
  const description = post.seo?.description ?? post.summary;
  const cover = post.seo?.ogImage ?? coverSrc;
  const canonicalPath = `/blog/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: description,
    datePublished: post.date,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    url: toAbsoluteUrl(canonicalPath),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(canonicalPath)
    },
    inLanguage: getJsonLdLanguage(defaultLocale),
    image: getStructuredDataImageUrl(cover)
  };

  return (
    <>
      <BlogDetailClient
        post={post}
        coverSrc={coverSrc}
        coverAlt={coverAlt}
        showUpdated={showUpdated}
        tocHeadings={tocHeadings}
        currentSeries={currentSeries}
        previousSeriesPost={previousSeriesPost}
        nextSeriesPost={nextSeriesPost}
        previousPost={previousPost}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
        mdxError={mdxError}
      >
        {mdxContent}
      </BlogDetailClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
