import ShaderBackground from "./ShaderBackground";

const CONTACTS = [
    { label: "Phone", value: "+60 11-5757 2001", href: "tel:+601157572001" },
    { label: "Email", value: "indahmoribhomestay", href: "mailto:indahmoribhomestay@gmail.com" },
    { label: "Location", value: "Banting, Selangor", href: "https://maps.google.com/?q=Indah+Morib+Homestay+Banting+Selangor" },
];

export default function CTASection() {
    return (
        <section id="contact" className="cta-section on-media">
            {/* Second and last WebGL moment. Run hotter than the hero: there is
                no photograph competing with it here. */}
            <ShaderBackground intensity={1.5} className="absolute inset-0 z-0" />

            {/* Scrim keeps the copy legible over the brightest caustics. */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background:
                        "radial-gradient(ellipse at center, color-mix(in srgb, var(--background) 55%, transparent) 0%, color-mix(in srgb, var(--background) 88%, transparent) 75%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <p className="section-tag" style={{ justifyContent: "center" }} data-reveal>
                    06 &nbsp;/&nbsp; Ready when you are
                </p>

                <h2
                    className="text-display"
                    style={{
                        fontSize: "clamp(2.1rem, 5vw, 3.5rem)",
                        color: "var(--primary)",
                        marginBottom: 22,
                    }}
                    data-reveal
                    data-reveal-delay="100"
                >
                    Book your stay and let the day{" "}
                    <span style={{ color: "var(--accent)" }}>run itself</span>
                </h2>

                <p
                    className="mx-auto"
                    style={{
                        fontSize: "1.05rem",
                        color: "var(--text-muted)",
                        maxWidth: 520,
                        lineHeight: 1.8,
                        marginBottom: 40,
                    }}
                    data-reveal
                    data-reveal-delay="180"
                >
                    Message us directly for current rates, package pricing for large
                    groups, and event bookings.
                </p>

                <div
                    className="mb-14 flex flex-wrap justify-center gap-4"
                    data-reveal
                    data-reveal-delay="260"
                >
                    <a
                        href="https://wa.me/601157572001"
                        className="btn-primary"
                        id="whatsapp-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp us
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href="mailto:indahmoribhomestay@gmail.com" className="btn-outline" id="email-btn">
                        Email us
                    </a>
                </div>

                <div className="mx-auto grid gap-4 sm:grid-cols-3" style={{ maxWidth: 700 }} data-stagger>
                    {CONTACTS.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="contact-chip"
                        >
                            <span
                                style={{
                                    fontSize: "0.62rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.18em",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {item.label}
                            </span>
                            <span style={{ fontSize: "0.92rem", color: "var(--primary)", fontWeight: 600 }}>
                                {item.value}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
