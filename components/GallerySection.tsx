import Image from "next/image";

const images = [
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H3.jpg",
        alt: "Interior of a homestay unit at Indah Morib",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H4.jpg",
        alt: "The dewan (multipurpose hall) at Indah Morib",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Event.jpg",
        alt: "Hall set up for a family event",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Wdding.jpg",
        alt: "Wedding reception held at the compound",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Pool3.jpg",
        alt: "Private pool area at the homestay",
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
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
