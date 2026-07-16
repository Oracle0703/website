"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  defaultLocale,
  getHtmlLang,
  LOCALE_COOKIE,
  type Locale
} from "../lib/i18n-core";
import {
  getAlternateLocalePath,
  getLocalePath,
  getRouteLocale
} from "../lib/locale-routing";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const persistLocale = (locale: Locale) => {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  document.documentElement.lang = getHtmlLang(locale);

  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // Ignore storage failures in private or restricted browsing contexts.
  }
};

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
    persistLocale(nextLocale);
    setLocale(nextLocale);
    router.push(getLocalePath(routePathname, nextLocale));
  }, [routePathname, router]);

  const toggleLocale = useCallback(() => {
    const nextLocale = routeLocale === "zh" ? "en" : "zh";
    persistLocale(nextLocale);
    setLocale(nextLocale);
    router.push(getAlternateLocalePath(routePathname));
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
