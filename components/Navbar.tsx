"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const links = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#rooms", label: "Homestays" },
    { href: "#amenities", label: "Amenities" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
];

// Split across the wordmark on wide screens: three links each side.
const leftLinks = links.slice(0, 3);
const rightLinks = links.slice(3);

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

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

    // Transparent over the hero, solid once the page scrolls or the menu opens.
    const solid = scrolled || menuOpen;

    return (
        <nav
            className={`nav-glass fixed top-0 left-0 right-0 z-50 ${solid ? "scrolled" : "on-media"}`}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="nav-bar wrap py-4">
                <div className="nav-links nav-links-start">
                    {leftLinks.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                <Link href="/" className="nav-wordmark">
                    Indah Morib
                </Link>

                <div className="nav-end">
                    <div className="nav-links">
                        {rightLinks.map((link) => (
                            <a key={link.href} href={link.href} className="nav-link">
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <ThemeToggle />
                    {/* Hidden below md. Kept in a plain wrapper, not on the button itself, so the
                        .btn-primary rules can't override the display utilities. */}
                    <div className="hidden md:block">
                        <a href="#rooms" className="btn-primary">
                            Book Now
                        </a>
                    </div>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
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
            <div
                ref={progressRef}
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-full origin-left"
                style={{ background: "var(--accent)", transform: "scaleX(0)" }}
            />

            {/* Below lg: full-height overlay under the bar, links entering in sequence */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="absolute inset-x-0 top-full h-[calc(100dvh-4.75rem)] overflow-y-auto lg:hidden animate-fade-in"
                    style={{ background: "var(--background)" }}
                >
                    <div className="flex flex-col px-8 pt-10">
                        {links.map((link, i) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="animate-fade-up border-b border-[var(--border)] py-5 no-underline"
                                style={{
                                    animationDelay: `${0.05 + i * 0.05}s`,
                                    fontFamily: "var(--font-playfair), Georgia, serif",
                                    fontSize: "1.75rem",
                                    color: "var(--primary)",
                                }}
                            >
                                <span
                                    className="mr-4 align-middle"
                                    style={{
                                        fontFamily: "var(--font-geist-sans)",
                                        fontSize: "0.65rem",
                                        color: "var(--accent)",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    0{i + 1}
                                </span>
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="#rooms"
                            className="btn-primary mt-10 justify-center animate-fade-up"
                            style={{ animationDelay: "0.4s" }}
                            onClick={() => setMenuOpen(false)}
                        >
                            Book Now
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
