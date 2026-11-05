"use client";
import { useState, useEffect, useRef, type KeyboardEvent } from "react";
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
import { ms as msLocale, enGB } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabaseClient";

interface BookingCalendarProps {
    roomId: number;
    unitName?: string;
    totalUnits?: number;
    discounts?: { [key: string]: { roomId: number, percentage: number } };
    onSelect: (checkIn: Date | null, checkOut: Date | null) => void;
}

export default function BookingCalendar({ roomId, unitName, totalUnits = 1, discounts = {}, onSelect }: BookingCalendarProps) {
    const t = useTranslations("Calendar");
    const dfLocale = useLocale() === "ms" ? msLocale : enGB;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    // Roving tabindex: one Tab stop for both months, arrow keys move between days.
    const [focusDay, setFocusDay] = useState<Date>(() => new Date());
    const gridRef = useRef<HTMLDivElement>(null);
    const keyMoved = useRef(false);

    const nextMonth = addMonths(currentDate, 1);
    // The month arrows can scroll focusDay out of view; then the first visible day holds the Tab stop.
    const tabDay = isBefore(focusDay, startOfMonth(currentDate)) || isAfter(focusDay, endOfMonth(nextMonth))
        ? startOfMonth(currentDate)
        : focusDay;

    useEffect(() => {
        if (!keyMoved.current) return;
        keyMoved.current = false;
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${format(focusDay, "yyyy-MM-dd")}"]`)?.focus();
    }, [focusDay, currentDate]);

    const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const moves: Record<string, (d: Date) => Date> = {
            ArrowLeft: d => addDays(d, -1),
            ArrowRight: d => addDays(d, 1),
            ArrowUp: d => addDays(d, -7),
            ArrowDown: d => addDays(d, 7),
            Home: d => startOfWeek(d, { weekStartsOn: 1 }),
            End: d => endOfWeek(d, { weekStartsOn: 1 }),
            PageUp: d => addMonths(d, -1),
            PageDown: d => addMonths(d, 1),
        };
        const move = moves[e.key];
        if (!move || !(e.target as HTMLElement).dataset.day) return;
        e.preventDefault();
        const next = move(tabDay);
        if (isBefore(next, startOfMonth(currentDate))) setCurrentDate(startOfMonth(next));
        else if (isAfter(next, endOfMonth(nextMonth))) setCurrentDate(addMonths(startOfMonth(next), -1));
        keyMoved.current = true;
        setFocusDay(next);
    };

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select("check_in, check_out, unit_name, units_count")
                .eq("room_id", roomId)
                .eq("payment_status", "paid");

            if (error) {
                console.error("Error fetching bookings:", error);
                setLoading(false);
                return;
            }

            const requestedUnits = unitName ? unitName.split(", ").map(u => u.trim()) : [];
            const allBookedDays: Date[] = [];

            if (requestedUnits.length > 0) {
                data?.forEach((booking: any) => {
                    const bookingUnits = booking.unit_name ? booking.unit_name.split(", ").map((u: string) => u.trim()) : [];
                    const hasOverlap = requestedUnits.some(ru => bookingUnits.includes(ru));
                    if (hasOverlap) {
                        const start = parseISO(booking.check_in);
                        const end = parseISO(booking.check_out);
                        const days = eachDayOfInterval({ start, end });
                        if (days.length > 1) {
                            days.pop();
                        }
                        allBookedDays.push(...days);
                    }
                });
            } else {
                // When no unit is selected, count bookings per day
                const bookingsCountByDay: { [key: string]: number } = {};

                data?.forEach((booking: any) => {
                    const start = parseISO(booking.check_in);
                    const end = parseISO(booking.check_out);
                    const days = eachDayOfInterval({ start, end });
                    if (days.length > 1) {
                        days.pop();
                    }

                    days.forEach(d => {
                        const key = format(d, 'yyyy-MM-dd');
                        // Use units_count if available, otherwise assume 1 unit for the booking
                        const count = Number(booking.units_count || (booking.unit_name ? booking.unit_name.split(',').length : 1));
                        bookingsCountByDay[key] = (bookingsCountByDay[key] || 0) + count;
                    });
                });

                // Mark as booked only if total booked units >= totalUnits
                Object.keys(bookingsCountByDay).forEach(key => {
                    if (bookingsCountByDay[key] >= totalUnits) {
                        allBookedDays.push(parseISO(key));
                    }
                });
            }

            setBookedDates(allBookedDays);
            setLoading(false);
        }

        fetchBookings();
    }, [roomId, unitName, totalUnits]);

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
                            type="button"
                            aria-label={t("prev")}
                            onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                            className="p-1 hover:bg-[var(--surface-dark)] rounded-full transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                </div>
                <h3 className="font-display text-xl font-normal text-[var(--primary)]">
                    {format(monthDate, "MMMM yyyy", { locale: dfLocale })}
                </h3>
                <div className="w-8">
                    {showNext && (
                        <button
                            type="button"
                            aria-label={t("next")}
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1 hover:bg-[var(--surface-dark)] rounded-full transition-colors"
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
        const days = t("weekdays").split(",");
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

                const dateKey = format(cloneDay, "yyyy-MM-dd");
                const compositeKey = `${dateKey}_${roomId}`;
                const discount = discounts[compositeKey];

                days.push(
                    <button
                        type="button"
                        key={cloneDay.toString()}
                        className={`relative flex items-center justify-center h-10 w-full cursor-pointer group disabled:cursor-not-allowed aria-disabled:cursor-not-allowed`}
                        onClick={() => { if (!isCurrentMonth) return; setFocusDay(cloneDay); handleDateClick(cloneDay); }}
                        disabled={!isCurrentMonth}
                        aria-disabled={isCurrentMonth && (isBooked || isPastDay) ? true : undefined}
                        tabIndex={isCurrentMonth && isSameDay(cloneDay, tabDay) ? 0 : -1}
                        data-day={isCurrentMonth ? dateKey : undefined}
                        aria-hidden={!isCurrentMonth || undefined}
                        aria-pressed={isCurrentMonth ? isSelected : undefined}
                        aria-label={`${format(cloneDay, "EEEE, d MMMM yyyy", { locale: dfLocale })}, ${
                            isBooked ? t("booked")
                            : isPastDay ? t("past")
                            : isCheckIn ? t("selectedCheckIn")
                            : isCheckOut ? t("selectedCheckOut")
                            : isSelected ? t("selected")
                            : discount ? t("availableOff", { pct: discount.percentage })
                            : t("available")}`}
                    >
                        {/* Background for range */}
                        {checkIn && checkOut && isWithinInterval(cloneDay, { start: checkIn, end: checkOut }) && isCurrentMonth && (
                            <span className={`absolute inset-y-1.5 inset-x-0 bg-[var(--accent-light)] opacity-30 ${isCheckIn ? 'rounded-l-full' : ''} ${isCheckOut ? 'rounded-r-full' : ''}`} />
                        )}

                        <span className={`
              z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
              ${!isCurrentMonth ? "text-transparent pointer-events-none" : ""}
              ${isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : ""}
              ${isPastDay ? "text-gray-200 cursor-not-allowed" : ""}
              ${isSelected && isCurrentMonth ? "bg-[var(--accent)] text-[var(--accent-contrast)] scale-110" : `${isBooked || isPastDay ? "" : "hover:bg-[var(--surface)] "}text-[var(--primary)]`}
              ${discount && !isBooked && !isSelected && isCurrentMonth && !isPastDay ? "border border-green-400 bg-green-50" : ""}
            `}>
                            {format(cloneDay, "d")}
                        </span>

                        {/* Discount Badge */}
                        {discount && !isBooked && !isSelected && isCurrentMonth && !isPastDay && (
                            <span className="absolute -top-1 -right-0 z-20 scale-[0.6] origin-top-right">
                                <span className="block bg-green-500 text-white px-1.5 py-0.5 rounded-md font-black text-[10px] shadow-sm animate-pulse">
                                    -{discount.percentage}%
                                </span>
                            </span>
                        )}

                        {/* Dot indicator for available (dark blue/black as per image) */}
                        {!isBooked && !isSelected && isCurrentMonth && !isPastDay && (
                            <span className={`absolute bottom-1 h-1 w-1 rounded-full ${discount ? 'bg-green-500' : 'bg-[var(--primary)]'} opacity-20`} />
                        )}
                    </button>
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
        <div className="w-full bg-[var(--surface-raised)] rounded-[var(--radius-md)]">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                </div>
            ) : (
                <div ref={gridRef} onKeyDown={handleGridKeyDown} className="flex flex-col md:flex-row gap-8">
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
                    <div className="h-3 w-3 rounded-full border border-[var(--primary)]" />
                    <span>{t("legendAvailable")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-md bg-green-500 text-white px-1 text-[8px] flex items-center justify-center font-bold">PROMO</div>
                    <span>{t("legendDiscount")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-200" />
                    <span>{t("legendBooked")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                    <span>{t("legendSelected")}</span>
                </div>
            </div>
        </div>
    );
}
