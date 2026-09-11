"use client";

import { useEffect } from "react";

/**
 * Magnetic pull + click ripple for every button on the site.
 *
 * Delegated from the document rather than wrapped around each button: it costs
 * no call-site changes and it still catches buttons that mount later (the
 * Supabase-fed room cards, the booking modal) without any of them opting in.
 *
 * JS only feeds coordinates in as custom properties; CSS owns every visual.
 */
const SELECTOR = ".btn-primary, .btn-dark, .btn-outline, .search-btn, .btn-ghost, [data-lively]";

/** How far a button may drift toward the cursor, in px. */
const PULL = 5;

export default function ButtonFX() {
    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Magnetism is meaningless without a real pointer, and on touch it just
        // makes the tap target drift under the finger.
        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        let frame = 0;
        let pending: { el: HTMLElement; x: number; y: number } | null = null;
        let active: HTMLElement | null = null;

        const apply = () => {
            frame = 0;
            if (!pending) return;
            const { el, x, y } = pending;
            el.style.setProperty("--btn-x", `${x.toFixed(2)}px`);
            el.style.setProperty("--btn-y", `${y.toFixed(2)}px`);
        };

        const release = (el: HTMLElement) => {
            el.style.setProperty("--btn-x", "0px");
            el.style.setProperty("--btn-y", "0px");
        };

        const onPointerMove = (e: PointerEvent) => {
            const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;

            if (el !== active) {
                if (active) release(active);
                active = el;
            }
            if (!el) return;

            const rect = el.getBoundingClientRect();
            // Offset from centre, normalised to -1..1, then scaled.
            const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

            pending = { el, x: dx * PULL, y: dy * PULL };
            if (!frame) frame = requestAnimationFrame(apply);
        };

        // Ripple runs for reduced-motion users too: it is a short, local,
        // non-travelling feedback cue, not ambient decoration.
        const onPointerDown = (e: PointerEvent) => {
            const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            el.style.setProperty("--ripple-x", `${e.clientX - rect.left}px`);
            el.style.setProperty("--ripple-y", `${e.clientY - rect.top}px`);

            // Restart the animation even on a rapid second click.
            el.classList.remove("is-rippling");
            void el.offsetWidth;
            el.classList.add("is-rippling");
        };

        const onAnimationEnd = (e: AnimationEvent) => {
            if (e.animationName === "btn-ripple") {
                (e.target as HTMLElement).classList.remove("is-rippling");
            }
        };

        if (canHover && !reduced) {
            document.addEventListener("pointermove", onPointerMove, { passive: true });
        }
        document.addEventListener("pointerdown", onPointerDown, { passive: true });
        document.addEventListener("animationend", onAnimationEnd);

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("animationend", onAnimationEnd);
            if (active) release(active);
        };
    }, []);

    return null;
}
