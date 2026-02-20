export default function HeroSection() {
    return (
        <section id="home" className="hero-section">
            {/* Background Image */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "url('https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Pool%20Hm3.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Hero Content */}
            <div className="hero-content px-6">
                <p className="hero-subtitle animate-fade-up">Welcome to Indahmorib</p>
                <h1 className="hero-title animate-fade-up delay-100">
                    Find Your Perfect
                    <br />
                    <span style={{ color: "var(--accent-light)" }}>Home Away</span> From
                    Home
                </h1>
                <p className="hero-description animate-fade-up delay-200">
                    Experience the beauty of Malaysian hospitality with our handpicked
                    collection of stunning homestays. Comfort, luxury, and unforgettable
                    memories await.
                </p>
                <div
                    className="animate-fade-up delay-300"
                    style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
                >
                    <a href="#rooms" className="btn-primary">
                        Explore Rooms
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href="#about" className="btn-outline">
                        Learn More
                    </a>
                </div>
            </div>

            {/* Scroll indicator */}
            <div
                className="animate-fade-in delay-600"
                style={{
                    position: "absolute",
                    bottom: 40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <span
                    style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                    }}
                >
                    Scroll Down
                </span>
                <div
                    className="animate-float"
                    style={{
                        width: 24,
                        height: 40,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderRadius: 12,
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 8,
                    }}
                >
                    <div
                        style={{
                            width: 4,
                            height: 8,
                            background: "rgba(255,255,255,0.6)",
                            borderRadius: 2,
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
