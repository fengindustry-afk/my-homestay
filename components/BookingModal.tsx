"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import BookingCalendar from "./BookingCalendar";
import { format } from "date-fns";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: number;
        title: string;
        price: number;
        image?: string;
    } | null;
}

export default function BookingModal({ isOpen, onClose, room }: BookingModalProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);
    const [activePhoto, setActivePhoto] = useState<string>("");
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string>("");
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);

    const cover = room?.image || "";
    const allPhotos = useMemo(() => {
        const list = [cover, ...photos].filter(Boolean);
        // de-duplicate
        return Array.from(new Set(list));
    }, [cover, photos]);

    const nights = useMemo(() => {
        if (checkIn && checkOut) {
            const diff = checkOut.getTime() - checkIn.getTime();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
        return 0;
    }, [checkIn, checkOut]);

    const totalPrice = useMemo(() => {
        if (!room) return 0;
        return (nights || 1) * room.price;
    }, [nights, room]);

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

        if (!checkIn || !checkOut) {
            setError("Please select your stay dates on the calendar.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: room.id,
                    price: totalPrice,
                    title: room.title,
                    guestEmail: email,
                    guestName: name,
                    checkIn: format(checkIn, "yyyy-MM-dd"),
                    checkOut: format(checkOut, "yyyy-MM-dd"),
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
                                Serene accommodation with premium amenities.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] transition-all hover:shadow-inner">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Price per night</span>
                                        <span className="text-lg font-bold text-[var(--primary)]">RM{room.price}</span>
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
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Calendar & Form */}
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-dark)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--primary)]">Select Stay Dates</h3>
                                    <p className="text-sm text-[var(--text-muted)]">Check availability and book your slots</p>
                                </div>
                            </div>
                            <BookingCalendar roomId={room.id} onSelect={handleDateSelect} />
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
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors group-focus-within:text-[var(--accent)]">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--primary)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:shadow-lg"
                                        placeholder="example@mail.com"
                                    />
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
                                                    <span>Secure Checkout</span>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </button>
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
            {isZoomed && (
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
            )}
        </div>
    );
}
