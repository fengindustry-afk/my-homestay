"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { eachDayOfInterval, format } from "date-fns";

import BookingCalendar from "./BookingCalendar";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: number;
        title: string;
        price: number;
        basic_price?: number;
        full_price?: number;
        image?: string;
        description?: string;
        amenities?: string;
    } | null;
}

export default function BookingModal({ isOpen, onClose, room }: BookingModalProps) {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [icNumber, setIcNumber] = useState("");
    const [checkInTime, setCheckInTime] = useState("15:00");
    const [checkOutTime, setCheckOutTime] = useState("12:00");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);
    const [activePhoto, setActivePhoto] = useState<string>("");
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string>("");
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [discounts, setDiscounts] = useState<{ [key: string]: { roomId: number, percentage: number } }>({});

    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const [selectedPackage, setSelectedPackage] = useState<string>("");
    const [unitsCount, setUnitsCount] = useState<number>(1);
    const [addOns, setAddOns] = useState({
        bbq: false,
        cradle: false,
        karaoke: "none",
        karaokeHours: 1,
        karaokeDays: 1,
    });

    // Helper functions for discounts
    const toKey = (date: Date) => {
        try {
            if (isNaN(date.getTime())) return "invalid";
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        } catch (e) {
            return "invalid";
        }
    };

    const getDiscountForDate = (day: Date, roomId: number) => {
        const dateKey = toKey(day);
        const compositeKey = `${dateKey}_${roomId}`;
        const discount = discounts[compositeKey];
        return discount ? discount.percentage : 0;
    };

    const calculateTotalDiscount = (checkIn: Date, checkOut: Date, roomId: number) => {
        if (!checkIn || !checkOut || !roomId) return 0;
        const interval = eachDayOfInterval({ start: checkIn, end: checkOut });
        const discountPercentages = interval.map(d => getDiscountForDate(d, roomId)).filter(p => p > 0);

        // If there are any discounts, use the highest percentage found
        return discountPercentages.length > 0 ? Math.max(...discountPercentages) : 0;
    };

    const cover = room?.image || "";
    const allPhotos = useMemo(() => {
        const list = [cover, ...photos].filter(Boolean);
        // de-duplicate
        return Array.from(new Set(list));
    }, [cover, photos]);

    // Units mapping
    const units = useMemo(() => {
        if (!room) return [];
        const title = room.title.toLowerCase();
        if (title.includes("homestay 2")) {
            // For Homestay 2, always return all units regardless of package selection
            // Users should select individual units, not packages
            return ["Unit 1 (Left)", "Unit 2 (Right)", "Unit 3 (Left)", "Unit 4 (Right)"];
        }
        if (title.includes("homestay 4")) return ["Unit Right", "Unit Left"];
        if (title.includes("homestay 6")) return ["Unit Right", "Unit Left", "Main Unit"];
        return [];
    }, [room]);

    const isHomestay2 = room?.title.toLowerCase().includes("homestay 2") || false;
    const isMultiUnitRoom = useMemo(() => {
        const title = room?.title.toLowerCase() || "";
        return title.includes("homestay 2") || title.includes("homestay 4") || title.includes("homestay 6");
    }, [room]);

    // Set default unit if available
    useEffect(() => {
        if (isMultiUnitRoom) {
            // For multi-unit rooms, don't auto-select any unit by default
            // User should explicitly choose their preferred units
            return;
        }

        if (units.length === 1) {
            setSelectedUnit(units[0]);
        } else if (units.length > 0 && !units.includes(selectedUnit)) {
            setSelectedUnit(units[0]);
        } else if (units.length === 0) {
            setSelectedUnit("");
        }
    }, [units, selectedUnit, isMultiUnitRoom]);

    const handleUnitToggle = (unit: string) => {
        const currentUnits = selectedUnit ? selectedUnit.split(", ").filter(Boolean) : [];
        let newUnits;
        if (currentUnits.includes(unit)) {
            newUnits = currentUnits.filter(u => u !== unit);
        } else {
            newUnits = [...currentUnits, unit];
        }
        setSelectedUnit(newUnits.join(", "));
    };

    useEffect(() => {
        if (isMultiUnitRoom) {
            const count = selectedUnit ? selectedUnit.split(", ").filter(Boolean).length : 0;
            setUnitsCount(count); // Don't default to 1 for multi-unit rooms
        }
    }, [selectedUnit, isMultiUnitRoom]);

    const availablePackages = useMemo(() => {
        if (!room) return [];
        if (isHomestay2) {
            return [
                { name: "Lower Floor - Unit 1 (Left)", price: 350 },
                { name: "Lower Floor - Unit 2 (Right)", price: 350 },
                { name: "Upper Floor - Unit 3 (Left)", price: 300 },
                { name: "Upper Floor - Unit 4 (Right)", price: 300 },
            ];
        }
        const pkgs = [];
        if (room.basic_price) pkgs.push({ name: "Basic Package", price: room.basic_price });
        if (room.full_price) pkgs.push({ name: "Full Package", price: room.full_price });
        return pkgs;
    }, [room, isHomestay2]);

    useEffect(() => {
        if (availablePackages.length > 0 && !selectedPackage) {
            // Don't auto-select packages for Homestay 2 since users select individual units
            if (!isHomestay2) {
                setSelectedPackage(availablePackages[0].name);
            }
        } else if (availablePackages.length === 0) {
            setSelectedPackage("");
        }
    }, [availablePackages, selectedPackage, isHomestay2]);

    const nights = useMemo(() => {
        if (checkIn && checkOut) {
            const diff = checkOut.getTime() - checkIn.getTime();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
        return 0;
    }, [checkIn, checkOut]);

    const addOnsPrice = useMemo(() => {
        if (!isHomestay2) return 0;
        let total = 0;
        if (addOns.bbq) total += 30;
        if (addOns.cradle) total += 10;
        if (addOns.karaoke === "hour") total += 25 * addOns.karaokeHours;
        if (addOns.karaoke === "day") total += 150 * addOns.karaokeDays;
        return total;
    }, [isHomestay2, addOns]);

    const extraHours = useMemo(() => {
        if (!checkOutTime) return 0;
        const [hours, mins] = checkOutTime.split(":").map(Number);
        if (hours > 12 || (hours === 12 && mins > 0)) {
            const extra = hours - 12 + (mins > 0 ? 1 : 0);
            return extra > 0 ? extra : 0;
        }
        return 0;
    }, [checkOutTime]);

    const totalPrice = useMemo(() => {
        if (!room) return 0;

        let subtotal = 0;
        if (isHomestay2) {
            const selected = selectedUnit.split(", ").filter(Boolean);
            selected.forEach(u => {
                if (u.includes("1") || u.includes("2")) subtotal += 350;
                else subtotal += 300;
            });
            if (selected.length === 0) subtotal = 0; // No units selected = RM0
        } else {
            let basePrice = room.price;
            if (selectedPackage === "Basic Package" && room.basic_price) {
                basePrice = room.basic_price;
            } else if (selectedPackage === "Full Package" && room.full_price) {
                basePrice = room.full_price;
            }
            subtotal = basePrice * unitsCount;
        }

        const isHomestay3or5 = room.title.toLowerCase().includes("homestay 3") || room.title.toLowerCase().includes("homestay 5");
        const lateFeeRate = isHomestay3or5 ? 20 : 10;
        const totalLateFee = extraHours * lateFeeRate;

        const computedPrice = ((nights || 1) * subtotal) + addOnsPrice + totalLateFee;

        // Apply discount if available
        let finalPrice = computedPrice;
        if (checkIn && checkOut && room.id) {
            const totalDiscountPercentage = calculateTotalDiscount(checkIn, checkOut, room.id);
            const discountAmount = (computedPrice * totalDiscountPercentage) / 100;
            finalPrice = Math.max(0, computedPrice - discountAmount);
        }

        return finalPrice;
    }, [nights, room, selectedPackage, addOnsPrice, isHomestay2, extraHours, unitsCount, selectedUnit, checkIn, checkOut]);

    // Calculate discount details for display
    const discountDetails = useMemo(() => {
        if (!checkIn || !checkOut || !room?.id) return { percentage: 0, amount: 0 };

        const totalDiscountPercentage = calculateTotalDiscount(checkIn, checkOut, room.id);
        const computedPrice = totalPrice;
        const discountAmount = totalDiscountPercentage > 0 ? (computedPrice * 100) / (100 - totalDiscountPercentage) * (totalDiscountPercentage / 100) : 0;

        return {
            percentage: totalDiscountPercentage,
            amount: discountAmount
        };
    }, [checkIn, checkOut, room?.id, totalPrice]);

    // Load discounts from database on mount
    useEffect(() => {
        async function loadDiscounts() {
            try {
                const response = await fetch('/api/discounts');
                const data = await response.json();

                if (data.discounts) {
                    const discountsMap: { [key: string]: { roomId: number, percentage: number } } = {};
                    data.discounts.forEach((discount: any) => {
                        const dateKey = discount.discount_date;
                        const roomId = Number(discount.room_id);
                        if (roomId && !isNaN(roomId)) {
                            const compositeKey = `${dateKey}_${roomId}`;
                            discountsMap[compositeKey] = {
                                roomId: roomId,
                                percentage: discount.percentage
                            };
                        }
                    });
                    setDiscounts(discountsMap);
                    // Also update localStorage for immediate local feedback if needed
                    localStorage.setItem('homestay-discounts', JSON.stringify(discountsMap));
                }
            } catch (error) {
                console.warn('Failed to load discounts from database:', error);

                // Fallback to localStorage if API fails
                try {
                    const savedDiscounts = localStorage.getItem('homestay-discounts');
                    if (savedDiscounts) {
                        setDiscounts(JSON.parse(savedDiscounts));
                    }
                } catch (e) { }
            }
        }

        if (isOpen) {
            loadDiscounts();
        }
    }, [isOpen]);

    // Listen for discount updates from other components
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'homestay-discounts') {
                try {
                    if (e.newValue) {
                        setDiscounts(JSON.parse(e.newValue));
                    }
                } catch (error) {
                    console.warn('Failed to parse updated discounts:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadPhotos() {
            if (!room?.id) return;

            const { data, error } = await supabase
                .from("room_photos")
                .select("url")
                .eq("room_id", room.id)
                .order("created_at", { ascending: false });

            if (!isMounted) return;
            if (error) {
                console.warn("Unable to load room_photos:", error.message);
                setPhotos([]);
                setActivePhoto(cover);
                return;
            }

            const urls = (data || []).map((r: { url: string }) => r.url).filter(Boolean);
            setPhotos(urls);
            setActivePhoto(cover || urls[0] || "");
        }

        void loadPhotos();

        return () => {
            isMounted = false;
        };
    }, [room?.id, cover]);

    if (!isOpen || !room) return null;

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();

        if (units.length > 0 && !selectedUnit) {
            setError("Please select a unit.");
            return;
        }

        if (!checkIn || !checkOut) {
            setError("Please select your stay dates on the calendar.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const addonsList = [];
            if (addOns.bbq) addonsList.push("BBQ Pit");
            if (addOns.cradle) addonsList.push("Cradle");
            if (addOns.karaoke === "hour") addonsList.push(`Karaoke ${addOns.karaokeHours}hr`);
            if (addOns.karaoke === "day") addonsList.push(`Karaoke ${addOns.karaokeDays}day`);
            const fullPackageName = isHomestay2 && addonsList.length > 0
                ? `${selectedPackage} + ${addonsList.join(', ')}`
                : (selectedPackage || "Basic Package");

            const checkInFormatted = format(checkIn, "yyyy-MM-dd");
            const checkOutFormatted = format(checkOut, "yyyy-MM-dd");

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: room.id,
                    price: totalPrice,
                    title: room.title,
                    guestPhone: phone,
                    guestName: name,
                    icNumber: icNumber,
                    checkIn: checkInFormatted,
                    checkOut: checkOutFormatted,
                    checkInTime,
                    checkOutTime,
                    unitName: selectedUnit || null,
                    packageName: fullPackageName,
                    unitsCount: unitsCount,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Failed to initialize payment. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (ci: Date | null, co: Date | null) => {
        setCheckIn(ci);
        setCheckOut(co);
        if (error && ci && co) setError("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[95vh] scale-100 transform overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl transition-all animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-20 rounded-full bg-white/80 p-2 text-gray-500 hover:text-gray-800 shadow-md backdrop-blur-md transition-all hover:scale-110"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="flex flex-col lg:flex-row">
                    {/* Left Side: Photos & Details */}
                    <div className="lg:w-1/3 border-r border-[var(--border)] overflow-hidden">
                        {allPhotos.length > 0 && (
                            <div className="relative group">
                                <img
                                    src={activePhoto || allPhotos[0]}
                                    alt={room.title}
                                    className="h-64 lg:h-80 w-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                                    onClick={() => {
                                        setZoomedImage(activePhoto || allPhotos[0]);
                                        setIsZoomed(true);
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                                {allPhotos.length > 1 && (
                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {allPhotos.slice(0, 5).map((url) => {
                                            const isActive = (activePhoto || allPhotos[0]) === url;
                                            return (
                                                <button
                                                    key={url}
                                                    type="button"
                                                    onClick={() => setActivePhoto(url)}
                                                    className={`h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 shadow-lg transition-all hover:scale-105 ${isActive ? "border-[var(--accent)] scale-110" : "border-white/50"
                                                        }`}
                                                >
                                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-8">
                            <h2 className="mb-2 text-2xl font-bold text-[var(--primary)] leading-tight">{room.title}</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">
                                {room.description || "Serene accommodation with premium amenities."}
                            </p>

                            {room.amenities && (
                                <div className="mb-6">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3">Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.split(",").map((a, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[11px] font-medium text-[var(--primary)]">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                {a.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] transition-all hover:shadow-inner">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Base Price</span>
                                        <span className="text-lg font-bold text-[var(--primary)]">
                                            RM{isHomestay2 ? (selectedPackage.includes("Upper Floor") ? 300 : selectedPackage.includes("Lower Floor") ? 350 : room.price) :
                                                (selectedPackage === "Basic Package" ? room.basic_price : selectedPackage === "Full Package" ? room.full_price : room.price)}
                                        </span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-[var(--border)]" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Nights</span>
                                        <span className="text-lg font-bold text-[var(--accent)]">{nights || "--"}</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-[var(--primary)] p-5 text-white shadow-xl shadow-[var(--primary)]/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Total Amount</span>
                                        <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-medium">Auto-calculated</span>
                                    </div>
                                    <span className="text-3xl font-black">RM{totalPrice}</span>
                                </div>

                                {/* Discount Display */}
                                {discountDetails.percentage > 0 && (
                                    <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                </div>
                                                <span className="text-sm font-bold text-green-700">Discount Applied!</span>
                                            </div>
                                            <span className="text-lg font-black text-green-600">-{discountDetails.percentage}%</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-medium">Original Amount:</span>
                                                <span className="text-green-700 font-bold">RM{Math.round((totalPrice * 100) / (100 - discountDetails.percentage))}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-medium">Discount Amount:</span>
                                                <span className="text-green-700 font-bold">-RM{Math.round(discountDetails.amount)}</span>
                                            </div>
                                            <div className="h-px bg-green-200 my-2"></div>
                                            <div className="flex justify-between text-base">
                                                <span className="text-green-700 font-bold">You Pay:</span>
                                                <span className="text-lg font-black text-green-600">RM{totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Calendar & Form */}
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        <section className="mb-10">

                            {availablePackages.length > 0 && !isHomestay2 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-[var(--surface-dark)] flex items-center justify-center text-[var(--primary)]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--primary)]">Select Package</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Choose a package for your stay</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availablePackages.map((pkg) => (
                                            <button
                                                key={pkg.name}
                                                type="button"
                                                onClick={() => setSelectedPackage(pkg.name)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedPackage === pkg.name
                                                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-dark)] shadow-md translate-y-[-2px]"
                                                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:bg-white"
                                                    }`}
                                            >
                                                <span className="text-sm font-bold">{pkg.name}</span>
                                                <span className="text-xs mt-1">RM{pkg.price}/night</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Moved Unit Selection to Top */}
                            {units.length > 1 && (
                                <div className="mb-10 bg-[var(--surface-dark)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[var(--primary)] shadow-sm">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--primary)]">Choose Unit</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Select your preferred unit in {room.title}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {units.map((u) => {
                                            const isSelected = isMultiUnitRoom
                                                ? selectedUnit.split(", ").includes(u)
                                                : selectedUnit === u;
                                            const uPrice = (u.includes("1") || u.includes("2")) ? 350 : 300;
                                            return (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isMultiUnitRoom) {
                                                            handleUnitToggle(u);
                                                        } else {
                                                            setSelectedUnit(u);
                                                        }
                                                        setCheckIn(null);
                                                        setCheckOut(null);
                                                    }}
                                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${isSelected
                                                        ? "border-[var(--accent)] bg-white text-[var(--accent-dark)] shadow-md translate-y-[-2px]"
                                                        : "border-transparent bg-white/50 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:bg-white"
                                                        }`}
                                                >
                                                    <span className="text-sm font-black uppercase tracking-tight">{u}</span>
                                                    {isHomestay2 && <span className="text-xs font-bold opacity-70 mt-1">RM{uPrice} / night</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isMultiUnitRoom && (
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-center gap-3 bg-[var(--surface-dark)] px-6 py-3 rounded-2xl border border-[var(--border)] shadow-sm">
                                        <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-black">
                                            {unitsCount}
                                        </div>
                                        <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">
                                            {unitsCount} Unit{unitsCount !== 1 ? 's' : ''} Selected
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isHomestay2 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-[var(--surface-dark)] flex items-center justify-center text-[var(--primary)]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--primary)]">Select Add Ons</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Enhance your stay</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-white cursor-pointer transition-all">
                                            <input type="checkbox" className="w-5 h-5 accent-[var(--accent)]" checked={addOns.bbq} onChange={(e) => setAddOns({ ...addOns, bbq: e.target.checked })} />
                                            <div>
                                                <div className="text-sm font-bold text-[var(--primary)]">Barbecue Pit</div>
                                                <div className="text-xs text-[var(--text-muted)]">+RM30</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-white cursor-pointer transition-all">
                                            <input type="checkbox" className="w-5 h-5 accent-[var(--accent)]" checked={addOns.cradle} onChange={(e) => setAddOns({ ...addOns, cradle: e.target.checked })} />
                                            <div>
                                                <div className="text-sm font-bold text-[var(--primary)]">Cradle</div>
                                                <div className="text-xs text-[var(--text-muted)]">+RM10</div>
                                            </div>
                                        </label>

                                        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <div className="text-sm font-bold text-[var(--primary)]">Karaoke Set</div>
                                                    <div className="text-xs text-[var(--text-muted)]">RM25/hour or RM150/day</div>
                                                </div>
                                                <select className="border border-[var(--border)] rounded-lg p-2 text-sm bg-white" value={addOns.karaoke} onChange={(e) => setAddOns({ ...addOns, karaoke: e.target.value })}>
                                                    <option value="none">None</option>
                                                    <option value="hour">Per Hour</option>
                                                    <option value="day">Per Day</option>
                                                </select>
                                            </div>
                                            {addOns.karaoke === 'hour' && (
                                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border)]">
                                                    <span className="text-xs text-[var(--text-muted)]">Number of hours:</span>
                                                    <input type="number" min="1" className="w-16 border border-[var(--border)] rounded-md p-1 text-sm bg-white" value={addOns.karaokeHours} onChange={(e) => setAddOns({ ...addOns, karaokeHours: parseInt(e.target.value) || 1 })} />
                                                </div>
                                            )}
                                            {addOns.karaoke === 'day' && (
                                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border)]">
                                                    <span className="text-xs text-[var(--text-muted)]">Number of days:</span>
                                                    <input type="number" min="1" className="w-16 border border-[var(--border)] rounded-md p-1 text-sm bg-white" value={addOns.karaokeDays} onChange={(e) => setAddOns({ ...addOns, karaokeDays: parseInt(e.target.value) || 1 })} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-dark)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--primary)]">Select Stay Dates</h3>
                                    <p className="text-sm text-[var(--text-muted)]">Check availability for {selectedUnit || "this homestay"}</p>
                                </div>
                            </div>
                            <BookingCalendar roomId={room.id} unitName={selectedUnit} onSelect={handleDateSelect} />
                        </section>

                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-10" />

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-[var(--surface-dark)] flex items-center justify-center text-[var(--primary)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--primary)]">Guest Information</h3>
                            </div>

                            <form onSubmit={handlePay} className="grid md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">IC Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                        placeholder="000000000000"
                                        value={icNumber}
                                        onChange={(e) => setIcNumber(e.target.value)}
                                    />
                                </div>

                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">Check-in Time</label>
                                    <input
                                        type="time"
                                        required
                                        min="15:00"
                                        value={checkInTime}
                                        onChange={(e) => setCheckInTime(e.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                    />
                                    <span className="text-[10px] text-gray-500 mt-1 block">Earliest check-in is 3:00 PM (15:00)</span>
                                </div>

                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">Check-out Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={checkOutTime}
                                        onChange={(e) => setCheckOutTime(e.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                    />
                                    <span className="text-[10px] text-gray-500 mt-1 block">RM{room.title.toLowerCase().includes("homestay 3") || room.title.toLowerCase().includes("homestay 5") ? '20' : '10'}/hour extra charge applies after 12:00 PM</span>
                                </div>

                                <div className="md:col-span-2">
                                    {error && (
                                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative group w-full overflow-hidden rounded-2xl bg-[var(--primary)] py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[var(--foreground)] hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {loading ? (
                                                <>
                                                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Proceed Payment</span>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </button>
                                    <p className="mt-3 text-center text-xs font-semibold text-[var(--primary)] selection:bg-[var(--accent)] selection:text-white">You will be notified via WhatsApp.</p>
                                </div>
                            </form>

                            <div className="mt-8 flex items-center justify-center gap-4 rounded-2xl bg-gray-50 p-6 border border-dashed border-gray-200">
                                <div className="h-16 w-16 flex-shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-gray-100 overflow-hidden group hover:scale-110 transition-transform">
                                    <img
                                        src="/feng-logo.png"
                                        alt="Feng Industry Logo"
                                        className="max-w-full max-h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=FI';
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Official Partner</span>
                                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                                        <span className="text-[10px] font-bold text-gray-400">Verified Secure</span>
                                    </div>
                                    <h4 className="text-sm font-black text-gray-500 tracking-tight">FENG INDUSTRY</h4>
                                    <p className="text-[11px] font-mono text-gray-400">Reg: 003552405X</p>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest opacity-60">
                                Secure payment powered by Billplz • No hidden fees
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Zoom Modal */}
            {
                isZoomed && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4"
                        onClick={() => setIsZoomed(false)}
                    >
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute right-4 top-4 text-white hover:text-gray-300 z-10"
                            aria-label="Close zoom"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <img
                            src={zoomedImage}
                            alt="Zoomed view"
                            className="max-w-full max-h-full object-contain cursor-zoom-out"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                            Click anywhere to close
                        </p>
                    </div>
                )
            }
        </div >
    );
}
