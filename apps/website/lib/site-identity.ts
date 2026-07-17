import type { Locale } from "./i18n-core";

export const siteIdentity = {
  personName: "Yuri",
  brandName: "Meaningful · Ink",
  brandPlainName: "Meaningful Ink",
  githubHandle: "@Oracle0703",
  githubUrl: "https://github.com/Oracle0703",
  flagshipProjectPath: "/projects/ai-page-analysis",
  profilePath: "/about",
  contactPath: "/contact",
  byLocale: {
    zh: {
      role: "独立全栈开发者 · AI 产品工程",
      positioning: "为小团队和独立产品构建 AI 原型、内容系统与轻量工程工具。"
    },
    en: {
      role: "Independent full-stack developer · AI product engineering",
      positioning:
        "I build AI prototypes, content systems, and lightweight engineering tools for small teams and independent products."
    }
  }
} as const;

export function getSiteIdentity(locale: Locale) {
  return {
    ...siteIdentity,
    ...siteIdentity.byLocale[locale]
  };
}

export function getPersonStructuredData(locale: Locale, profileUrl: string) {
  const identity = getSiteIdentity(locale);

  return {
    "@type": "Person",
    name: identity.personName,
    alternateName: identity.githubHandle,
    jobTitle: identity.role,
    description: identity.positioning,
    url: profileUrl,
    sameAs: [identity.githubUrl]
  };
}

export function getAuthorStructuredData(
  author: string,
  locale: Locale,
  profileUrl: string
) {
  if (author !== siteIdentity.personName) {
    return { "@type": "Person", name: author };
  }

  return getPersonStructuredData(locale, profileUrl);
}
