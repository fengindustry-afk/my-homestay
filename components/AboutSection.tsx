"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const stats = [
    { number: "12+", label: "Unique Rooms" },
    { number: "2,500+", label: "Happy Guests" },
    { number: "4.5", label: "Average Rating" },
    { number: "8", label: "Years Experience" },
];

const promises = [
    "Handpicked premium furnishings & linens",
    "24/7 concierge and guest support",
    "Strategic locations near top attractions",
];

const badges = [
    { src: "/TCC Badge.png", title: "TCC Compliant", sub: "Verified 2026", cert: true },
    { src: "/MuslimFriendly.png", title: "Muslim Friendly", sub: null, cert: false },
];

export default function AboutSection() {
    const [showCert, setShowCert] = useState(false);

    // Escape closes the certificate, as the close button does.
    useEffect(() => {
        if (!showCert) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowCert(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showCert]);

    return (
        <>
            {/* Part 1: the intro, then the four figures in a hairline row. */}
            <section id="about" className="section">
                <div className="wrap">
                    <div className="about-intro">
                        <div data-reveal>
                            <p className="section-tag">About</p>
                            <h2 className="section-title">
                                <span className="title-italic">A unique balance</span>
                                <span className="title-roman title-indent">of luxury &amp; comfort</span>
                            </h2>
                        </div>

                        {/* Vertical reveal only. An x-offset start state would widen the document. */}
                        <div data-reveal data-reveal-delay="120">
                            <p className="section-description" style={{ marginBottom: 16 }}>
                                Nestled in the heart of Malaysia, Indah Morib Homestay offers a
                                blend of modern comfort and warm hospitality. Each room is
                                designed around how families actually use a home together.
                            </p>
                            <p className="section-description">
                                Whether you&apos;re here for a family getaway, a celebration, or a
                                company retreat, our team handles the details so the day runs
                                itself.
                            </p>

                            <ul className="promise-list">
                                {promises.map((item) => (
                                    <li key={item}>
                                        <span className="promise-tick" aria-hidden="true">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <a href="#rooms" className="btn-outline">
                                Discover more
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="stat-row" data-reveal>
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-item">
                                <div className="stat-number">{stat.number}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Part 2: full-bleed photograph with a framed card and the accreditations. */}
            <section className="recognition">
                <div className="recognition-photo">
                    <Image
                        src="/images/content/pool3.jpg"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>
                <div className="recognition-scrim" aria-hidden="true" />

                <div className="wrap recognition-inner">
                    <h2 className="recognition-title title-italic">Recognitions &amp; Standards</h2>

                    <div className="frame-card" data-reveal>
                        <div className="frame-photo">
                            <Image
                                src="/images/content/h5.jpg"
                                alt="Interior of a homestay unit at Indah Morib"
                                fill
                                sizes="(max-width: 768px) 90vw, 560px"
                                style={{ objectFit: "cover" }}
                            />
                        </div>

                        <div className="frame-badges">
                            {badges.map((badge) => {
                                // Only the TCC badge opens a document. The other is a plain label.
                                const Tag = badge.cert ? "button" : "span";
                                return (
                                    <Tag
                                        key={badge.title}
                                        onClick={badge.cert ? () => setShowCert(true) : undefined}
                                        className="badge-chip"
                                        aria-label={badge.cert ? `View ${badge.title} certification` : undefined}
                                    >
                                        <span className="badge-chip-media">
                                            <Image
                                                src={badge.src}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 object-contain"
                                            />
                                        </span>
                                        <span className="flex flex-col items-start">
                                            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)", lineHeight: 1.2 }}>
                                                {badge.title}
                                            </span>
                                            {badge.sub && (
                                                <span style={{ fontSize: "0.66rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                                                    {badge.sub}
                                                </span>
                                            )}
                                        </span>
                                    </Tag>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certificate. Outside the sections so the fixed overlay is not trapped
                inside a transformed reveal wrapper. */}
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
        </>
    );
}
