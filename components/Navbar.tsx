"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const links = [
        { href: "#home", label: "Home" },
        { href: "#about", label: "About" },
        { href: "#rooms", label: "Homestays" },
        { href: "#amenities", label: "Amenities" },
        { href: "#gallery", label: "Gallery" },
        { href: "#contact", label: "Contact" },
    ];

    return (
        <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? "scrolled" : ""}`}
            role="navigation" aria-label="Main navigation">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 no-underline group">
                    <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
                        <span style={{
                            fontFamily: "var(--font-playfair), Georgia, serif",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: "#fff",
                        }}>I</span>
                    </div>
                    <span style={{
                        fontFamily: "var(--font-playfair), Georgia, serif",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "var(--primary)",
                        letterSpacing: "0.01em",
                    }}>
                        Indahmorib
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <a href="#rooms" className="btn-primary hidden md:inline-flex"
                        style={{ padding: "9px 20px", fontSize: "0.78rem" }}>
                        Book Now
                    </a>

                    {/* Mobile hamburger */}
                    <button
                        className="mobile-menu-toggle md:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                        <span style={{ opacity: menuOpen ? 0 : 1 }} />
                        <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 top-[65px] bg-black/20 md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true" />
                    <div id="mobile-menu"
                        className="absolute top-full left-0 right-0 bg-[var(--background)] border-t border-[var(--border)] shadow-lg md:hidden animate-fade-in"
                        style={{ padding: "20px 24px 24px" }}>
                        <div className="flex flex-col gap-1">
                            {links.map((link) => (
                                <a key={link.href} href={link.href}
                                    className="nav-link py-3 border-b border-[var(--border)] last:border-0"
                                    onClick={() => setMenuOpen(false)}>
                                    {link.label}
                                </a>
                            ))}
                            <a href="#rooms"
                                className="btn-primary mt-4 justify-center"
                                onClick={() => setMenuOpen(false)}>
                                Book Now
                            </a>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
