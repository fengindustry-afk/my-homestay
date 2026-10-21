"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, MOTION_OK, useGSAP } from "@/lib/gsap";
import GalleryLightbox, { type GalleryImage } from "./GalleryLightbox";

const images: GalleryImage[] = [
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
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const [active, setActive] = useState<number | null>(null);

    // Desktop with motion allowed: the grid becomes a track that is pinned
    // while the user scrolls vertically. Everywhere else the CSS grid stands.
    useGSAP(
        () => {
            const section = sectionRef.current;
            const track = trackRef.current;
            if (!section || !track) return;

            const mm = gsap.matchMedia();
            mm.add(`(min-width: 1025px) and ${MOTION_OK}`, () => {
                section.classList.add("gallery-pinned");
                const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

                const tween = gsap.to(track, {
                    x: () => -distance(),
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        pin: true,
                        scrub: 0.6,
                        start: "top top",
                        end: () => `+=${distance()}`,
                        invalidateOnRefresh: true,
                        anticipatePin: 1,
                        refreshPriority: -1,
                        onUpdate: (self) => {
                            if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress });
                        },
                    },
                });

                return () => {
                    tween.scrollTrigger?.kill();
                    tween.kill();
                    gsap.set(track, { clearProps: "transform" });
                    section.classList.remove("gallery-pinned");
                };
            });

            // Images load after mount and change the track width; re-measure.
            const onLoad = () => ScrollTrigger.refresh();
            track.addEventListener("load", onLoad, true);

            return () => {
                track.removeEventListener("load", onLoad, true);
                mm.revert();
            };
        },
        { scope: sectionRef }
    );

    return (
        <section id="gallery" className="section gallery-section" ref={sectionRef}>
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

                <div className="gallery-track" ref={trackRef}>
                    <div className="gallery-grid" data-stagger>
                        {images.map((img, i) => (
                            <button
                                type="button"
                                key={img.src}
                                className="gallery-item"
                                onClick={() => setActive(i)}
                                aria-label={`Open photo: ${img.caption}`}
                            >
                                <Image
                                    src={img.src}
                                    alt=""
                                    fill
                                    sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                                />
                                <span className="gallery-caption">{img.caption}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="gallery-progress" aria-hidden="true">
                    <span ref={barRef} />
                </div>
            </div>

            <GalleryLightbox images={images} index={active} onIndex={setActive} />
        </section>
    );
}
