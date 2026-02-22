"use client";
import { useState, useEffect } from "react";
import {
    format,
    addMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isPast,
    isWithinInterval,
    isBefore,
    isAfter,
    parseISO
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";

interface BookingCalendarProps {
    roomId: number;
    unitName?: string;
    onSelect: (checkIn: Date | null, checkOut: Date | null) => void;
}

export default function BookingCalendar({ roomId, unitName, onSelect }: BookingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    const nextMonth = addMonths(currentDate, 1);

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            const query = supabase
                .from("bookings")
                .select("check_in, check_out")
                .eq("room_id", roomId)
                .eq("payment_status", "paid");

            if (unitName) {
                query.eq("unit_name", unitName);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching bookings:", error);
                setLoading(false);
                return;
            }

            const allBookedDays: Date[] = [];
            data?.forEach((booking: any) => {
                const start = parseISO(booking.check_in);
                const end = parseISO(booking.check_out);
                const days = eachDayOfInterval({ start, end });
                // Usually check-out day is available for check-in of another guest
                // But for simplicity in viewing, we mark the whole interval as "booked" 
                // until we decide otherwise. In many hotels, check-out day is available.
                // Let's exclude the last day if we want to support same-day turnovers.
                // However, the standard logic is "Night-based". 
                // For this calendar, let's mark all days including check-out as booked 
                // if that's what the data implies.
                allBookedDays.push(...days);
            });

            setBookedDates(allBookedDays);
            setLoading(false);
        }

        fetchBookings();
    }, [roomId, unitName]);

    const handleDateClick = (day: Date) => {
        if (isDateBooked(day) || isPast(day) && !isSameDay(day, new Date())) return;

        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(day);
            setCheckOut(null);
            onSelect(day, null);
        } else if (checkIn && !checkOut) {
            if (isBefore(day, checkIn)) {
                setCheckIn(day);
                onSelect(day, null);
            } else {
                // Check if any date in between is booked
                const interval = eachDayOfInterval({ start: checkIn, end: day });
                const hasBookedDate = interval.some(d => isDateBooked(d));

                if (hasBookedDate) {
                    setCheckIn(day);
                    onSelect(day, null);
                } else {
                    setCheckOut(day);
                    onSelect(checkIn, day);
                }
            }
        }
    };

    const isDateBooked = (day: Date) => {
        return bookedDates.some(bookedDate => isSameDay(day, bookedDate));
    };

    const isDateSelected = (day: Date) => {
        if (checkIn && isSameDay(day, checkIn)) return true;
        if (checkOut && isSameDay(day, checkOut)) return true;
        if (checkIn && checkOut && isWithinInterval(day, { start: checkIn, end: checkOut })) return true;
        return false;
    };

    const renderHeader = (monthDate: Date, showPrev = false, showNext = false) => {
        return (
            <div className="flex items-center justify-between px-2 mb-4">
                <div className="w-8">
                    {showPrev && (
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-[var(--primary)]">
                    {format(monthDate, "MMMM yyyy")}
                </h3>
                <div className="w-8">
                    {showNext && (
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        return (
            <div className="grid grid-cols-7 mb-2 border-b border-[var(--border)] pb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-[var(--text-muted)] tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = isDateSelected(cloneDay);
                const isBooked = isDateBooked(cloneDay);
                const isCurrentMonth = isSameMonth(cloneDay, monthStart);
                const isPastDay = isPast(cloneDay) && !isSameDay(cloneDay, new Date());
                const isCheckIn = checkIn && isSameDay(cloneDay, checkIn);
                const isCheckOut = checkOut && isSameDay(cloneDay, checkOut);

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={`relative flex items-center justify-center h-10 w-full cursor-pointer group`}
                        onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
                    >
                        {/* Background for range */}
                        {checkIn && checkOut && isWithinInterval(cloneDay, { start: checkIn, end: checkOut }) && isCurrentMonth && (
                            <div className={`absolute inset-y-1.5 inset-x-0 bg-[var(--accent-light)] opacity-30 ${isCheckIn ? 'rounded-l-full' : ''} ${isCheckOut ? 'rounded-r-full' : ''}`} />
                        )}

                        <div className={`
              z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
              ${!isCurrentMonth ? "text-transparent pointer-events-none" : ""}
              ${isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : ""}
              ${isPastDay ? "text-gray-200 cursor-not-allowed" : ""}
              ${isSelected && isCurrentMonth ? "bg-[var(--accent)] text-white shadow-md scale-110" : "hover:bg-gray-50 text-[var(--primary)]"}
              ${isBooked && "hover:bg-transparent"}
            `}>
                            {format(cloneDay, "d")}
                        </div>

                        {/* Dot indicator for available (dark blue/black as per image) */}
                        {!isBooked && !isSelected && isCurrentMonth && !isPastDay && (
                            <div className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--primary)] opacity-20" />
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="min-h-[240px]">{rows}</div>;
    };

    return (
        <div className="w-full bg-white rounded-xl">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        {renderHeader(currentDate, true, false)}
                        {renderDays()}
                        {renderCells(currentDate)}
                    </div>
                    <div className="flex-1">
                        {renderHeader(nextMonth, false, true)}
                        {renderDays()}
                        {renderCells(nextMonth)}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--border)] pt-4 text-xs font-medium text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-200" />
                    <span>Not available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
}
