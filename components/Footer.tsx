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
                        <a href="#home" className="footer-link">Home</a>
                        <a href="#rooms" className="footer-link">Our Homestays</a>
                        <a href="#amenities" className="footer-link">Amenities</a>
                        <a href="#gallery" className="footer-link">Gallery</a>
                        <a href="#contact" className="footer-link">Contact</a>
                    </div>

                    {/* Homestay Types */}
                    <div>
                        <h4 className="footer-title">Homestay Types</h4>
                        {["Bungalow Unit", "Studio Unit", "Family Room", "Holiday Home", "Tiny House", "Event Hall"].map((r) => (
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
                            +60 11-5504 3280<br />
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
