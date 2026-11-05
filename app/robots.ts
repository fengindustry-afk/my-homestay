import type { MetadataRoute } from "next";
import { SITE_URL as baseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/finest-touch/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "OAI-SearchBot",
        ],
        allow: "/",
        disallow: ["/api/", "/finest-touch/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
