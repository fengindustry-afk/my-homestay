const amenities = [
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-3.57.5-5C12.5 6 14 8 13.5 10c-.307 1.226-1.5 2-1.5 3a2.5 2.5 0 002.5 2.5" />
                <path d="M12 14.5V20" />
                <circle cx="12" cy="12" r="10" />
            </svg>
        ),
        title: "Swimming Pool",
        desc: "Relax in our stunning infinity pool with panoramic views",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
            </svg>
        ),
        title: "Free Wi-Fi",
        desc: "High-speed internet throughout the entire property",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        title: "Breakfast Included",
        desc: "Complimentary local & continental breakfast daily",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 3 20 16 16 11 16 8" />
                <circle cx="12" cy="20" r="2" />
                <circle cx="5" cy="20" r="2" />
            </svg>
        ),
        title: "Smart TV",
        desc: "55-inch Smart TVs with Netflix & streaming apps",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "24/7 Security",
        desc: "Round-the-clock security with CCTV monitoring",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        ),
        title: "Air Conditioning",
        desc: "Individual climate control in every room",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        title: "Parking",
        desc: "Free private parking space for every guest",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 00-6 0v4" />
                <rect x="5" y="9" width="14" height="12" rx="2" />
                <circle cx="12" cy="15" r="1" />
            </svg>
        ),
        title: "Digital Lock",
        desc: "Keyless entry with secure digital lock system",
    },
];

export default function AmenitiesSection() {
    return (
        <section
            id="amenities"
            className="section"
            style={{ background: "var(--surface)" }}
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 text-center">
                    <p className="section-tag">Amenities</p>
                    <h2
                        className="section-title"
                        style={{ maxWidth: 500, margin: "0 auto 16px" }}
                    >
                        Everything You{" "}
                        <span style={{ color: "var(--accent)" }}>Need</span>
                    </h2>
                    <p
                        className="section-description"
                        style={{ maxWidth: 520, margin: "0 auto" }}
                    >
                        We&apos;ve thought of every detail to make your stay perfect.
                        From premium amenities to thoughtful touches.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {amenities.map((a) => (
                        <div key={a.title} className="amenity-card" id={`amenity-${a.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            <div className="amenity-icon">{a.icon}</div>
                            <h3 className="amenity-title">{a.title}</h3>
                            <p className="amenity-desc">{a.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
