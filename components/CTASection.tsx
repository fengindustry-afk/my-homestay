export default function CTASection() {
    return (
        <section id="contact" className="cta-section">
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "url('https://lh3.googleusercontent.com/p/AF1QipPty9u5kMCQPo75CtQRG4mg0zScwNdeW3BrLSRD=s1024-v1')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <div
                className="mx-auto max-w-4xl px-6 text-center"
                style={{ position: "relative", zIndex: 2 }}
            >
                <p className="section-tag" style={{ color: "var(--accent-light)" }}>
                    Ready to Experience Indahmorib?
                </p>
                <h2
                    style={{
                        fontSize: "clamp(2rem, 5vw, 3.2rem)",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.2,
                        marginBottom: 20,
                    }}
                >
                    Book Your Stay Today &amp; Create{" "}
                    <span style={{ color: "var(--accent-light)" }}>
                        Unforgettable Memories
                    </span>
                </h2>
                <p
                    style={{
                        fontSize: "1.1rem",
                        color: "rgba(255,255,255,0.75)",
                        maxWidth: 520,
                        margin: "0 auto 36px",
                        lineHeight: 1.7,
                    }}
                >
                    Contact us directly for the best rates, special packages, and
                    personalised assistance.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
                    <a href="https://wa.me/601157572001" className="btn-primary" id="whatsapp-btn">
                        WhatsApp Us
                    </a>
                    <a href="mailto:indahmoribhomestay@gmail.com" className="btn-outline" id="email-btn">
                        Email Us
                    </a>
                </div>
                <div className="grid gap-6 sm:grid-cols-3" style={{ maxWidth: 700, margin: "0 auto" }}>
                    {[
                        { label: "Phone", value: "+60 11-5757 2001" },
                        { label: "Email", value: "indahmoribhomestay" },
                        { label: "Location", value: "Selangor, MY" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "var(--radius-md)",
                                padding: "20px 16px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: "0.95rem", color: "#fff", fontWeight: 600 }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
