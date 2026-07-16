import type { Metadata } from "next";
import { ProjectsClient } from "../../projects/projects-client";
import { getMessages, type Locale } from "../../../lib/i18n";
import { getFeaturedProjectViews, getProjectViews } from "../../../lib/projects";
import { getLanguageAlternates } from "../../../lib/seo";
import { toAbsoluteUrl } from "../../../lib/site-url";

const locale: Locale = "en";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(locale);

  return {
    title: seo.projectsTitle,
    description: seo.projectsDescription,
    alternates: {
      ...getLanguageAlternates("/en/projects"),
      canonical: toAbsoluteUrl("/en/projects")
    },
    openGraph: {
      title: seo.projectsTitle,
      description: seo.projectsDescription,
      url: toAbsoluteUrl("/en/projects"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title: seo.projectsTitle,
      description: seo.projectsDescription,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function Page() {
  const projects = getProjectViews("en");
  const featuredProjects = getFeaturedProjectViews("en");
  const featuredSlugs = new Set(featuredProjects.map((project) => project.slug));
  const archiveProjects = projects.filter((project) => !featuredSlugs.has(project.slug));

  return (
    <ProjectsClient
      archiveProjects={archiveProjects}
      featuredProjects={featuredProjects}
    />
  );
}
