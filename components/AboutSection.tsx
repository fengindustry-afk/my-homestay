"use client";
import React, { useState } from "react";

export default function AboutSection() {
    const [showCert, setShowCert] = useState(false);
    const stats = [
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            number: "12+",
            label: "Unique Rooms",
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
            number: "2,500+",
            label: "Happy Guests",
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            number: "4.5",
            label: "Average Rating",
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            number: "8",
            label: "Years Experience",
        },
    ];

    return (
        <section id="about" className="section" style={{ background: "var(--surface)" }}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left: Image Collage */}
                    <div className="relative" style={{ minHeight: 480 }}>
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "65%",
                                height: "75%",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                boxShadow: "var(--shadow-lg)",
                            }}
                        >
                            <img
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Langit.jpg"
                                alt="Langit"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: "55%",
                                height: "65%",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                boxShadow: "var(--shadow-lg)",
                                border: "6px solid white",
                            }}
                        >
                            <img
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H5.jpg"
                                alt="Homestay 5"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>


                        {/* Floating accent card */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 40,
                                left: 20,
                                background: "var(--accent)",
                                color: "#fff",
                                padding: "20px 24px",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-lg)",
                                zIndex: 2,
                            }}
                        >
                            <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>8+</div>
                            <div style={{ fontSize: "0.82rem", opacity: 0.9, marginTop: 4 }}>
                                Years of Excellence
                            </div>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div>
                        <p className="section-tag">About Our Homestay</p>
                        <h2 className="section-title">
                            A Unique Balance of{" "}
                            <span style={{ color: "var(--accent)" }}>Luxury</span> &amp;
                            Comfort
                        </h2>
                        <p className="section-description" style={{ marginBottom: 16 }}>
                            Nestled in the heart of Malaysia, Indah Morib Homestay offers a
                            perfect blend of modern luxury and warm hospitality. Each room is
                            thoughtfully designed to provide you with an unforgettable
                            experience.
                        </p>
                        <p
                            className="section-description"
                            style={{ marginBottom: 32 }}
                        >
                            Whether you&apos;re here for a family getaway, a romantic escape,
                            or a business trip, our dedicated team ensures every moment of
                            your stay is nothing short of extraordinary.
                        </p>

                        <div className="mb-8 flex flex-col gap-4">
                            {[
                                "Handpicked premium furnishings & linens",
                                "24/7 concierge and guest support",
                                "Strategic locations near top attractions",
                                "Complimentary breakfast & amenities",
                            ].map((item) => (
                                <div
                                    key={item}
                                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                                >
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            background: "var(--accent-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="var(--accent-dark)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "0.95rem",
                                            color: "var(--primary)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <a href="#rooms" className="btn-dark">
                            Discover More
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>

                        <div className="mt-12 flex flex-col gap-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Recognitions & Standards</p>
                            <div className="flex flex-wrap gap-4">
                                {/* TCC Badge Item */}
                                <div
                                    onClick={() => setShowCert(true)}
                                    className="group cursor-pointer flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-md"
                                >
                                    <div className="h-25 w-25 bg-[var(--surface)] rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border)] group-hover:bg-[var(--accent-light)] transition-colors">
                                        <img
                                            src="/TCC Badge.png"
                                            alt="TCC Badge"
                                            className="h-20 w-20 object-contain group-hover:scale-110 transition-transform"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=TCC';
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-black text-[var(--primary)] leading-tight">TCC Compliant</span>
                                        <span className="text-[13px] font-bold text-[var(--accent-dark)] uppercase tracking-wider">Verified 2026</span>
                                    </div>
                                </div>

                                {/* Muslim Friendly Badge Item */}
                                <div
                                    onClick={() => setShowCert(true)}
                                    className="group cursor-pointer flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-md"
                                >
                                    <div className="h-25 w-25 bg-[var(--surface)] rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border)] group-hover:bg-[var(--accent-light)] transition-colors">
                                        <img
                                            src="/MuslimFriendly.png"
                                            alt="Muslim Friendly Badge"
                                            className="h-20 w-20 object-contain group-hover:scale-110 transition-transform"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=TCC';
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-black text-[var(--primary)] leading-tight">Muslim Friendly</span>
                                    </div>
                                </div>

                                {/* Placeholder for future badge */}
                                <div className="hidden sm:flex items-center gap-3 bg-gray-50/50 p-2 pr-4 rounded-xl border border-dashed border-gray-200 opacity-60">
                                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="16" />
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-gray-400 leading-tight">Coming Soon</span>
                                        <span className="text-[9px] font-medium text-gray-300 uppercase tracking-wider">Next Standard</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div
                    className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4"
                    style={{
                        background: "#fff",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "16px 0",
                    }}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="stat-item">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificate Modal */}
            {showCert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowCert(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setShowCert(false)}
                            className="absolute right-6 top-6 z-20 rounded-full bg-white/80 p-2 text-gray-500 hover:text-gray-800 shadow-md backdrop-blur-md transition-all hover:scale-110"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar">
                            <div className="border-8 border-[var(--accent-light)] rounded-2xl p-8 lg:p-12 text-center bg-white relative min-h-[600px] flex flex-col justify-center">
                                {/* Background Seal Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                    </svg>
                                </div>

                                <div className="relative z-10">
                                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-xl shadow-green-100/50">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>

                                    <h3 className="text-sm font-black text-[var(--accent-dark)] uppercase tracking-[0.3em] mb-4">Official Certification</h3>
                                    <h2 className="text-4xl font-serif text-[var(--primary)] italic mb-6">Certificate of Compliance</h2>

                                    <div className="w-24 h-[2px] bg-[var(--accent)] mx-auto mb-8" />

                                    <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                                        This is to certify that <span className="text-[var(--primary)] font-bold">Indah Morib Homestay</span> has successfully met all standards and requirements for
                                    </p>

                                    <div className="bg-[var(--surface)] inline-block px-10 py-5 rounded-2xl border-2 border-[var(--accent-light)] mb-8">
                                        <h4 className="text-2xl font-black text-[var(--primary)] tracking-tight">TCC COMPLIANT 2026</h4>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Trust, Corporate & Education Sector Standards</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 mt-12 border-t border-[var(--border)] pt-8">
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Issue Date</p>
                                            <p className="font-bold text-[var(--primary)]">January 15, 2026</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Verify ID</p>
                                            <p className="font-bold text-[var(--primary)] font-mono">FI-TCC-2026-IMH</p>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <a
                                            href="/TCC-Certificate.jpeg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[var(--accent)] transition-all shadow-lg shadow-black/5 hover:shadow-[var(--accent)]/20"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            View Official Document
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
