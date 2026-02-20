const images = [
    {
        src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
        alt: "Luxurious pool villa",
    },
    {
        src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
        alt: "Modern living area",
    },
    {
        src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
        alt: "Elegant bathroom",
    },
    {
        src: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
        alt: "Cozy bedroom",
    },
    {
        src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        alt: "Property exterior",
    },
];

export default function GallerySection() {
    return (
        <section id="gallery" className="section">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 text-center">
                    <p className="section-tag">Gallery</p>
                    <h2
                        className="section-title"
                        style={{ maxWidth: 500, margin: "0 auto 16px" }}
                    >
                        A Glimpse of{" "}
                        <span style={{ color: "var(--accent)" }}>Indahmorib</span>
                    </h2>
                    <p
                        className="section-description"
                        style={{ maxWidth: 520, margin: "0 auto" }}
                    >
                        Take a visual tour of our beautifully curated spaces and
                        surroundings.
                    </p>
                </div>

                <div className="gallery-grid">
                    {images.map((img, i) => (
                        <div key={i} className="gallery-item" id={`gallery-item-${i}`}>
                            <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
