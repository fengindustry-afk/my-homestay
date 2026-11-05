import type { Metadata } from "next";
import type { Room } from "@/components/RoomsSection";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Indah Morib Homestay: Your Home Away From Home",
  alternates: { canonical: "/" },
};

// The room grid is rendered on the server so crawlers see the room links.
// Cached for 5 minutes; the browser still refreshes the list on load.
export const revalidate = 300;

async function getRooms(): Promise<Room[] | undefined> {
  try {
    // Imported lazily: supabaseAdmin throws at import when env is missing,
    // which would 500 the homepage instead of falling back to the browser fetch.
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    return error ? undefined : ((data ?? []) as Room[]);
  } catch {
    return undefined;
  }
}

export default async function Home() {
  return <HomePageClient initialRooms={await getRooms()} />;
}
