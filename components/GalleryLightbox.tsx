"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, REDUCED } from "@/lib/gsap";

export type GalleryImage = { src: string; alt: string; caption: string };

type Props = {
    images: GalleryImage[];
    index: number | null;
    onIndex: (next: number | null) => void;
};

/**
 * Native <dialog>: the browser supplies the focus trap, Escape handling,
 * inert page behind, and focus return to the thumbnail that opened it.
 */
export default function GalleryLightbox({ images, index, onIndex }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    // Open / close the native dialog to match state. Focus goes inside on open
    // so the arrow keys and Escape reach the dialog.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (index !== null && !dialog.open) {
            dialog.showModal();
            dialog.querySelector<HTMLButtonElement>(".gallery-lightbox-btn:last-child")?.focus();
        }
        if (index === null && dialog.open) dialog.close();
    }, [index]);

    // Short entrance on each change, skipped under reduced motion.
    useEffect(() => {
        if (index === null || !stageRef.current) return;
        if (window.matchMedia(REDUCED).matches) return;
        gsap.fromTo(
            stageRef.current,
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
        );
    }, [index]);

    const count = images.length;
    const step = (dir: 1 | -1) => {
        if (index === null) return;
        onIndex((index + dir + count) % count);
    };

    const current = index !== null ? images[index] : null;

    return (
        <dialog
            ref={dialogRef}
            className="gallery-lightbox"
            aria-label="Photo viewer"
            data-lenis-prevent
            onClose={() => onIndex(null)}
            onClick={(e) => {
                // Clicks on the backdrop (the dialog box itself) close it.
                if (e.target === dialogRef.current) onIndex(null);
            }}
            onKeyDown={(e) => {
                if (e.key === "ArrowRight") step(1);
                if (e.key === "ArrowLeft") step(-1);
            }}
        >
            {current && (
                <div className="gallery-lightbox-inner">
                    <div ref={stageRef} className="gallery-lightbox-stage">
                        <Image
                            key={current.src}
                            src={current.src}
                            alt={current.alt}
                            fill
                            sizes="90vw"
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                    <p className="gallery-lightbox-caption">
                        {current.caption}
                        <span> &nbsp;{index! + 1} / {count}</span>
                    </p>
                    <div className="gallery-lightbox-controls">
                        <button type="button" className="gallery-lightbox-btn" onClick={() => step(-1)}>
                            Previous photo
                        </button>
                        <button type="button" className="gallery-lightbox-btn" onClick={() => step(1)}>
                            Next photo
                        </button>
                        <button type="button" className="gallery-lightbox-btn" onClick={() => onIndex(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}
