import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RoomDetail from "./RoomDetail";

const baseUrl = "https://indahmoribhomestay.vercel.app";

type Props = { params: Promise<{ id: string }> };

async function getRoom(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    );
    const { data } = await supabase
        .from("rooms")
        .select("title, type, location, description, image")
        .eq("id", id)
        .single();
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const room = await getRoom(id);
    // Unknown room: fall back to the site-wide metadata in the root layout.
    if (!room) return {};

    const description =
        room.description?.slice(0, 155) ||
        `${room.title}, a ${room.type} in ${room.location}, at Indah Morib Homestay.`;
    const path = `/homestay/${id}`;

    return {
        title: `${room.title} | Indah Morib Homestay`,
        description,
        alternates: { canonical: path },
        openGraph: {
            title: room.title,
            description,
            url: `${baseUrl}${path}`,
            images: room.image ? [room.image] : undefined,
        },
    };
}

export default async function Page({ params }: Props) {
    const { id } = await params;
    return <RoomDetail id={id} />;
}
