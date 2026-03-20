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
            label: "Boutique Units",
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
            label: "Global Guests",
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            number: "4.9",
            label: "Guest Rating",
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            number: "2026",
            label: "Visit Malaysia",
        },
    ];

    return (
        <section id="about" className="section bg-[var(--background)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left: Image Collage with Organic Shapes */}
                    <div className="relative" style={{ minHeight: 520 }}>
                        <div
                            className="organic-card"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "70%",
                                height: "80%",
                                boxShadow: "var(--shadow-lg)",
                            }}
                        >
                            <img
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Langit.jpg"
                                alt="Indah Morib Sky View"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div
                            className="organic-card"
                            style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: "60%",
                                height: "70%",
                                boxShadow: "var(--shadow-lg)",
                                border: "8px solid var(--background)",
                            }}
                        >
                            <img
                                src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H5.jpg"
                                alt="Boutique Interior"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>

                        {/* Floating accent card */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 60,
                                left: 40,
                                background: "var(--primary)",
                                color: "#fff",
                                padding: "24px 32px",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-xl)",
                                zIndex: 2,
                            }}
                        >
                            <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1 }}>8+</div>
                            <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Years of Excellence
                            </div>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div>
                        <p className="section-tag">Our Story & Vision</p>
                        <h2 className="section-title">
                            A Nature-Distilled <span className="text-[var(--accent)]">Sanctuary</span> in Banting
                        </h2>
                        <p className="section-description text-lg text-[var(--text-muted)] mb-6">
                            Founded by a tech entrepreneur with a passion for sustainable agrotourism, Indah Morib Homestay is more than just a place to sleep. It's a <strong>Modern Eco-Stay</strong> designed for the 2026 traveler who seeks both digital connectivity and natural serenity.
                        </p>
                        
                        <div className="bg-[var(--surface)] p-8 rounded-2xl mb-8 border-l-4 border-[var(--accent)]">
                            <h3 className="font-serif text-xl mb-3 text-[var(--primary)]">The Host's Story</h3>
                            <p className="text-[var(--text-muted)] italic">
                                "As a tech professional, I wanted to create a space where innovation meets the rustic charm of Kampung Endah. From solar-powered irrigation in our sugarcane gardens to smart-lock check-ins, we've distilled nature's best with modern convenience."
                            </p>
                        </div>

                        <div className="mb-10 flex flex-col gap-5">
                            {[
                                { title: "Eco-Friendly Tech", desc: "Solar-powered irrigation & smart energy management." },
                                { title: "Hyper-Local Roots", desc: "Located in the award-winning Kampung Endah." },
                                { title: "Boutique Standards", desc: "Curated linens and organic clay-toned aesthetics." },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--primary)] leading-tight">{item.title}</h4>
                                        <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a href="#rooms" className="btn-primary">
                            Explore Our Rooms
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
