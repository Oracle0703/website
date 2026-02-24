const DEFAULT_SITE_URL = "https://www.meaningful.ink";

function stripTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteBaseUrl() {
  // Prefer an explicit env so local/dev/prod can use the same code path.
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL;
  return stripTrailingSlash(raw);
}

export function toAbsoluteUrl(pathname: string) {
  const base = getSiteBaseUrl();
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalized, base).toString();
}
