import Image from "next/image";

const images = [
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H3.jpg",
        alt: "Interior of a homestay unit at Indah Morib",
        caption: "The units",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H4.jpg",
        alt: "The dewan (multipurpose hall) at Indah Morib",
        caption: "The dewan",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Event.jpg",
        alt: "Hall set up for a family event",
        caption: "Family days",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Wdding.jpg",
        alt: "Wedding reception held at the compound",
        caption: "Weddings",
    },
    {
        src: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Pool3.jpg",
        alt: "Private pool area at the homestay",
        caption: "The pools",
    },
];

export default function GallerySection() {
    return (
        <section id="gallery" className="section">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7" data-reveal>
                        <p className="section-tag">04 &nbsp;/&nbsp; Gallery</p>
                        <h2 className="section-title" style={{ maxWidth: 560 }}>
                            A glimpse of <em style={{ color: "var(--accent)" }}>Indahmorib</em>
                        </h2>
                    </div>
                    <div className="lg:col-span-5" data-reveal data-reveal-delay="120">
                        <p className="section-description">
                            The grounds, the halls, and the water. Photographed as they are.
                        </p>
                    </div>
                </div>

                <div className="gallery-grid" data-stagger>
                    {images.map((img, i) => (
                        <div key={img.src} className="gallery-item" id={`gallery-item-${i}`}>
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                            />
                            <span className="gallery-caption">{img.caption}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
