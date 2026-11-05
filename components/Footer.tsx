import { BUSINESS } from "@/lib/site";

// Absolute so they also work from pages other than the homepage.
const QUICK_LINKS = [
    ["/#home", "Home"],
    ["/#rooms", "Our Homestays"],
    ["/#amenities", "Amenities"],
    ["/#gallery", "Gallery"],
    ["/#contact", "Contact"],
] as const;

export default function Footer() {
    const { address } = BUSINESS;
    return (
        <footer className="footer">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div
                                style={{
                                    width: 36, height: 36,
                                    background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                                    borderRadius: "var(--radius-sm)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--accent-contrast)",
                                    fontFamily: "var(--font-playfair), Georgia, serif",
                                    fontWeight: 700, fontSize: "1rem",
                                }}
                            >
                                I
                            </div>
                            <span
                                style={{
                                    fontFamily: "var(--font-playfair), Georgia, serif",
                                    fontSize: "1.2rem",
                                    fontWeight: 600,
                                    color: "var(--primary)",
                                }}
                            >
                                {BUSINESS.name}
                            </span>
                        </div>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20 }}>
                            Your home away from home. Experience luxury, comfort, and Malaysian
                            hospitality at its <a href="/finest-touch" style={{ textDecoration: "none", color: "inherit" }}>finest</a>.
                        </p>
                        <div className="footer-social">
                            <a href="https://facebook.com/indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Fb</a>
                        </div>
                    </div>
                    {/*<a href="https://instagram.com/indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Ig</a>
                    //<a href="https://x.com/indahmorib" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
                    //<a href="https://youtube.com/@indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="YouTube">Yt</a>
                    */}

                    {/* Quick Links */}
                    <div>
                        <h4 className="footer-title">Quick Links</h4>
                        {QUICK_LINKS.map(([href, label]) => (
                            // Plain <a>, not next/link: Lenis smooth-scrolls same-page anchors with the navbar offset.
                            <a key={href} href={href} className="footer-link">{label}</a>
                        ))}
                    </div>

                    {/* Homestay Types */}
                    <div>
                        <h4 className="footer-title">Homestay Types</h4>
                        {["Bungalow Unit", "Studio Unit", "Family Room", "Holiday Home", "Tiny House", "Event Hall"].map((r) => (
                            <span key={r} className="footer-link" style={{ cursor: "default" }}>{r}</span>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="footer-title">Contact Info</h4>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 8 }}>
                            {address.street}<br />
                            {address.locality} {address.postalCode},<br />
                            {address.region}
                        </p>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                            {BUSINESS.phones.map((p) => (
                                <span key={p}>{p}<br /></span>
                            ))}
                            {BUSINESS.email}
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>&copy; 2026 {BUSINESS.name}. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
