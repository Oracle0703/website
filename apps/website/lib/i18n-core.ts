export type Locale = "zh" | "en";

export const locales = ["zh", "en"] as const;
export const defaultLocale: Locale = "zh";
export const LOCALE_COOKIE = "locale";

export const isLocale = (value?: string): value is Locale =>
  value === "zh" || value === "en";

export const getLocaleFromCookieValue = (value?: string): Locale =>
  isLocale(value) ? value : defaultLocale;

export const getHtmlLang = (locale: Locale) => (locale === "en" ? "en" : "zh-CN");
