import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Room } from "@/components/RoomsSection";
import { setRequestLocale } from "next-intl/server";
import { localeAlternates, roomDescription, roomJsonLd, roomTitle, toJsonLd } from "@/lib/seo";
import { BUSINESS, SITE_URL } from "@/lib/site";
import RoomDetail from "./RoomDetail";

type Props = { params: Promise<{ id: string; locale: "ms" | "en" }> };

// Cached like the home page (5 min), so the <head> and the hero preload are sent
// at once instead of after two DB round trips. Admin edits show within 5 minutes.
export const revalidate = 300;

// Prebuild the current rooms; rooms added later render on first visit, then cache.
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { data } = await supabaseAdmin.from("rooms").select("id");
  return (data ?? []).map((r) => ({ id: String(r.id) }));
}

// Deduped per request: generateMetadata and the page share one query.
const getRoom = cache(async (id: string): Promise<Room | null> => {
  const { data } = await supabaseAdmin.from("rooms").select("*").eq("id", id).single();
  return (data as Room | null) ?? null;
});

const getPhotos = cache(async (id: string): Promise<string[]> => {
  const { data } = await supabaseAdmin
    .from("room_photos")
    .select("url")
    .eq("room_id", id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((p) => p.url as string);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const room = await getRoom(id);

  if (!room) {
    return { robots: { index: false, follow: false } };
  }

  // The layout's title.template appends the brand; the OG title doesn't get it.
  const title = roomTitle(room);
  const description = roomDescription(room);
  const path = `/homestay/${id}`;

  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      title: `${title} | ${BUSINESS.name}`,
      description,
      url: localeAlternates(path, locale).canonical,
      images: room.image ? [room.image] : undefined,
    },
  };
}

export default async function HomestayPage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const room = await getRoom(id);
  if (!room) notFound();

  const photos = await getPhotos(id);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(roomJsonLd(room, photos, SITE_URL)) }}
      />
      <RoomDetail room={room} photos={photos} />
    </>
  );
}
