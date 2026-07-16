import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, type Locale } from "../../../../lib/i18n";
import { getAllProjects, getProjectBySlug, getProjectView } from "../../../../lib/projects";
import { getJsonLdLanguage, getLanguageAlternates } from "../../../../lib/seo";
import { toAbsoluteUrl } from "../../../../lib/site-url";
import { ProjectDetailClient } from "../../../projects/[slug]/project-detail-client";

type PageProps = {
  params: { slug: string };
};

const locale: Locale = "en";

export const generateStaticParams = () => {
  return getAllProjects().map((project) => ({ slug: project.slug }));
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  const { seo } = getMessages(locale);
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: seo.projectsTitle,
      description: seo.projectsDescription
    };
  }

  const projectView = getProjectView(project, locale);
  const canonicalPath = `/en/projects/${encodeURIComponent(project.slug)}`;

  return {
    title: projectView.title,
    description: projectView.summary,
    alternates: {
      ...getLanguageAlternates(canonicalPath),
      canonical: toAbsoluteUrl(canonicalPath)
    },
    openGraph: {
      title: projectView.title,
      description: projectView.summary,
      url: toAbsoluteUrl(canonicalPath),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: projectView.title,
      description: projectView.summary,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page({ params }: PageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const { pages } = getMessages(locale);
  const canonicalPath = `/en/projects/${encodeURIComponent(project.slug)}`;
  const projectView = getProjectView(project, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: projectView.title,
    description: projectView.summary,
    url: toAbsoluteUrl(canonicalPath),
    dateModified: project.updatedAt,
    inLanguage: getJsonLdLanguage(locale),
    applicationCategory: project.type,
    image: toAbsoluteUrl("/og.png")
  };

  return (
    <>
      <ProjectDetailClient
        project={projectView}
        locale={locale}
        copy={pages.projects}
        common={pages.common}
        relatedLabels={{ blog: pages.blog.title, contact: pages.contact.title }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
