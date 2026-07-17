import type { Locale } from "./i18n-core";

export const OFFLINE_NAVIGATION_BLOCKED_EVENT = "meaningful:offline-navigation-blocked";

export const OFFLINE_PAGE_PATHS = new Set([
  "/tracker",
  "/en/tracker",
  "/labs/tools",
  "/en/labs/tools"
]);

export function isOfflinePagePath(pathname: string) {
  return OFFLINE_PAGE_PATHS.has(pathname);
}

export function getOfflinePagePath(page: "tracker" | "tools", locale: Locale) {
  const pathname = page === "tracker" ? "/tracker" : "/labs/tools";
  return locale === "en" ? `/en${pathname}` : pathname;
}

export function announceBlockedOfflineNavigation() {
  window.dispatchEvent(new Event(OFFLINE_NAVIGATION_BLOCKED_EVENT));
}
