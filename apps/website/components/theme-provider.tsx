"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultTheme, THEME_COOKIE, type Theme } from "../lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const persistTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  document.documentElement.dataset.theme = theme;
};

export const ThemeProvider = ({
  initialTheme,
  children
}: {
  initialTheme: Theme;
  children: ReactNode;
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme ?? defaultTheme);

  useEffect(() => {
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
