"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Bath, BedDouble, CheckCircle, ChefHat, Wifi, MonitorPlay, Car, Home } from "lucide-react";
import BookingModal from "@/components/BookingModal";
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
    const amenitiesList: string[] = room.amenities
        ? room.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [];

    const facts = [
        room.rooms != null && {
            icon: <Home size={24} />,
            title: `${room.rooms} ${room.rooms === 1 ? "Room" : "Rooms"}`,
        },
        room.beds != null && {
            icon: <BedDouble size={24} />,
            title: `${room.beds} ${room.beds === 1 ? "Bed" : "Beds"}`,
        },
        room.baths != null && {
            icon: <Bath size={24} />,
            title: `${room.baths} ${room.baths === 1 ? "Bath" : "Baths"}`,
        },
        room.guests != null && {
            icon: <User size={24} />,
            title: `Up to ${room.guests} guests`,
        },
    ].filter(Boolean) as { icon: React.ReactNode; title: string }[];

    const askLink = waLink(`Hi ${BUSINESS.name}, saya nak tanya tentang ${room.title} (dari website)`);

    return (
        <div className="detail-page">
            {/* Hero: full-bleed photograph with the title over a scrim. */}
            <header className="on-media detail-hero">
                <Image
                    src={mainImage}
                    alt={room.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="detail-hero-scrim" aria-hidden="true" />

                <Link href="/#rooms" className="back-pill">
                    <ArrowLeft size={15} />
                    All homestays
                </Link>

                <div className="detail-hero-copy">
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
                </div>
            </header>

            {/* Intro band: price and actions on the left, description on the right. */}
            <section className="detail-intro">
                <div className="wrap detail-intro-grid">
                    <div data-reveal>
                        <div className="detail-price">
                            RM{room.price}
                            <span>per night</span>
                        </div>
                        <div className="detail-actions">
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                                Book this homestay
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                            <a href={askLink} className="btn-outline" target="_blank" rel="noopener noreferrer">
                                Ask a question
                            </a>
                        </div>
                    </div>

                    {room.description && (
                        <p className="detail-description" data-reveal data-reveal-delay="120">
                            {room.description}
                        </p>
                    )}
                </div>
            </section>

            {/* Facts as circle icons. */}
            {facts.length > 0 && (
                <section className="detail-facts">
                    <div className="wrap detail-facts-grid" data-stagger>
                        {facts.map((item) => (
                            <div key={item.title} className="fact">
                                <div className="fact-circle">{item.icon}</div>
                                <h2 className="fact-title">{item.title}</h2>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Photo grid. */}
            {photos.length > 0 && (
                <section className="section">
                    <div className="wrap">
                        <div className="detail-section-head" data-reveal>
                            <p className="section-tag">Gallery</p>
                            <h2 className="section-title">
                                <span className="title-italic">A look inside</span>
                            </h2>
                        </div>

                        <div className="detail-photos" data-stagger>
                            {photos.map((p, i) => (
                                <div
                                    key={p}
                                    className={`detail-photo ${i === 0 || i === 3 ? "detail-photo-wide" : ""}`}
                                >
                                    <Image
                                        src={p}
                                        alt={`${room.title} di Morib, Banting, gambar ${i + 1}`}
                                        fill
                                        sizes="(max-width: 1024px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Amenities as bordered cards. */}
            {amenitiesList.length > 0 && (
                <section className="section detail-amenities">
                    <div className="wrap">
                        <div className="detail-section-head" data-reveal>
                            <p className="section-tag">Included</p>
                            <h2 className="section-title">
                                <span className="title-italic">What you get</span>
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

            {/* Closing: calm and centred. */}
            <section className="section detail-closing" data-reveal>
                <div className="wrap detail-closing-inner">
                    <h2 className="text-display detail-closing-title">
                        Ready to book <span className="title-em">{room.title}</span>?
                    </h2>
                    <div className="detail-actions detail-actions-centre">
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            Check availability
                        </button>
                        <a href={askLink} className="btn-outline" target="_blank" rel="noopener noreferrer">
                            Ask a question
                        </a>
                    </div>
                </div>
            </section>

            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} room={room} />
        </div>
    );
}
