"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, User, Bath, BedDouble, CheckCircle, ChefHat, Wifi, MonitorPlay, Car, Home } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import LocaleSwitch from "@/components/LocaleSwitch";
import type { Room } from "@/components/RoomsSection";
import { BUSINESS, waLink } from "@/lib/site";

/** Maps a free-text amenity to the closest icon in the set. */
function amenityIcon(amenity: string) {
    const a = amenity.toLowerCase();
    if (a.includes("kitchen")) return <ChefHat size={22} />;
    if (a.includes("wifi")) return <Wifi size={22} />;
    if (a.includes("tv")) return <MonitorPlay size={22} />;
    if (a.includes("parking")) return <Car size={22} />;
    if (a.includes("pool") || a.includes("bath")) return <Bath size={22} />;
    return <CheckCircle size={22} />;
}

export default function RoomDetail({ room, photos }: { room: Room; photos: string[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mainImage = room.image || photos[0] || "/placeholder.jpg";
    const t = useTranslations("Room");
    const tRooms = useTranslations("Rooms");
    const amenitiesList: string[] = room.amenities
        ? room.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [];

    const facts = [
        room.rooms != null && {
            icon: <Home size={24} />,
            title: tRooms("roomCount", { count: room.rooms }),
        },
        room.beds != null && {
            icon: <BedDouble size={24} />,
            title: tRooms("bedCount", { count: room.beds }),
        },
        room.baths != null && {
            icon: <Bath size={24} />,
            title: tRooms("bathCount", { count: room.baths }),
        },
        room.guests != null && {
            icon: <User size={24} />,
            title: t("upToGuests", { count: room.guests }),
        },
    ].filter(Boolean) as { icon: React.ReactNode; title: string }[];

    const askLink = waLink(`Hi ${BUSINESS.name}, saya nak tanya tentang ${room.title} (dari website)`);

    return (
        <div className="detail-page">
            {/* Hero: the title, the price and both actions beside the photograph. */}
            <header className="detail-hero">
                <div className="wrap">
                    {/* The room page has no navbar, so the back link and the language switch lead it. */}
                    <div className="detail-bar">
                        <Link href="/#rooms" className="back-pill">
                            <ArrowLeft size={16} aria-hidden="true" />
                            {t("back")}
                        </Link>
                        <LocaleSwitch className="detail-locale" />
                    </div>

                    <div className="detail-hero-grid">
                        <div>
                            <p className="section-tag" lang="ms">
                                {room.type?.trim() || "Homestay"} di Morib, Banting
                            </p>

                            <h1 className="text-display detail-title">
                                <span className="title-italic">{room.title}</span>
                            </h1>

                            {room.location && (
                                <p className="detail-location">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {room.location}
                                </p>
                            )}

                            <div className="detail-price">
                                RM{room.price}
                                <span>{t("perNight")}</span>
                            </div>
                            <div className="detail-actions">
                                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                                    {t("book")}
                                </button>
                                <a href={askLink} className="btn-outline" target="_blank" rel="noopener noreferrer">
                                    {t("ask")}
                                </a>
                            </div>
                        </div>

                        <div className="detail-hero-media photo-frame">
                            <Image
                                src={mainImage}
                                alt={room.title}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 58vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {room.description && (
                <section className="detail-intro">
                    <div className="wrap">
                        <p className="detail-description" data-reveal>
                            {room.description}
                        </p>
                    </div>
                </section>
            )}

            {/* Facts in a well. */}
            {facts.length > 0 && (
                <section className="detail-facts">
                    <div className="wrap">
                        <div className="detail-facts-grid" data-stagger>
                            {facts.map((item) => (
                                <div key={item.title} className="fact">
                                    <div className="fact-circle">{item.icon}</div>
                                    <h2 className="fact-title">{item.title}</h2>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Photo grid. */}
            {photos.length > 0 && (
                <section className="section">
                    <div className="wrap">
                        <div className="detail-section-head" data-reveal>
                            <p className="section-tag">{t("galleryEyebrow")}</p>
                            <h2 className="section-title">
                                <span className="title-italic">{t("galleryTitle")}</span>
                            </h2>
                        </div>

                        <div className="detail-photos" data-stagger>
                            {photos.map((p, i) => {
                                const wide = i === 0 || (i === 3 && photos.length >= 6);
                                // Odd count of half-width tiles on phones: the last one fills its row.
                                const fill = !wide && i === photos.length - 1
                                    && (photos.length - (photos.length >= 6 ? 2 : 1)) % 2 === 1;
                                return (
                                <div
                                    key={p}
                                    className={`detail-photo ${wide ? "detail-photo-wide" : ""} ${fill ? "detail-photo-fill" : ""}`}
                                >
                                    <Image
                                        src={p}
                                        alt={`${room.title} di Morib, Banting, gambar ${i + 1}`}
                                        fill
                                        sizes={wide ? "(max-width: 1024px) 100vw, 66vw" : fill ? "(max-width: 1024px) 100vw, 33vw" : "(max-width: 1024px) 50vw, 33vw"}
                                        className="object-cover"
                                    />
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Amenities as a ruled list. */}
            {amenitiesList.length > 0 && (
                <section className="section detail-amenities">
                    <div className="wrap">
                        <div className="detail-section-head" data-reveal>
                            <p className="section-tag">{t("includedEyebrow")}</p>
                            <h2 className="section-title">
                                <span className="title-italic">{t("includedTitle")}</span>
                            </h2>
                        </div>

                        <div className="detail-amenity-grid" data-stagger>
                            {amenitiesList.map((amenity) => (
                                <div key={amenity} className="detail-amenity">
                                    <div className="detail-amenity-icon">{amenityIcon(amenity)}</div>
                                    <h3 className="detail-amenity-title">{amenity}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Closing: the question on the left, both actions on the right. */}
            <section className="section detail-closing" data-reveal>
                <div className="wrap detail-closing-inner">
                    <h2 className="text-display detail-closing-title">
                        {t.rich("closing", { title: room.title, em: (c) => <span className="title-em">{c}</span> })}
                    </h2>
                    <div className="detail-actions">
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            {t("check")}
                        </button>
                        <a href={askLink} className="btn-outline" target="_blank" rel="noopener noreferrer">
                            {t("ask")}
                        </a>
                    </div>
                </div>
            </section>

            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} room={room} />
        </div>
    );
}
