import Image from "next/image";

const images = [
    {
        src: "/images/content/h3.jpg",
        alt: "Interior of a homestay unit at Indah Morib",
        caption: "The units",
    },
    {
        src: "/images/content/h4.jpg",
        alt: "The dewan (multipurpose hall) at Indah Morib",
        caption: "The dewan",
    },
    {
        src: "/images/content/event.jpg",
        alt: "Hall set up for a family event",
        caption: "Family days",
    },
    {
        src: "/images/content/wedding.jpg",
        alt: "Wedding reception held at the compound",
        caption: "Weddings",
    },
    {
        src: "/images/content/pool3.jpg",
        alt: "Private pool area at the homestay",
        caption: "The pools",
    },
];

export default function GallerySection() {
    return (
        <section id="gallery" className="section">
            <div className="wrap gallery-head" data-reveal>
                <div>
                    <p className="section-tag">Gallery</p>
                    <h2 className="section-title gallery-title">
                        <span className="title-italic">A glimpse of Indah Morib</span>
                    </h2>
                </div>
                <p className="section-description">
                    The grounds, the halls, and the water. Photographed as they are.
                </p>
            </div>

            {/* Full bleed. On phones it scrolls sideways, so it is a focusable,
                labelled region the keyboard can reach. */}
            <div
                className="gallery-strip"
                role="region"
                aria-label="Photos of Indah Morib"
                tabIndex={0}
                data-stagger
            >
                {images.map((img, i) => (
                    <figure key={img.src} className="gallery-item" id={`gallery-item-${i}`}>
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="(max-width: 768px) 78vw, 20vw"
                        />
                        <figcaption className="gallery-caption">{img.caption}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
