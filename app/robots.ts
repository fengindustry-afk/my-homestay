import type { MetadataRoute } from "next";

const baseUrl = "https://indahmoribhomestay.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/finest-touch/", "/reserved-bookings/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
