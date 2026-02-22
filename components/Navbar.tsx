"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "#home", label: "Home" },
        { href: "#about", label: "About" },
        { href: "#rooms", label: "Rooms" },
        { href: "#amenities", label: "Amenities" },
        { href: "#gallery", label: "Gallery" },
        { href: "#contact", label: "Contact" },
    ];

    return (
        <nav
            className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? "scrolled" : ""}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            background: "linear-gradient(135deg, #c8a97e, #b08d5b)",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            fontFamily: "var(--font-playfair), Georgia, serif",
                        }}
                    >
                        I
                    </div>
                    <span
                        style={{
                            fontSize: "1.35rem",
                            fontWeight: 700,
                            color: "var(--primary)",
                            fontFamily: "var(--font-playfair), Georgia, serif",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Indahmorib
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="nav-links hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA + mobile toggle */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <a
                        href="#rooms"
                        className="btn-primary hidden md:inline-flex"
                        style={{ padding: "10px 24px", fontSize: "0.82rem" }}
                    >
                        Book Now
                    </a>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span
                            style={{
                                transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                            }}
                        />
                        <span style={{ opacity: menuOpen ? 0 : 1 }} />
                        <span
                            style={{
                                transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                            }}
                        />
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="nav-links open">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="#rooms"
                            className="btn-primary"
                            style={{ textAlign: "center", justifyContent: "center" }}
                            onClick={() => setMenuOpen(false)}
                        >
                            Book Now
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
}
