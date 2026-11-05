import Image from "next/image";
import { useTranslations } from "next-intl";

const images = [
    {
        src: "/images/content/gallery-h3.jpg",
        key: "units",
    },
    {
        src: "/images/content/gallery-h4.jpg",
        key: "dewan",
    },
    {
        src: "/images/content/gallery-event.jpg",
        key: "family",
    },
    {
        src: "/images/content/gallery-wedding.jpg",
        key: "weddings",
    },
    {
        src: "/images/content/gallery-pool3.jpg",
        key: "pools",
    },
];

export default function GallerySection() {
    const t = useTranslations("Gallery");
    return (
        <section id="gallery" className="section">
            <div className="wrap gallery-head" data-reveal>
                <div>
                    <p className="section-tag">{t("eyebrow")}</p>
                    <h2 className="section-title gallery-title">
                        <span className="title-italic">{t("title")}</span>
                    </h2>
                </div>
                <p className="section-description">
                    {t("intro")}
                </p>
            </div>

            {/* Full bleed. On phones it scrolls sideways, so it is a focusable,
                labelled region the keyboard can reach. */}
            <div
                className="gallery-strip"
                role="region"
                aria-label={t("regionLabel")}
                tabIndex={0}
                data-stagger
            >
                {images.map((img, i) => (
                    <figure key={img.src} className="gallery-item" id={`gallery-item-${i}`}>
                        <Image
                            src={img.src}
                            alt={t(`${img.key}.alt`)}
                            fill
                            // Sources are 4:5 crops, so the tile width sets the download size.
                            sizes="(max-width: 768px) 78vw, 30vw"
                            quality={85}
                        />
                        <figcaption className="gallery-caption">{t(`${img.key}.caption`)}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
