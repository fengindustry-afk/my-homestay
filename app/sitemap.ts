import type { MetadataRoute } from "next";
import { SITE_URL as baseUrl } from "@/lib/site";
import { localeAlternates } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

// One entry per language, each listing both versions, as Google asks for hreflang sitemaps.
function both(path: string, priority: number): MetadataRoute.Sitemap {
  const { languages } = localeAlternates(path, "ms");
  const abs = (p: string) => (p === "/" ? baseUrl : `${baseUrl}${p}`);
  const alternates = { languages: { ms: abs(languages.ms), en: abs(languages.en), "x-default": abs(languages["x-default"]) } };
  const entry = (url: string): Entry => ({ url, changeFrequency: "weekly", priority, alternates });
  return [entry(abs(languages.ms)), entry(abs(languages.en))];
}

// No lastModified: rooms have no updated_at column, and a new Date() on every
// request is noise that search engines ignore.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [...both("/", 1), ...both("/family-day", 0.9), ...both("/dewan-majlis-banting", 0.9)];

  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    // Imported lazily: supabaseAdmin throws at import when env is missing,
    // which would 500 the whole sitemap instead of falling back to static routes.
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data } = await supabaseAdmin.from("rooms").select("id");
    roomRoutes = (data ?? []).flatMap((room) => both(`/homestay/${room.id}`, 0.8));
  } catch {
    // If the DB is unreachable at build time, fall back to static routes only.
  }

  return [...staticRoutes, ...roomRoutes];
}
