export type Theme = "dark" | "light";

export const themes = ["dark", "light"] as const;
export const defaultTheme: Theme = "dark";
export const THEME_COOKIE = "theme";

export const isTheme = (value?: string): value is Theme =>
  value === "dark" || value === "light";

export const getThemeFromCookieValue = (value?: string): Theme =>
  isTheme(value) ? value : defaultTheme;
