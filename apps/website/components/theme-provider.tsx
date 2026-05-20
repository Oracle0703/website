"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { defaultTheme, getThemeFromCookieValue, THEME_COOKIE, type Theme } from "../lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return defaultTheme;

  try {
    const storedValue = window.localStorage.getItem(THEME_COOKIE) ?? getCookieValue(THEME_COOKIE);
    return getThemeFromCookieValue(storedValue);
  } catch {
    return getThemeFromCookieValue(getCookieValue(THEME_COOKIE));
  }
};

const persistTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  document.documentElement.dataset.theme = theme;

  try {
    window.localStorage.setItem(THEME_COOKIE, theme);
  } catch {
    // Ignore storage failures in private or restricted browsing contexts.
  }
};

export const ThemeProvider = ({
  initialTheme,
  children
}: {
  initialTheme: Theme;
  children: ReactNode;
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? defaultTheme);
  const didMountPersistRef = useRef(false);

  useEffect(() => {
    const restoredTheme = getStoredTheme();
    setTheme(restoredTheme);
    persistTheme(restoredTheme);
  }, []);

  useEffect(() => {
    if (!didMountPersistRef.current) {
      didMountPersistRef.current = true;
      return;
    }

    persistTheme(theme);
  }, [theme]);

  const updateTheme = useCallback((nextTheme: Theme) => {
    persistTheme(nextTheme);
    setTheme(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: updateTheme,
      toggleTheme: () => updateTheme(theme === "dark" ? "light" : "dark")
    }),
    [theme, updateTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
};
