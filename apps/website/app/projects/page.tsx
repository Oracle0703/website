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

  return <ProjectsClient projects={projects} featuredProjects={featuredProjects} />;
}
