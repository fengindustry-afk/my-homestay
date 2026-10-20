"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, User, Bath, BedDouble, CheckCircle, ChefHat, Wifi, MonitorPlay, Car, Home } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import ShaderBackground from "@/components/ShaderBackground";
import type { Room } from "@/components/RoomsSection";

/** Maps a free-text amenity to the closest icon in the set. */
function amenityIcon(amenity: string) {
    const a = amenity.toLowerCase();
    if (a.includes("kitchen")) return <ChefHat size={22} />;
    if (a.includes("wifi")) return <Wifi size={22} />;
    if (a.includes("tv")) return <MonitorPlay size={22} />;
    if (a.includes("parking")) return <Car size={22} />;
    if (a.includes("pool") || a.includes("bath")) return <Bath size={22} />;
    return <CheckCircle size={22} />;
}

export default function RoomDetail({ id }: { id: string }) {
    const [room, setRoom] = useState<Room | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchRoom() {
            setLoading(true);
            const { data, error } = await supabase
                .from("rooms")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            setRoom(data);

            const { data: photosData } = await supabase
                .from("room_photos")
                .select("url")
                .eq("room_id", id)
                .order("created_at", { ascending: false });

            if (photosData) setPhotos(photosData.map((p) => p.url));
            setLoading(false);
        }

        fetchRoom();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
                <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                    role="status"
                    aria-label="Loading homestay"
                />
            </div>
        );
    }

    if (!room) {
        return (
            <div
                className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
                style={{ background: "var(--background)", color: "var(--foreground)" }}
            >
                <h1 className="text-display" style={{ fontSize: "2.25rem" }}>
                    Homestay not found
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    This listing may have been removed or the link is out of date.
                </p>
                <Link href="/" className="btn-primary">
                    Return home
                </Link>
            </div>
        );
    }

    const mainImage = room.image || photos[0] || "/placeholder.jpg";
    const amenitiesList: string[] = room.amenities
        ? room.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [];

    const facts = [
        room.rooms != null && {
            icon: <Home size={24} />,
            title: `${room.rooms} ${room.rooms === 1 ? "Room" : "Rooms"}`,
        },
        room.beds != null && {
            icon: <BedDouble size={24} />,
            title: `${room.beds} ${room.beds === 1 ? "Bed" : "Beds"}`,
        },
        room.baths != null && {
            icon: <Bath size={24} />,
            title: `${room.baths} ${room.baths === 1 ? "Bath" : "Baths"}`,
        },
        room.guests != null && {
            icon: <User size={24} />,
            title: `Up to ${room.guests} guests`,
        },
    ].filter(Boolean) as { icon: React.ReactNode; title: string }[];

    return (
        <div
            className="min-h-screen overflow-x-hidden pb-24"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
            {/* Hero */}
            <header className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-20 pt-28 lg:px-16">
                <ShaderBackground intensity={0.85} className="absolute inset-0 z-0" />

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-14 lg:flex-row">
                    <div className="hero-copy flex w-full flex-col items-start lg:w-1/2">
                        <Link href="/#rooms" className="back-link">
                            <span className="back-link-icon">
                                <ArrowLeft size={15} />
                            </span>
                            All homestays
                        </Link>

                        <p className="hero-subtitle line-mask mt-10">
                            <span style={{ animationDelay: "0.1s" }}>
                                {room.type || "Exclusive Homestay"}
                            </span>
                        </p>

                        <h1
                            className="text-display mb-7"
                            style={{ fontSize: "clamp(2.4rem, 5vw, 4.25rem)", color: "var(--primary)" }}
                        >
                            <span className="line-mask">
                                <span style={{ animationDelay: "0.2s" }}>{room.title}</span>
                            </span>
                        </h1>

                        {room.location && (
                            <p
                                className="animate-fade-up delay-300 mb-6 flex items-center gap-2"
                                style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {room.location}
                            </p>
                        )}

                        {room.description && (
                            <p
                                className="animate-fade-up delay-400 mb-10 max-w-xl"
                                style={{ color: "var(--text-muted)", fontSize: "1.02rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                            >
                                {room.description}
                            </p>
                        )}

                        <div className="animate-fade-up delay-500 flex flex-wrap items-center gap-4">
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                                Book this homestay
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>

                            <div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-playfair), Georgia, serif",
                                        fontSize: "1.9rem",
                                        color: "var(--primary)",
                                        lineHeight: 1,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    RM{room.price}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                    per night
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-1/2">
                        <div
                            className="relative aspect-[4/3] w-full overflow-hidden animate-scale-in delay-200"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-strong)",
                                boxShadow: "var(--shadow-xl)",
                            }}
                        >
                            <Image
                                src={mainImage}
                                alt={room.title}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Facts */}
            {facts.length > 0 && (
                <section
                    className="py-16"
                    style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
                >
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4 lg:px-16" data-stagger>
                        {facts.map((item) => (
                            <div key={item.title} className="flex flex-col items-center text-center">
                                <div className="stat-icon">{item.icon}</div>
                                <h2 style={{ fontWeight: 600, color: "var(--primary)", letterSpacing: "0.01em" }}>
                                    {item.title}
                                </h2>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Photos */}
            {photos.length > 0 && (
                <section className="mx-auto max-w-7xl px-6 py-24 lg:px-16">
                    <div className="mb-12 flex items-center gap-8" data-reveal>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            The <em style={{ color: "var(--accent)" }}>space</em>
                        </h2>
                        <span className="rule flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" data-stagger>
                        {photos.map((p, i) => (
                            <div
                                key={p}
                                className={`detail-photo ${i === 0 || i === 3 ? "lg:col-span-2" : ""}`}
                            >
                                <Image
                                    src={p}
                                    alt={`${room.title}, view ${i + 1}`}
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 33vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
                <section className="py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
                    <div className="mx-auto max-w-7xl px-6 lg:px-16">
                        <div className="mb-14" data-reveal>
                            <p className="section-tag">Included</p>
                            <h2 className="section-title">What you get</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                            {amenitiesList.map((amenity) => (
                                <div key={amenity} className="amenity-card">
                                    <div className="amenity-icon">{amenityIcon(amenity)}</div>
                                    <h3 className="amenity-title">{amenity}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Closing action */}
            <section className="mx-auto max-w-3xl px-6 pt-24 text-center" data-reveal>
                <h2 className="text-display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", color: "var(--primary)", marginBottom: 26 }}>
                    Ready to book <em style={{ color: "var(--accent)" }}>{room.title}</em>?
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Check availability
                    </button>
                    <a
                        href="https://wa.me/601157572001"
                        className="btn-outline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ask a question
                    </a>
                </div>
            </section>

            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} room={room} />
        </div>
    );
}
