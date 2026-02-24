"use client";
import React, { useEffect, useMemo, useState } from "react";
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
    beds: number;
    baths: number;
    guests: number;
    image: string;
    description?: string;
    amenities?: string;
}

interface RoomsSectionProps {
    filterCriteria?: {
        roomType: string;
        guests: string;
    };
}

export default function RoomsSection({ filterCriteria }: RoomsSectionProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadRooms() {
            setLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("rooms")
                .select("id,title,type,location,price,basic_price,full_price,badge,beds,baths,guests,image,description,amenities")
                .order("created_at", { ascending: false });

            if (!isMounted) return;

            if (error) {
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
            const matchesType = filterCriteria.roomType === "All Types" || room.type === filterCriteria.roomType;

            const guestCount = parseInt(filterCriteria.guests);
            const matchesGuests = room.guests >= guestCount;

            return matchesType && matchesGuests;
        });
    }, [filterCriteria, rooms]);
    const handleBook = (room: Room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    return (
        <>
            <section id="rooms" className="section">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-14 text-center">
                        <p className="section-tag">Our Homestays</p>
                        <h2 className="section-title" style={{ maxWidth: 600, margin: "0 auto 16px" }}>
                            {filterCriteria ? "Search Results" : "Handpicked Homestays for "}
                            {!filterCriteria && <span style={{ color: "var(--accent)" }}>Every Taste</span>}
                        </h2>
                        <p className="section-description" style={{ maxWidth: 520, margin: "0 auto" }}>
                            {loading ? (
                                "Searching our collection for the perfect homestays..."
                            ) : filteredRooms.length > 0 ? (
                                "Discover the perfect space for your stay. Every homestay is designed with comfort and style in mind."
                            ) : filterCriteria ? (
                                "No homestays match your search criteria. Please try different filters."
                            ) : (
                                "Our collection of featured homestays is being prepared. Please check back shortly!"
                            )}
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <p className="text-center text-sm text-[var(--text-muted)] md:col-span-2 lg:col-span-3">
                                Loading homestays…
                            </p>
                        ) : loadError ? (
                            <p className="text-center text-sm text-red-500 md:col-span-2 lg:col-span-3">
                                Could not load homestays: {loadError}
                            </p>
                        ) : (
                            filteredRooms.map((room) => (
                                <div key={room.id} className="room-card animate-scale-in" id={`room-card-${room.id}`} onClick={() => handleBook(room)}>
                                    <div style={{ position: "relative", overflow: "hidden" }}>
                                        <img src={room.image} alt={room.title} className="room-card-image" loading="lazy" />
                                        <div className="room-card-overlay" />
                                        {room.badge && <div className="room-card-badge">{room.badge}</div>}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100" style={{ background: "rgba(0,0,0,0.3)" }}>
                                            <button className="rounded-full bg-white px-6 py-2 text-sm font-bold uppercase text-[var(--primary)] shadow-lg transition-transform hover:scale-105">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                    <div className="room-card-content">
                                        <div className="room-card-type">{room.type}</div>
                                        <h3 className="room-card-title">{room.title}</h3>
                                        <div className="room-card-location">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {room.location}
                                        </div>
                                        <div className="room-card-divider" />
                                        <div className="room-card-footer">
                                            <div className="room-card-price">RM{room.price} <span>/ night</span></div>
                                            <div className="room-card-features">
                                                <span>{room.beds} Beds</span>
                                                <span>{room.baths} Baths</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {filterCriteria && filteredRooms.length === 0 && (
                        <div className="mt-12 text-center">
                            <button onClick={() => window.location.reload()} className="btn-dark">
                                Reset Filters
                            </button>
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
