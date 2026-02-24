"use client";
import { useState } from "react";

interface SearchBarProps {
    onSearch?: (criteria: any) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [roomType, setRoomType] = useState("All Types");
    const [guests, setGuests] = useState("1 Guest");

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ roomType, guests });
            // Scroll to rooms section
            const roomsSection = document.getElementById("rooms");
            if (roomsSection) {
                roomsSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-6" style={{ marginTop: -50, position: "relative", zIndex: 20 }}>
            <div className="search-bar animate-fade-up delay-400">
                <div className="search-bar-field">
                    <label className="search-bar-label">Check-in</label>
                    <input type="date" className="search-bar-input" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="search-bar-field">
                    <label className="search-bar-label">Check-out</label>
                    <input type="date" className="search-bar-input" />
                </div>
                <div className="search-bar-field">
                    <label className="search-bar-label">Guests</label>
                    <select
                        className="search-bar-select"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        <option>1 Guest</option>
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5+ Guests</option>
                    </select>
                </div>
                <div className="search-bar-field">
                    <label className="search-bar-label">Homestay Type</label>
                    <select
                        className="search-bar-select"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                    >
                        <option>All Types</option>
                        <option>Standard Homestay</option>
                        <option>Studio</option>
                        <option>Family Homestay</option>
                        <option>Deluxe Suite</option>
                        <option>Penthouse</option>
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
        </div>
    );
}
