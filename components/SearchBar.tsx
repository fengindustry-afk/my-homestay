"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("Search");
    const [checkIn, setCheckIn] = useState(localToday);
    const [checkOut, setCheckOut] = useState("");
    const [roomType, setRoomType] = useState("All Types");
    const [guests, setGuests] = useState("1 Guest");
    const [dateError, setDateError] = useState("");

    const handleSearch = () => {
        if (checkIn && checkOut && checkOut <= checkIn) {
            setDateError(t("dateError"));
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
                    <label htmlFor="search-checkin" className="search-bar-label">{t("checkIn")}</label>
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
                    <label htmlFor="search-checkout" className="search-bar-label">{t("checkOut")}</label>
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
                    <label htmlFor="search-guests" className="search-bar-label">{t("guests")}</label>
                    <select
                        id="search-guests"
                        className="search-bar-select"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        <option value="1 Guest">{t("guestCount", { count: 1 })}</option>
                        <option value="2 Guests">{t("guestCount", { count: 2 })}</option>
                        <option value="3 Guests">{t("guestCount", { count: 3 })}</option>
                        <option value="4 Guests">{t("guestCount", { count: 4 })}</option>
                        <option value="5 Guests">{t("guestCount", { count: 5 })}</option>
                        <option value="10 Guests">{t("guestCount", { count: 10 })}</option>
                        <option value="20 Guests">{t("guestCount", { count: 20 })}</option>
                        <option value="50 Guests">{t("guestCount", { count: 50 })}</option>
                        <option value="120 Guests">{t("guestCount", { count: 120 })}</option>
                    </select>
                </div>
                <div className="search-bar-field">
                    <label htmlFor="search-type" className="search-bar-label">{t("type")}</label>
                    <select
                        id="search-type"
                        className="search-bar-select"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                    >
                        <option value="All Types">{t("typeAll")}</option>
                        <option value="Bungalow Unit">{t("typeBungalow")}</option>
                        <option value="Studio Unit">{t("typeStudio")}</option>
                        <option value="Family Room">{t("typeFamily")}</option>
                        <option value="Holiday Home">{t("typeHoliday")}</option>
                        <option value="Tiny House">{t("typeTiny")}</option>
                        <option value="Event Hall">{t("typeHall")}</option>
                    </select>
                </div>
                <button
                    className="search-btn"
                    id="search-availability-btn"
                    onClick={handleSearch}
                >
                    {t("search")}
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
