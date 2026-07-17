"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  defaultLocale,
  LOCALE_COOKIE,
  type Locale
} from "../lib/i18n-core";
import {
  getAlternateLocalePath,
  getLocalePath,
  getLocaleSwitchFallbackPath,
  getRouteLocale
} from "../lib/locale-routing";
import {
  announceBlockedOfflineNavigation,
  isOfflinePagePath
} from "../lib/pwa-navigation";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en"
};

const persistLocale = (locale: Locale) => {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;

  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // Ignore storage failures in private or restricted browsing contexts.
  }
};

function getDocumentLocaleAlternatePath(locale: Locale) {
  if (typeof document === "undefined") return null;

  const alternate = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${HREFLANG_BY_LOCALE[locale]}"]`
  );
  if (!alternate?.href) return null;

  try {
    const url = new URL(alternate.href, window.location.href);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function resolveLocaleTargetPath(
  pathname: string,
  targetLocale: Locale,
  directPath: string
) {
  return (
    getDocumentLocaleAlternatePath(targetLocale) ??
    getLocaleSwitchFallbackPath(pathname, targetLocale, directPath)
  );
}

export const LanguageProvider = ({
  initialLocale,
  children
}: {
  initialLocale: Locale;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const routePathname = pathname ?? "/";
  const routeLocale = getRouteLocale(routePathname);
  const [locale, setLocale] = useState<Locale>(routeLocale ?? initialLocale ?? defaultLocale);

  useEffect(() => {
    setLocale(routeLocale);
    persistLocale(routeLocale);
  }, [routeLocale]);

  const updateLocale = useCallback((nextLocale: Locale) => {
    const targetPath = resolveLocaleTargetPath(
      routePathname,
      nextLocale,
      getLocalePath(routePathname, nextLocale)
    );
    if (isOfflinePagePath(routePathname) && isOfflinePagePath(targetPath)) {
      persistLocale(nextLocale);
      window.location.assign(targetPath);
      return;
    }
    if (!navigator.onLine) {
      announceBlockedOfflineNavigation();
      return;
    }
    persistLocale(nextLocale);
    setLocale(nextLocale);
    router.push(targetPath);
  }, [routePathname, router]);

  const toggleLocale = useCallback(() => {
    const nextLocale = routeLocale === "zh" ? "en" : "zh";
    const targetPath = resolveLocaleTargetPath(
      routePathname,
      nextLocale,
      getAlternateLocalePath(routePathname)
    );
    if (isOfflinePagePath(routePathname) && isOfflinePagePath(targetPath)) {
      persistLocale(nextLocale);
      window.location.assign(targetPath);
      return;
    }
    if (!navigator.onLine) {
      announceBlockedOfflineNavigation();
      return;
    }
    persistLocale(nextLocale);
    setLocale(nextLocale);
    router.push(targetPath);
  }, [routeLocale, routePathname, router]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: updateLocale,
      toggleLocale
    }),
    [locale, toggleLocale, updateLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider.");
  }
  return context;
};
