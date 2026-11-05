import { useTranslations } from "next-intl";
const amenities = [
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* lucide waves-ladder: pool ladder over water */}
                <path d="M19 5a2 2 0 0 0-2 2v11" />
                <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M7 13h10" />
                <path d="M7 9h10" />
                <path d="M9 5a2 2 0 0 0-2 2v11" />
            </svg>
        ),
        key: "pools",
        slug: "swimming-pools",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
            </svg>
        ),
        key: "wifi",
        slug: "free-wi-fi",
    },
   /* {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        key: "breakfast",
        slug: "breakfast-included",
    },*/
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 3 20 16 16 11 16 8" />
                <circle cx="12" cy="20" r="2" />
                <circle cx="5" cy="20" r="2" />
            </svg>
        ),
        key: "tv",
        slug: "smart-tv",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        key: "security",
        slug: "24/7-security",
    },
    {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        ),
        key: "aircon",
        slug: "air-conditioning",
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
        key: "parking",
        slug: "parking",
    },
   /* {
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 00-6 0v4" />
                <rect x="5" y="9" width="14" height="12" rx="2" />
                <circle cx="12" cy="15" r="1" />
            </svg>
        ),
        key: "lock",
        slug: "digital-lock",
    },*/
];

export default function AmenitiesSection() {
    const t = useTranslations("Amenities");
    return (
        <section
            id="amenities"
            className="section"
            style={{ background: "var(--surface)" }}
        >
            <div className="wrap">
                <div className="text-center" data-reveal>
                    <p className="section-tag">{t("eyebrow")}</p>
                    <h2 className="section-title">
                        <span className="title-italic">{t("title1")}</span>
                        <span className="title-roman">{t("title2")}</span>
                    </h2>
                    <p className="section-description mx-auto mt-6">
                        {t("intro")}
                    </p>
                </div>

                <div className="amenity-grid mt-20" data-stagger>
                    {amenities.map((a) => (
                        <div key={a.key} className="amenity-card" id={`amenity-${a.slug}`}>
                            <div className="amenity-icon">{a.icon}</div>
                            <h3 className="amenity-title">{t(`${a.key}.title`)}</h3>
                            <p className="amenity-desc">{t(`${a.key}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
