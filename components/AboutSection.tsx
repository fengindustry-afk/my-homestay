export default function AboutSection() {
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
            number: "4.9",
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
                                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
                                alt="Luxurious homestay room"
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
                                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
                                alt="Homestay pool area"
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
        </section>
    );
}
