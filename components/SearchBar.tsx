"use client";
import { useState } from "react";

import type { SearchCriteria } from "./RoomsSection";

interface SearchBarProps {
    onSearch?: (criteria: SearchCriteria) => void;
}

/** Today in the visitor's own time zone, as yyyy-mm-dd. */
function localToday(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

/** The calendar day after a yyyy-mm-dd string. */
function dayAfter(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");
    return `${next.getFullYear()}-${mm}-${dd}`;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [checkIn, setCheckIn] = useState(localToday);
    const [checkOut, setCheckOut] = useState("");
    const [roomType, setRoomType] = useState("All Types");
    const [guests, setGuests] = useState("1 Guest");
    const [dateError, setDateError] = useState("");

    const handleSearch = () => {
        if (checkIn && checkOut && checkOut <= checkIn) {
            setDateError("Check-out must be after check-in.");
            return;
        }
        setDateError("");
        if (onSearch) {
            onSearch({ roomType, guests, checkIn, checkOut });
            // Scroll to rooms section
            const roomsSection = document.getElementById("rooms");
            if (roomsSection) {
                roomsSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div className="mx-auto max-w-6xl">
            <div className="search-bar">
                <div className="search-bar-field">
                    <label htmlFor="search-checkin" className="search-bar-label">Check-in</label>
                    <input
                        id="search-checkin"
                        type="date"
                        className="search-bar-input"
                        value={checkIn}
                        min={localToday()}
                        onChange={(e) => {
                            setCheckIn(e.target.value);
                            // A check-out that no longer follows the new check-in is cleared.
                            if (checkOut && checkOut <= e.target.value) setCheckOut("");
                            setDateError("");
                        }}
                    />
                </div>
                <div className="search-bar-field">
                    <label htmlFor="search-checkout" className="search-bar-label">Check-out</label>
                    <input
                        id="search-checkout"
                        type="date"
                        className="search-bar-input"
                        value={checkOut}
                        min={checkIn ? dayAfter(checkIn) : undefined}
                        onChange={(e) => {
                            setCheckOut(e.target.value);
                            setDateError("");
                        }}
                    />
                </div>
                <div className="search-bar-field">
                    <label htmlFor="search-guests" className="search-bar-label">Guests</label>
                    <select
                        id="search-guests"
                        className="search-bar-select"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        <option>1 Guest</option>
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5 Guests</option>
                        <option>10 Guests</option>
                        <option>20 Guests</option>
                        <option>50 Guests</option>
                        <option>120 Guests</option>
                    </select>
                </div>
                <div className="search-bar-field">
                    <label htmlFor="search-type" className="search-bar-label">Homestay Type</label>
                    <select
                        id="search-type"
                        className="search-bar-select"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                    >
                        <option>All Types</option>
                        <option>Bungalow Unit</option>
                        <option>Studio Unit</option>
                        <option>Family Room</option>
                        <option>Holiday Home</option>
                        <option>Tiny House</option>
                        <option>Event Hall</option>
                    </select>
                </div>
                <button
                    className="search-btn"
                    id="search-availability-btn"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>
            {dateError && (
                <p role="alert" className="mt-3 text-center text-sm" style={{ color: "var(--accent)" }}>
                    {dateError}
                </p>
            )}
        </div>
    );
}
