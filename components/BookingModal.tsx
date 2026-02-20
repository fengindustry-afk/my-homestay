"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

    const cover = room?.image || "";
    const allPhotos = useMemo(() => {
        const list = [cover, ...photos].filter(Boolean);
        // de-duplicate
        return Array.from(new Set(list));
    }, [cover, photos]);

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
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: room.id,
                    price: room.price,
                    title: room.title,
                    guestEmail: email,
                    guestName: name,
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md max-h-[90vh] scale-100 transform overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {allPhotos.length > 0 && (
                    <div className="mb-5">
                        <div className="overflow-hidden rounded-xl bg-[var(--surface)]">
                            <img
                                src={activePhoto || allPhotos[0]}
                                alt={room.title}
                                className="h-44 w-full object-cover cursor-pointer transition-transform hover:scale-105"
                                loading="lazy"
                                onClick={() => {
                                    setZoomedImage(activePhoto || allPhotos[0]);
                                    setIsZoomed(true);
                                }}
                            />
                        </div>
                        {allPhotos.length > 1 && (
                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                {allPhotos.slice(0, 10).map((url) => {
                                    const isActive = (activePhoto || allPhotos[0]) === url;
                                    return (
                                        <button
                                            key={url}
                                            type="button"
                                            onClick={() => setActivePhoto(url)}
                                            onDoubleClick={() => {
                                                setZoomedImage(url);
                                                setIsZoomed(true);
                                            }}
                                            className={`h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg border ${isActive ? "border-[var(--accent)]" : "border-[var(--border)]"
                                                } cursor-pointer transition-transform hover:scale-110`}
                                            aria-label="View photo"
                                        >
                                            <img src={url} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <h2 className="mb-1 text-2xl font-bold text-[var(--primary)]">Book Your Stay</h2>
                <p className="mb-6 text-sm text-[var(--text-muted)]">
                    Complete your reservation for <span className="font-semibold text-[var(--accent)]">{room.title}</span>
                </p>

                <div className="mb-6 flex items-center justify-between rounded-lg bg-[var(--surface)] p-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Total Price</span>
                    <span className="text-xl font-bold text-[var(--primary)]">RM{room.price}</span>
                </div>

                <form onSubmit={handlePay} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--primary)]">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 text-[var(--primary)] outline-none transition-colors focus:border-[var(--accent)]"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--primary)]">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 text-[var(--primary)] outline-none transition-colors focus:border-[var(--accent)]"
                            placeholder="john@example.com"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center rounded-lg bg-[var(--primary)] py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[var(--foreground)] hover:shadow-lg disabled:opacity-70"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                    Secure payment powered by Billplz (FPX / TNG)
                </p>
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
