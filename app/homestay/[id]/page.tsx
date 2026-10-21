import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Room } from "@/components/RoomsSection";
import RoomDetail from "./RoomDetail";

type Props = { params: Promise<{ id: string }> };

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
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${room.title} — Indah Morib Homestay`;
  const description =
    room.description ?? `${room.title} at Indah Morib Homestay${room.location ? `, ${room.location}` : ""}.`;
  const path = `/homestay/${id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export default async function HomestayPage({ params }: Props) {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  const photos = await getPhotos(id);
  return <RoomDetail room={room} photos={photos} />;
}
