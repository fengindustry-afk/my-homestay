"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitch from "./LocaleSwitch";

const linkKeys = ["home", "about", "rooms", "amenities", "gallery", "contact"] as const;

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("Nav");
    const links = linkKeys.map((k) => ({ href: `#${k}`, label: t(k) }));

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            setScrolled(window.scrollY > 30);

            // Reading progress. Written straight to a transform rather than
            // through state so it doesn't re-render the nav on every frame.
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${ratio})`;
            }
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    // Escape closes the menu; body scroll locks while it's open.
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [menuOpen]);

    return (
        <nav
            className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled || menuOpen ? "scrolled" : ""}`}
            role="navigation"
            aria-label={t("mainNav")}
        >
            <div className="nav-bar wrap">
                <Link href="/" className="nav-wordmark">
                    Indah Morib
                </Link>

                <div className="nav-links">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="nav-end">
                    <LocaleSwitch />
                    {/* Hidden below md. Kept in a plain wrapper, not on the button itself, so the
                        .btn-primary rules can't override the display utilities. */}
                    <div className="hidden md:block">
                        <a href="#rooms" className="btn-primary">
                            {t("book")}
                        </a>
                    </div>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                        <span style={{ opacity: menuOpen ? 0 : 1 }} />
                        <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
                    </button>
                </div>
            </div>

            {/* Reading progress */}
            <div ref={progressRef} aria-hidden="true" className="nav-progress" style={{ transform: "scaleX(0)" }} />

            {/* Below xl: full-height sheet under the bar */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="mobile-menu absolute inset-x-0 top-full h-[calc(100dvh-4.5625rem)] overflow-y-auto xl:hidden"
                >
                    <div className="wrap flex flex-col pt-4 pb-10">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="mobile-menu-link"
                            >
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="#rooms"
                            className="btn-primary mt-8"
                            onClick={() => setMenuOpen(false)}
                        >
                            {t("book")}
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
