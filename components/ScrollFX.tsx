"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Attribute-driven scroll choreography. One controller for the whole site;
 * sections declare motion in markup instead of nesting wrapper components.
 *
 *   data-reveal            fade + lift in on enter
 *   data-reveal="left"     ...from the left   (also: right, scale, mask)
 *   data-reveal-delay="200"  ms
 *   data-stagger           children of this element come in in sequence
 *   data-parallax="0.2"    drift against scroll; higher = further "back"
 *
 * Elements are marked once initialised, and a debounced MutationObserver picks
 * up anything that mounts later — the room cards arrive from Supabase well
 * after this runs, and would otherwise sit invisible forever.
 */

const FROM: Record<string, gsap.TweenVars> = {
    up: { opacity: 0, y: 34 },
    left: { opacity: 0, x: -44 },
    right: { opacity: 0, x: 44 },
    scale: { opacity: 0, scale: 0.94 },
    // Wipes up from behind its own edge. Used for headline lines.
    mask: { opacity: 0, yPercent: 110 },
};

const READY = "data-fx-ready";

export default function ScrollFX() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduced) {
            // Nothing hides content by default in CSS, so there is nothing to
            // undo — just skip the animation and let ScrollFX be inert.
            return;
        }

        const init = (root: ParentNode) => {
            // Reveals
            root.querySelectorAll<HTMLElement>(`[data-reveal]:not([${READY}])`).forEach((el) => {
                el.setAttribute(READY, "");
                const kind = el.dataset.reveal || "up";
                const delay = Number(el.dataset.revealDelay || 0) / 1000;

                gsap.from(el, {
                    ...(FROM[kind] || FROM.up),
                    duration: 0.9,
                    delay,
                    ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
            });

            // Staggered groups
            root.querySelectorAll<HTMLElement>(`[data-stagger]:not([${READY}])`).forEach((el) => {
                el.setAttribute(READY, "");
                const children = Array.from(el.children) as HTMLElement[];
                if (!children.length) return;

                gsap.from(children, {
                    opacity: 0,
                    y: 40,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.09,
                    scrollTrigger: { trigger: el, start: "top 85%", once: true },
                });
            });

            // Parallax
            root.querySelectorAll<HTMLElement>(`[data-parallax]:not([${READY}])`).forEach((el) => {
                el.setAttribute(READY, "");
                const strength = Number(el.dataset.parallax || 0.2);

                gsap.to(el, {
                    yPercent: -strength * 100,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el.parentElement || el,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            });
        };

        const ctx = gsap.context(() => init(document));

        // Fail open.
        //
        // gsap.from() hides these elements the moment it runs and only restores
        // them when their trigger fires. If the ticker never runs — a throttled
        // background tab that gets restored, a thrown error, an rAF-starved
        // low-end device — anything already hidden would stay hidden for good.
        // On a booking site that means invisible room listings, so sweep for
        // anything on screen and still transparent, and hand it back.
        const STUCK = "data-fx-stuck";
        const watchdog = window.setInterval(() => {
            const pending = document.querySelectorAll<HTMLElement>(
                `[${READY}][data-reveal], [${READY}][data-stagger] > *`
            );
            pending.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
                const hidden = onScreen && Number(getComputedStyle(el).opacity) === 0;

                if (!hidden) {
                    el.removeAttribute(STUCK);
                    return;
                }
                // Only act on the second consecutive sighting. A tween that has
                // just started is legitimately at opacity 0 for a frame, and
                // clearing its props mid-flight would make it flicker.
                if (el.hasAttribute(STUCK)) {
                    gsap.set(el, { clearProps: "all" });
                    el.removeAttribute(STUCK);
                } else {
                    el.setAttribute(STUCK, "");
                }
            });
        }, 2500);

        // Late-mounting content (Supabase rooms, gallery images).
        let debounce = 0;
        const observer = new MutationObserver(() => {
            clearTimeout(debounce);
            debounce = window.setTimeout(() => {
                ctx.add(() => init(document));
                ScrollTrigger.refresh();
            }, 120);
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            clearTimeout(debounce);
            clearInterval(watchdog);
            observer.disconnect();
            ctx.revert();
        };
    }, []);

    return null;
}
