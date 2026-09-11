"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scrolling, wired so GSAP and Lenis share one RAF loop.
 *
 * Two engines each running their own loop is the classic way to get janky
 * scroll-linked animation, so Lenis is driven off gsap.ticker rather than its
 * own autoRaf.
 *
 * Opted out entirely under prefers-reduced-motion: hijacked scrolling is a real
 * accessibility problem for people with vestibular disorders, so those users get
 * plain native scroll.
 */
export default function SmoothScroll() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            // Native scroll only. ScrollTrigger still drives reveals off it.
            document.documentElement.style.scrollBehavior = "auto";
            return;
        }

        const lenis = new Lenis({
            duration: 1.05,
            // Exponential ease-out: fast pickup, long settle.
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            // Touch devices already have good native inertia; smoothing it a
            // second time feels laggy and eats battery.
            syncTouch: false,
            anchors: { offset: -72 }, // clears the fixed navbar
            autoRaf: false,
            // Modals and any internally-scrolling pane keep native scroll.
            prevent: (node) =>
                node.hasAttribute?.("data-lenis-prevent") ||
                node.closest?.("[data-lenis-prevent]") !== null,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        // GSAP's lag smoothing fights a scroll engine; disable it.
        gsap.ticker.lagSmoothing(0);

        // Native smooth scroll is off now, so anything that asked for it would
        // hard-jump. Route those calls through Lenis instead.
        //
        // Only `behavior: "smooth"` is intercepted. Lenis writes its own
        // position via window.scrollTo({ behavior: "instant" }), so a blanket
        // patch here would swallow the engine's own updates and freeze it.
        const nativeScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions) {
            if (typeof arg === "object" && arg?.behavior === "smooth" && this instanceof HTMLElement) {
                lenis.scrollTo(this, { offset: -72 });
                return;
            }
            nativeScrollIntoView.call(this, arg as ScrollIntoViewOptions);
        };

        const nativeScrollTo = window.scrollTo.bind(window);
        window.scrollTo = ((...args: unknown[]) => {
            const opts = args[0];
            if (opts && typeof opts === "object" && (opts as ScrollToOptions).behavior === "smooth") {
                lenis.scrollTo((opts as ScrollToOptions).top ?? 0);
                return;
            }
            return (nativeScrollTo as (...a: unknown[]) => void)(...args);
        }) as typeof window.scrollTo;

        // Images and Supabase-fed cards land after mount and shift every
        // trigger below them.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        const settle = setTimeout(refresh, 600);

        return () => {
            clearTimeout(settle);
            window.removeEventListener("load", refresh);
            Element.prototype.scrollIntoView = nativeScrollIntoView;
            window.scrollTo = nativeScrollTo as typeof window.scrollTo;
            gsap.ticker.remove(tick);
            lenis.destroy();
        };
    }, []);

    return null;
}
