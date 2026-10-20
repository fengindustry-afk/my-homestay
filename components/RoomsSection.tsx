"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import BookingModal from "./BookingModal";
import { supabase } from "@/lib/supabaseClient";

export interface Room {
    id: number;
    title: string;
    type: string;
    location: string;
    price: number;
    basic_price?: number;
    full_price?: number;
    badge: string | null;
    rooms?: number;
    beds: number;
    baths: number;
    guests: number;
    image: string;
    description?: string;
    amenities?: string;
}

export interface SearchCriteria {
    roomType: string;
    guests: string;
    checkIn?: string;
    checkOut?: string;
}

interface RoomsSectionProps {
    filterCriteria?: SearchCriteria;
    onSearch?: (criteria: SearchCriteria) => void;
    onReset?: () => void;
}

/** Placeholder cards so the grid has structure while Supabase responds. */
function RoomSkeleton() {
    return (
        <div className="room-card" aria-hidden="true">
            <div className="room-card-media" style={{ background: "var(--surface-dark)" }} />
            <div className="room-card-content">
                <div style={{ height: 10, width: "35%", background: "var(--surface-dark)", borderRadius: 4, marginBottom: 14 }} />
                <div style={{ height: 20, width: "72%", background: "var(--surface-dark)", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 12, width: "50%", background: "var(--surface-dark)", borderRadius: 4 }} />
            </div>
        </div>
    );
}

export default function RoomsSection({ filterCriteria, onSearch, onReset }: RoomsSectionProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Remounting the search bar on reset restores its default dates and selects.
    const [searchKey, setSearchKey] = useState(0);
    const [bookedRoomIds, setBookedRoomIds] = useState<Set<number>>(new Set());

    const checkInDate = filterCriteria?.checkIn;
    const checkOutDate = filterCriteria?.checkOut;

    // Whole-room paid bookings that overlap the requested stay. Unit-level
    // bookings are not counted here; the booking modal checks each unit.
    useEffect(() => {
        if (!checkInDate || !checkOutDate) return;
        let active = true;
        supabase
            .from("bookings")
            .select("room_id, unit_name")
            .eq("payment_status", "paid")
            .lt("check_in", checkOutDate)
            .gt("check_out", checkInDate)
            .then(({ data, error }) => {
                if (!active) return;
                if (error) {
                    console.error("Availability check failed:", error.message);
                    setBookedRoomIds(new Set());
                    return;
                }
                setBookedRoomIds(
                    new Set((data ?? []).filter((b) => !b.unit_name).map((b) => b.room_id as number))
                );
            });
        return () => {
            active = false;
        };
    }, [checkInDate, checkOutDate]);

    useEffect(() => {
        let isMounted = true;

        async function loadRooms() {
            setLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("rooms")
                .select("*")
                .order("created_at", { ascending: false });

            if (!isMounted) return;

            if (error) {
                console.error("Homestay load failed:", error.message);
                setLoadError(error.message);
                setRooms([]);
            } else {
                setRooms((data || []) as Room[]);
            }
            setLoading(false);
        }

        void loadRooms();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredRooms = useMemo(() => {
        if (!filterCriteria) return rooms;

        return rooms.filter(room => {
            const matchesType = filterCriteria.roomType === "All Types" || room.type.trim() === filterCriteria.roomType;

            const guestCount = parseInt(filterCriteria.guests);
            const matchesGuests = room.guests >= guestCount;
            const matchesDates = !(checkInDate && checkOutDate) || !bookedRoomIds.has(room.id);

            return matchesType && matchesGuests && matchesDates;
        });
    }, [filterCriteria, rooms, bookedRoomIds, checkInDate, checkOutDate]);

    const handleReset = () => {
        onReset?.();
        setSearchKey((k) => k + 1);
    };

    const handleBook = (room: Room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    return (
        <>
            <section id="rooms" className="section">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Header: index left, copy right — asymmetric rather than centred. */}
                    <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7" data-reveal>
                            <p className="section-tag">02 &nbsp;/&nbsp; Our Homestays</p>
                            <h2 className="section-title" style={{ maxWidth: 620 }}>
                                {filterCriteria ? (
                                    "Search results"
                                ) : (
                                    <>
                                        Handpicked homestays for{" "}
                                        <em style={{ color: "var(--accent)" }}>every gathering</em>
                                    </>
                                )}
                            </h2>
                        </div>

                        <div className="lg:col-span-5" data-reveal data-reveal-delay="120">
                            <p className="section-description">
                                {loading
                                    ? "Bringing up the current collection…"
                                    : filteredRooms.length > 0
                                        ? "Every unit sleeps a different size of group. Pick the one that fits yours."
                                        : filterCriteria
                                            ? "Nothing matches those filters. Try widening the guest count or type."
                                            : "The collection is being updated. Please check back shortly."}
                            </p>

                            {filterCriteria && (
                                <button onClick={handleReset} className="btn-ghost mt-3" style={{ paddingLeft: 0 }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    Reset search
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search precedes the results it filters. */}
                    <div className="mb-14" data-reveal data-reveal-delay="180">
                        <SearchBar key={searchKey} onSearch={onSearch} />
                    </div>

                    {loadError ? (
                        <p className="text-center text-sm" style={{ color: "#F87171" }} role="alert">
                            Homestays are taking longer than usual.{" "}
                            <a href="https://wa.me/601157572001" target="_blank" rel="noopener noreferrer" className="underline">WhatsApp us</a>{" "}
                            and we will send you the list.
                        </p>
                    ) : (
                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3" data-stagger>
                            {loading
                                ? Array.from({ length: 3 }, (_, i) => <RoomSkeleton key={i} />)
                                : filteredRooms.map((room) => (
                                    <article key={room.id} className="room-card" id={`room-card-${room.id}`}>
                                        <div className="room-card-media">
                                            <Image
                                                src={room.image}
                                                alt={room.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="room-card-image"
                                            />
                                            <div className="room-card-overlay" />
                                            {room.badge && <div className="room-card-badge">{room.badge}</div>}
                                            <div className="room-card-price-tag">
                                                RM{room.price} <span>/ night</span>
                                            </div>
                                        </div>

                                        <div className="room-card-content">
                                            <div className="room-card-type">{room.type}</div>

                                            <h3 className="room-card-title">
                                                {/* Stretched link: the whole card navigates to the detail
                                                    page, while the Book button below stays independently
                                                    clickable. No nested interactive elements. */}
                                                <Link href={`/homestay/${room.id}`} className="room-card-link">
                                                    {room.title}
                                                </Link>
                                            </h3>

                                            <div className="room-card-location">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {room.location}
                                            </div>

                                            <div className="room-card-divider" />

                                            <div className="room-card-footer">
                                                <div className="room-card-features">
                                                    {room.rooms != null && (
                                                        <span>{room.rooms} {room.rooms === 1 ? "Room" : "Rooms"}</span>
                                                    )}
                                                    <span>{room.beds} {room.beds === 1 ? "Bed" : "Beds"}</span>
                                                    <span>{room.baths} {room.baths === 1 ? "Bath" : "Baths"}</span>
                                                    <span>Sleeps {room.guests}</span>
                                                </div>

                                                <button
                                                    className="room-card-book"
                                                    onClick={() => handleBook(room)}
                                                    aria-label={`Book ${room.title}, RM${room.price} per night`}
                                                >
                                                    Book
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                        </div>
                    )}

                </div>
            </section>

            {selectedRoom && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    room={selectedRoom}
                />
            )}
        </>
    );
}
