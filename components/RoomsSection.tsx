"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import SearchBar from "./SearchBar";
import BookingModal from "./BookingModal";

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

interface RoomsSectionProps {
  filterCriteria?: { roomType: string; guests: string };
  onSearch?: (criteria: any) => void;
  onReset?: () => void;
}

export default function RoomsSection({ filterCriteria, onSearch, onReset }: RoomsSectionProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRooms((data || []) as Room[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    if (!filterCriteria) return rooms;
    return rooms.filter((room) => {
      const matchesType = filterCriteria.roomType === "All Types" || room.type.trim() === filterCriteria.roomType;
      const matchesGuests = room.guests >= parseInt(filterCriteria.guests);
      return matchesType && matchesGuests;
    });
  }, [rooms, filterCriteria]);

  const openBooking = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  return (
    <section id="rooms" className="section bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="section-tag">Curated Inventory</p>
          <h2 className="section-title">Boutique <span className="text-[var(--accent)]">Accommodations</span></h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            From private beach-side villas to eco-friendly garden stays, discover our handpicked selection for your 2026 Selangor staycation.
          </p>
        </div>

        <div className="mb-12">
          <SearchBar onSearch={onSearch} />
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white h-96 rounded-[2rem]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">Error loading rooms: {error}</div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white organic-card shadow-sm hover:shadow-xl transition-all group cursor-pointer" onClick={() => openBooking(room)}>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {room.badge && (
                    <span className="absolute top-4 left-4 bg-[var(--accent)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {room.badge}
                    </span>
                  )}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-sm font-bold text-[var(--primary)]">RM {room.price}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">/ night</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-2">{room.type}</div>
                  <h3 className="font-serif text-2xl mb-2 text-[var(--primary)]">{room.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6 line-clamp-2">
                    {room.description || "A boutique experience designed for comfort and nature-distilled luxury in Banting."}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                    <div className="flex gap-4 text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 text-xs">
                        <strong>{room.guests}</strong> Guests
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <strong>{room.beds}</strong> Beds
                      </span>
                    </div>
                    <button
                      className="text-[var(--accent)] font-bold text-sm hover:text-[var(--accent-dark)] transition-colors flex items-center gap-1"
                    >
                      Book Now
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] mb-4">No rooms match your criteria.</p>
            <button onClick={onReset} className="text-[var(--accent)] font-bold underline">Reset Filters</button>
          </div>
        )}
      </div>

      {/* Mobile-First Sticky Book Now Button */}
      <div className="md:hidden mobile-book-now">
        <a href="#rooms" className="w-full btn-primary justify-center rounded-full py-5 text-lg shadow-2xl">
          Book Your 2026 Stay
        </a>
      </div>

      {selectedRoom && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          room={selectedRoom}
        />
      )}
    </section>
  );
}
