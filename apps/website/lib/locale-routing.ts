import { defaultLocale, isLocale, type Locale } from "./i18n-core";

const EN_PREFIX = "/en";

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

export function stripLocalePrefix(pathname: string) {
  const normalized = normalizePath(pathname);
  if (normalized === EN_PREFIX) return "/";
  if (normalized.startsWith(`${EN_PREFIX}/`)) {
    return normalized.slice(EN_PREFIX.length);
  }

  return normalized;
}

export function getRouteLocale(pathname: string): Locale {
  const normalized = normalizePath(pathname);
  return normalized === EN_PREFIX || normalized.startsWith(`${EN_PREFIX}/`)
    ? "en"
    : defaultLocale;
}

export function getLocalePath(pathname: string, locale: Locale) {
  const basePath = stripLocalePrefix(pathname);
  if (!isLocale(locale)) return basePath;
  if (locale === defaultLocale) return basePath;

  return basePath === "/" ? EN_PREFIX : `${EN_PREFIX}${basePath}`;
}

export function getAlternateLocalePath(pathname: string) {
  const locale = getRouteLocale(pathname);
  return getLocalePath(pathname, locale === "en" ? defaultLocale : "en");
}

export function getLocaleSwitchFallbackPath(
  pathname: string,
  targetLocale: Locale,
  directPath = getLocalePath(pathname, targetLocale)
) {
  const segments = stripLocalePrefix(pathname).split("/").filter(Boolean);
  const isBlogDetail = segments.length === 2 && segments[0] === "blog";

  return isBlogDetail ? getLocalePath("/blog", targetLocale) : directPath;
}

export function isNavigationPathActive(pathname: string, href: string) {
  const currentPath = stripLocalePrefix(pathname);
  const targetPath = stripLocalePrefix(href);

  if (targetPath === "/") return currentPath === "/";

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
