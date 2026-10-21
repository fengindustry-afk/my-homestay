const amenities = [
    {
        title: "Swimming Pools",
        desc: "Several pools on the compound, and some are covered for privacy",
    },
    {
        title: "Free Wi-Fi",
        desc: "High-speed internet throughout the entire property",
    },
    /* {
        title: "Breakfast Included",
        desc: "Complimentary local & continental breakfast daily",
    }, */
    {
        title: "Smart TV",
        desc: "55-inch Smart TVs with Netflix & streaming apps",
    },
    {
        title: "24/7 Security",
        desc: "Round-the-clock security with CCTV monitoring",
    },
    {
        title: "Air Conditioning",
        desc: "Individual climate control in every room",
    },
    {
        title: "Parking",
        desc: "Free private parking space for every guest",
    },
    /* {
        title: "Digital Lock",
        desc: "Keyless entry with secure digital lock system",
    }, */
];

export default function AmenitiesSection() {
    return (
        <section
            id="amenities"
            className="section"
            style={{ background: "var(--surface)" }}
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7" data-reveal>
                        <p className="section-tag">03 &nbsp;/&nbsp; Amenities</p>
                        <h2 className="section-title" data-split style={{ maxWidth: 560 }}>
                            Everything you <em style={{ color: "var(--accent)" }}>need</em>, already here
                        </h2>
                    </div>
                    <div className="lg:col-span-5" data-reveal data-reveal-delay="120">
                        <p className="section-description">
                            The details that decide whether a stay is comfortable or merely adequate.
                        </p>
                    </div>
                </div>

                <ol className="amenity-list" data-stagger>
                    {amenities.map((a, i) => (
                        <li key={a.title} className="amenity-item">
                            <span className="amenity-num" aria-hidden="true">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                                <h3 className="amenity-title">{a.title}</h3>
                                <p className="amenity-desc">{a.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
