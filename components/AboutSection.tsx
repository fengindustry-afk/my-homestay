"use client";
import React, { useState } from "react";
import Image from "next/image";

const stats = [
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        number: "12+",
        label: "Unique Rooms",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        number: "4.5",
        label: "Average Rating",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        number: "8",
        label: "Years Experience",
    },
];

const promises = [
    "Handpicked premium furnishings & linens",
    "24/7 concierge and guest support",
    "Strategic locations near top attractions",
];

export default function AboutSection() {
    const [showCert, setShowCert] = useState(false);

    return (
        <section id="about" className="section" style={{ background: "var(--surface)" }}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left: overlapping collage, the two plates drifting at
                        different rates so the pair reads as having depth. */}
                    <div className="relative" style={{ minHeight: 520 }}>
                        <div
                            className="absolute overflow-hidden"
                            style={{
                                top: 0,
                                left: 0,
                                width: "66%",
                                height: "74%",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-lg)",
                            }}
                            data-parallax="0.06"
                        >
                            <Image
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Langit.jpg"
                                alt="Evening view of the Indah Morib homestay grounds"
                                fill
                                sizes="(max-width: 1024px) 66vw, 33vw"
                                style={{ objectFit: "cover" }}
                            />
                        </div>

                        <div
                            className="absolute overflow-hidden"
                            style={{
                                bottom: 0,
                                right: 0,
                                width: "56%",
                                height: "64%",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-xl)",
                                border: "1px solid var(--border-strong)",
                                outline: "6px solid var(--surface)",
                            }}
                            data-parallax="-0.05"
                        >
                            <Image
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H5.jpg"
                                alt="Interior of a homestay unit at Indah Morib"
                                fill
                                sizes="(max-width: 1024px) 56vw, 28vw"
                                style={{ objectFit: "cover" }}
                            />
                        </div>

                        <div
                            className="absolute"
                            style={{
                                bottom: 44,
                                left: 12,
                                background: "var(--accent)",
                                color: "var(--accent-contrast)",
                                padding: "20px 26px",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-lg)",
                                zIndex: 3,
                            }}
                            data-reveal="scale"
                            data-reveal-delay="250"
                        >
                            <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                                8+
                            </div>
                            <div style={{ fontSize: "0.72rem", opacity: 0.85, marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Years of Excellence
                            </div>
                        </div>
                    </div>

                    {/* Right: copy. Vertical reveal, not horizontal — this column
                        already spans to the container edge, so an x-offset start
                        state would widen the document. */}
                    <div data-reveal>
                        <p className="section-tag">01 &nbsp;/&nbsp; About</p>
                        <h2 className="section-title" data-split>
                            A unique balance of <em style={{ color: "var(--accent)" }}>luxury</em> &amp; comfort
                        </h2>

                        <p className="section-description" style={{ marginBottom: 16 }}>
                            Nestled in the heart of Malaysia, Indah Morib Homestay offers a
                            blend of modern comfort and warm hospitality. Each room is
                            designed around how families actually use a space together.
                        </p>
                        <p className="section-description" style={{ marginBottom: 34 }}>
                            Whether you&apos;re here for a family getaway, a celebration, or a
                            company retreat, our team handles the details so the day runs itself.
                        </p>

                        <div className="mb-9 flex flex-col gap-4">
                            {promises.map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <span
                                        className="flex flex-shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            width: 22,
                                            height: 22,
                                            background: "color-mix(in srgb, var(--accent) 18%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--accent) 45%, transparent)",
                                        }}
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    <span style={{ fontSize: "0.95rem", color: "var(--primary-light)" }}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <a href="#rooms" className="btn-dark">
                            Discover more
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>

                        {/* Accreditations */}
                        <div className="mt-12 flex flex-col gap-4">
                            <p
                                style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Recognitions &amp; Standards
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {[
                                    { src: "/TCC Badge.png", title: "TCC Compliant", sub: "Verified 2026" },
                                    { src: "/MuslimFriendly.png", title: "Muslim Friendly", sub: null },
                                ].map((badge) => (
                                    <button
                                        key={badge.title}
                                        onClick={() => setShowCert(true)}
                                        className="badge-chip"
                                        aria-label={`View ${badge.title} certification`}
                                    >
                                        <span className="badge-chip-media">
                                            <Image
                                                src={badge.src}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="h-16 w-16 object-contain"
                                            />
                                        </span>
                                        <span className="flex flex-col items-start">
                                            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)", lineHeight: 1.2 }}>
                                                {badge.title}
                                            </span>
                                            {badge.sub && (
                                                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                    {badge.sub}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats.
                    Revealed as one block, not staggered per child: this container
                    clips (overflow hidden, for the gap-px hairline dividers), so
                    translating the children individually slides them out of the
                    frame and exposes the divider colour behind. */}
                <div
                    className="mt-24 grid grid-cols-2 gap-px md:grid-cols-4"
                    style={{
                        background: "var(--border)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                    }}
                    data-reveal
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="stat-item" style={{ background: "var(--background)" }}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificate */}
            {showCert && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Certificate of compliance"
                >
                    <div
                        className="absolute inset-0 animate-fade-in"
                        style={{ background: "var(--overlay)", backdropFilter: "blur(10px)" }}
                        onClick={() => setShowCert(false)}
                    />

                    <div
                        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden animate-scale-in"
                        style={{
                            background: "var(--surface-raised)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--radius-lg)",
                            boxShadow: "var(--shadow-xl)",
                        }}
                    >
                        <button
                            onClick={() => setShowCert(false)}
                            aria-label="Close certificate"
                            className="absolute right-5 top-5 z-20 rounded-full p-2 transition-transform hover:scale-110"
                            style={{ background: "var(--surface-dark)", color: "var(--primary)", border: "1px solid var(--border)" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        {/* Lenis must not hijack this pane's own scrolling. */}
                        <div className="flex-1 overflow-y-auto p-5 lg:p-10 no-scrollbar" data-lenis-prevent>
                            <div
                                className="relative flex min-h-[560px] flex-col justify-center rounded-2xl p-8 text-center lg:p-12"
                                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                            >
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: 0.04 }}>
                                    <svg width="360" height="360" viewBox="0 0 24 24" fill="var(--accent)">
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                    </svg>
                                </div>

                                <div className="relative z-10">
                                    <div
                                        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full"
                                        style={{
                                            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                                            color: "var(--accent)",
                                            border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                                        }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>

                                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 14 }}>
                                        Official Certification
                                    </p>
                                    <h2 className="text-display" style={{ fontSize: "2.2rem", color: "var(--primary)", marginBottom: 22 }}>
                                        Certificate of Compliance
                                    </h2>

                                    <div className="mx-auto mb-8" style={{ width: 80, height: 1, background: "var(--accent)" }} />

                                    <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 28 }}>
                                        This is to certify that{" "}
                                        <strong style={{ color: "var(--primary)" }}>Indah Morib Homestay</strong>{" "}
                                        has met all standards and requirements for
                                    </p>

                                    <div
                                        className="mb-8 inline-block rounded-xl px-9 py-5"
                                        style={{ background: "var(--surface-dark)", border: "1px solid var(--border-strong)" }}
                                    >
                                        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--primary)" }}>
                                            TCC COMPLIANT 2026
                                        </h3>
                                        <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.16em", marginTop: 6 }}>
                                            Trust, Corporate &amp; Education Sector Standards
                                        </p>
                                    </div>

                                    <div
                                        className="mt-10 grid grid-cols-2 gap-10 pt-8"
                                        style={{ borderTop: "1px solid var(--border)" }}
                                    >
                                        <div className="text-left">
                                            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 5 }}>
                                                Issue Date
                                            </p>
                                            <p style={{ fontWeight: 600, color: "var(--primary)" }}>January 15, 2026</p>
                                        </div>
                                        <div className="text-right">
                                            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 5 }}>
                                                Verify ID
                                            </p>
                                            <p style={{ fontWeight: 600, color: "var(--primary)", fontFamily: "var(--font-geist-mono), monospace" }}>
                                                FI-TCC-2026-IMH
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <a
                                            href="/TCC-Certificate.jpeg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            View official document
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
