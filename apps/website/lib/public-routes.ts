import {
  PUBLIC_WEBSITE_EN_ROUTES as publicWebsiteEnRoutes,
  PUBLIC_WEBSITE_LOCALE_ROUTES as publicWebsiteLocaleRoutes,
  PUBLIC_WEBSITE_ROUTES as publicWebsiteRoutes
} from "./public-routes.mjs";
import type { Locale } from "./i18n";

export const PUBLIC_WEBSITE_ROUTES = publicWebsiteRoutes as readonly string[];
export const PUBLIC_WEBSITE_EN_ROUTES = publicWebsiteEnRoutes as readonly string[];

export type PublicWebsiteRoute = (typeof PUBLIC_WEBSITE_ROUTES)[number];

export type PublicWebsiteLocaleRoute = {
  locale: Locale;
  path: string;
  canonicalPath: string;
};

export const PUBLIC_WEBSITE_LOCALE_ROUTES =
  publicWebsiteLocaleRoutes as readonly PublicWebsiteLocaleRoute[];
