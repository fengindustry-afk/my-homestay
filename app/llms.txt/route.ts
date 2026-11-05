import { BUSINESS, SITE_URL } from "@/lib/site";
import { llmsBody, type RoomSeoInput } from "@/lib/seo";

export const revalidate = 3600;

async function loadRooms(): Promise<RoomSeoInput[]> {
    try {
        // Imported lazily, same as app/sitemap.ts: a missing env must not fail the whole route.
        const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
        const { data } = await supabaseAdmin
            .from("rooms")
            .select("id, title, type, price, beds, baths, guests, amenities, image")
            .order("id");
        return (data ?? []) as RoomSeoInput[];
    } catch {
        return [];
    }
}

export async function GET(): Promise<Response> {
    const rooms = await loadRooms();
    return new Response(llmsBody(BUSINESS, SITE_URL, rooms), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
