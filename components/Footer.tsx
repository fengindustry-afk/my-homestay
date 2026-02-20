export default function Footer() {
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
                                    background: "linear-gradient(135deg, #c8a97e, #b08d5b)",
                                    borderRadius: 8,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontWeight: 800, fontSize: "1rem",
                                }}
                            >
                                I
                            </div>
                            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                                Indahmorib
                            </span>
                        </div>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20 }}>
                            Your home away from home. Experience luxury, comfort, and Malaysian
                            hospitality at its <a href="/finest-touch" style={{ textDecoration: "none", color: "inherit" }}>finest</a>.
                        </p>
                        <div className="footer-social">
                            {["Fb", "Ig", "X", "Yt"].map((s) => (
                                <a key={s} href="#" aria-label={s}>{s}</a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="footer-title">Quick Links</h4>
                        {["Home", "About Us", "Our Rooms", "Amenities", "Gallery", "Contact"].map((l) => (
                            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "")}`} className="footer-link">{l}</a>
                        ))}
                    </div>

                    {/* Room Types */}
                    <div>
                        <h4 className="footer-title">Room Types</h4>
                        {["Deluxe Suite", "Standard Room", "Family Room", "Studio Loft", "Penthouse"].map((r) => (
                            <a key={r} href="#rooms" className="footer-link">{r}</a>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="footer-title">Contact Info</h4>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 8 }}>
                            Pt 704, Jalan Perdana 2 Indah Perdana, Kampung Endah<br />
                            Banting 42700,<br />
                            Selangor
                        </p>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                            +60 11-5757 2001<br />
                            indahmoribhomestay@gmail.com
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>&copy; 2026 Indahmorib Homestay. All rights reserved.</span>
                    <span>
                        <a href="#" className="footer-link" style={{ display: "inline", padding: 0 }}>Privacy</a>
                        {" · "}
                        <a href="#" className="footer-link" style={{ display: "inline", padding: 0 }}>Terms</a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
