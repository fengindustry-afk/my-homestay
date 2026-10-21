import type { MetadataRoute } from "next";

const baseUrl = "https://indahmoribhomestay.vercel.app";

// No lastModified: rooms have no updated_at column, and a new Date() on every
// request is noise that search engines ignore.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    // Imported lazily: supabaseAdmin throws at import when env is missing,
    // which would 500 the whole sitemap instead of falling back to static routes.
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data } = await supabaseAdmin.from("rooms").select("id");
    roomRoutes = (data ?? []).map((room) => ({
      url: `${baseUrl}/homestay/${room.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If the DB is unreachable at build time, fall back to static routes only.
  }

  return [...staticRoutes, ...roomRoutes];
}
