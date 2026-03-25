import type { MetadataRoute } from "next";
import { appBaseUrl } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${appBaseUrl}/sitemap.xml`
  };
}
