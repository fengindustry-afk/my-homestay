import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Room } from "@/components/RoomsSection";
import FaqSection, { type FaqKey } from "@/components/FaqSection";
import Footer from "@/components/Footer";
import LocaleSwitch from "@/components/LocaleSwitch";
import { isHall, localeAlternates, toJsonLd } from "@/lib/seo";
import { BUSINESS, SITE_URL, waLink } from "@/lib/site";

export type LandingKind = "familyDay" | "hall";

export const LANDING: Record<LandingKind, { path: string; image: string; faq: FaqKey[]; pick: (r: Room) => boolean }> = {
    familyDay: {
        path: "/family-day",
        image: "/images/content/pool3.jpg",
        faq: ["pool", "poolRules", "guests", "beach"],
        // Units with a pool or room for a big group; the hall has its own page.
        pick: (r) => !isHall(r) && (r.guests >= 10 || /pool|kolam/i.test(r.amenities ?? "")),
    },
    hall: {
        path: "/dewan-majlis-banting",
        image: "/images/content/event.jpg",
        faq: ["hall", "guests", "deposit", "location"],
        pick: (r) => isHall(r),
    },
};

export async function landingMetadata(kind: LandingKind, locale: "ms" | "en") {
    const t = await getTranslations({ locale, namespace: `Landing.${kind}` });
    const alternates = localeAlternates(LANDING[kind].path, locale);
    return {
        title: t("title"),
        description: t("description"),
        alternates,
        openGraph: { title: `${t("title")} | ${BUSINESS.name}`, description: t("description"), url: alternates.canonical, images: [LANDING[kind].image] },
    };
}

async function getRooms(): Promise<Room[]> {
    try {
        // Imported lazily, as on the home page: a missing env must not 500 the page.
        const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
        const { data } = await supabaseAdmin.from("rooms").select("*").order("id");
        return (data ?? []) as Room[];
    } catch {
        return [];
    }
}

export default async function LandingPage({ kind, locale }: { kind: LandingKind; locale: "ms" | "en" }) {
    const cfg = LANDING[kind];
    const t = await getTranslations({ locale, namespace: "Landing" });
    const tRooms = await getTranslations({ locale, namespace: "Rooms" });
    const rooms = (await getRooms()).filter(cfg.pick);
    const pageUrl = SITE_URL + localeAlternates(cfg.path, locale).canonical;
    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: t("home"), item: SITE_URL + (locale === "en" ? "/en" : "") },
            { "@type": "ListItem", position: 2, name: t(`${kind}.nav`), item: pageUrl },
        ],
    };
    const ask = waLink(`Hi ${BUSINESS.name}, saya nak tanya tentang ${t(`${kind}.wa`)} (dari website)`);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumb) }} />
            <div className="detail-page">
                <header className="detail-hero">
                    <div className="wrap">
                        {/* No navbar on this page, so the back link and the language switch lead it. */}
                        <div className="detail-bar">
                            <Link href="/" className="back-pill">
                                <ArrowLeft size={16} aria-hidden="true" />
                                {t("home")}
                            </Link>
                            <LocaleSwitch className="detail-locale" />
                        </div>
                        <div className="detail-hero-grid">
                            <div>
                                <p className="section-tag">{t(`${kind}.eyebrow`)}</p>
                                <h1 className="text-display detail-title detail-title-long">{t(`${kind}.h1`)}</h1>
                                <div className="detail-actions">
                                    <a href={ask} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                        {t("ask")}
                                    </a>
                                </div>
                            </div>
                            <div className="detail-hero-media photo-frame">
                                <Image src={cfg.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
                            </div>
                        </div>
                    </div>
                </header>

                <section className="detail-intro">
                    <div className="wrap">
                        <div className="detail-copy">
                            <p>{t(`${kind}.p1`)}</p>
                            <p>{t(`${kind}.p2`)}</p>
                        </div>
                    </div>
                </section>

                {rooms.length > 0 && (
                    <section className="section detail-amenities">
                        <div className="wrap">
                            <h2 className="section-title detail-section-head">
                                <span className="title-roman">{t("roomsTitle")}</span>
                            </h2>
                            <div className="room-grid">
                                {rooms.map((room) => (
                                    <article key={room.id} className="room-card">
                                        <div className="room-card-media">
                                            <Image
                                                src={room.image}
                                                alt={room.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="room-card-image"
                                            />
                                        </div>
                                        <div className="room-card-content">
                                            <div className="room-card-type">{room.type}</div>
                                            <h3 className="room-card-title">
                                                <Link href={`/homestay/${room.id}`} className="room-card-link">
                                                    {room.title}
                                                </Link>
                                            </h3>
                                            <div className="room-card-features">
                                                <span>{tRooms("sleeps", { count: room.guests })}</span>
                                                {!isHall(room) && <span>{tRooms("bedCount", { count: room.beds })}</span>}
                                            </div>
                                            <div className="room-card-divider" />
                                            <div className="room-card-footer">
                                                <div className="room-card-price">
                                                    {t("from", { price: room.price.toLocaleString("en-MY") })}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <FaqSection keys={cfg.faq} />
            </div>
            <Footer />
        </>
    );
}
