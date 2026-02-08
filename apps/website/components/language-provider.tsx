"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  getHtmlLang,
  getMessages,
  LOCALE_COOKIE,
  type Locale,
  type Messages
} from "../lib/i18n";

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const persistLocale = (locale: Locale) => {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  document.documentElement.lang = getHtmlLang(locale);
};

export const LanguageProvider = ({
  initialLocale,
  children
}: {
  initialLocale: Locale;
  children: ReactNode;
}) => {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale ?? defaultLocale);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const updateLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale);
    setLocale(nextLocale);
    router.refresh();
  }, [router]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale: updateLocale,
      toggleLocale: () => updateLocale(locale === "zh" ? "en" : "zh")
    }),
    [locale, updateLocale]
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
