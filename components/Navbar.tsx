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
    { href: "#testimonials", label: "Reviews" },
    { href: "#contact", label: "Contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeId, setActiveId] = useState("home");
    const progressRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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

            // Current section: the one crossing 45% of the viewport. Read from
            // live geometry, so pin spacers can't leave a stale position behind.
            const line = window.innerHeight * 0.45;
            for (const link of links) {
                const id = link.href.slice(1);
                const r = document.getElementById(id)?.getBoundingClientRect();
                if (r && r.top <= line && r.bottom >= line) setActiveId(id);
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

    // Mobile menu: focus moves in on open, Tab cycles inside, Escape closes,
    // and focus returns to the toggle on close. Body scroll locks while open.
    useEffect(() => {
        if (!menuOpen) return;

        const opener = toggleRef.current;
        menuRef.current?.querySelector<HTMLElement>("a")?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                return;
            }
            if (e.key !== "Tab" || !menuRef.current) return;

            const focusable = [
                ...(opener ? [opener] : []),
                ...menuRef.current.querySelectorAll<HTMLElement>("a, button"),
            ];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
            opener?.focus({ preventScroll: true });
        };
    }, [menuOpen]);

    return (
        <nav
            className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? "scrolled" : ""}`}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5 no-underline group">
                    <span
                        className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:rotate-[8deg]"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                color: "var(--accent-contrast)",
                            }}
                        >
                            I
                        </span>
                    </span>
                    <span
                        style={{
                            fontFamily: "var(--font-playfair), Georgia, serif",
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            color: "var(--primary)",
                        }}
                    >
                        Indahmorib
                    </span>
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    {links.map((link) => {
                        const current = activeId === link.href.slice(1);
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`nav-link${current ? " is-active" : ""}`}
                                aria-current={current ? "location" : undefined}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <a
                        href="#rooms"
                        className="btn-primary hidden md:inline-flex"
                        style={{ padding: "11px 22px", fontSize: "0.72rem" }}
                    >
                        Book Now
                    </a>

                    <button
                        ref={toggleRef}
                        className="mobile-menu-toggle md:hidden"
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

            {/* Mobile: full-screen overlay, links entering in sequence */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    ref={menuRef}
                    className="fixed inset-0 top-[69px] md:hidden animate-fade-in"
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
