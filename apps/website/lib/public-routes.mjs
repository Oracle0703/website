export const PUBLIC_WEBSITE_ROUTES = [
  "/",
  "/blog",
  "/projects",
  "/explore",
  "/labs",
  "/labs/query",
  "/labs/tools",
  "/tracker",
  "/resume",
  "/now",
  "/about",
  "/contact",
  "/enter",
  "/ai-page-analysis"
];

export const PUBLIC_WEBSITE_EN_ROUTES = PUBLIC_WEBSITE_ROUTES.map((path) =>
  path === "/" ? "/en" : `/en${path}`
);

export const PUBLIC_WEBSITE_LOCALE_ROUTES = [
  ...PUBLIC_WEBSITE_ROUTES.map((path) => ({
    locale: "zh",
    path,
    canonicalPath: path
  })),
  ...PUBLIC_WEBSITE_EN_ROUTES.map((path) => ({
    locale: "en",
    path,
    canonicalPath: path
  }))
];
