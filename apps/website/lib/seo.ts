import { locales, type Locale } from "./i18n";
import { getLocalePath, stripLocalePrefix } from "./locale-routing";
import { toAbsoluteUrl } from "./site-url";

export function getCanonicalPath(pathname: string, locale: Locale) {
  return getLocalePath(stripLocalePrefix(pathname), locale);
}

export function getLanguageAlternates(
  pathname: string,
  availableLocales: readonly Locale[] = locales
) {
  const basePath = stripLocalePrefix(pathname);
  const available = new Set(availableLocales);
  const languages: Record<string, string> = {};

  if (available.has("zh")) {
    languages[hreflang.zh] = toAbsoluteUrl(getLocalePath(basePath, "zh"));
  }

  if (available.has("en")) {
    languages[hreflang.en] = toAbsoluteUrl(getLocalePath(basePath, "en"));
  }

  const fallbackLocale: Locale = available.has("zh") ? "zh" : "en";
  languages["x-default"] = toAbsoluteUrl(getLocalePath(basePath, fallbackLocale));

  return {
    canonical: toAbsoluteUrl(basePath),
    languages,
    types: {
      "application/rss+xml": toAbsoluteUrl("/rss.xml")
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
