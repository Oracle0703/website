import type { Metadata } from "next";
import { ProjectsClient } from "./projects-client";
import { defaultLocale, getMessages } from "../../lib/i18n";
import { getFeaturedProjectViews, getProjectViews } from "../../lib/projects";
import { getLanguageAlternates } from "../../lib/seo";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const { seo } = getMessages(defaultLocale);

  return {
    title: seo.projectsTitle,
    description: seo.projectsDescription,
    alternates: getLanguageAlternates("/projects"),
    openGraph: {
      title: seo.projectsTitle,
      description: seo.projectsDescription,
      url: toAbsoluteUrl("/projects"),
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
  const projects = getProjectViews(defaultLocale);
  const featuredProjects = getFeaturedProjectViews(defaultLocale);
  const featuredSlugs = new Set(featuredProjects.map((project) => project.slug));
  const archiveProjects = projects.filter((project) => !featuredSlugs.has(project.slug));

  return (
    <ProjectsClient
      archiveProjects={archiveProjects}
      featuredProjects={featuredProjects}
    />
  );
}
