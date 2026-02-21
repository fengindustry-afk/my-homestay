const images = [
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H3.jpg",
        alt: "Homestay 3",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H4.jpg",
        alt: "Dewan",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Event.jpg",
        alt: "Event",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Wdding.jpg",
        alt: "Wedding",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Pool3.jpg",
        alt: "Pool H3",
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
