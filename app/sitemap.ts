import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const baseUrl = "https://indahmoribhomestay.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabaseAdmin.from("rooms").select("id");
    roomRoutes = (data ?? []).map((room) => ({
      url: `${baseUrl}/homestay/${room.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If the DB is unreachable at build time, fall back to static routes only.
  }

  return [...staticRoutes, ...roomRoutes];
}
