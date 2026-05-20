import type { Locale } from "./i18n";
import { getLocalePath, stripLocalePrefix } from "./locale-routing";
import { toAbsoluteUrl } from "./site-url";

export function getCanonicalPath(pathname: string, locale: Locale) {
  return getLocalePath(stripLocalePrefix(pathname), locale);
}

export function getLanguageAlternates(pathname: string) {
  const basePath = stripLocalePrefix(pathname);

  return {
    canonical: toAbsoluteUrl(basePath),
    languages: {
      "zh-CN": toAbsoluteUrl(getLocalePath(basePath, "zh")),
      en: toAbsoluteUrl(getLocalePath(basePath, "en")),
      "x-default": toAbsoluteUrl(getLocalePath(basePath, "zh"))
    }
  };
}

export function getJsonLdLanguage(locale: Locale) {
  return locale === "en" ? "en" : "zh-CN";
}

export const hreflang = {
  zh: "zh-CN",
  en: "en"
} as const;
