import Image from "next/image";

export default function HeroSection() {
    return (
        <section id="home" className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
            {/* Left: full-bleed photo — no overlay darkening */}
            <div className="relative w-full lg:w-1/2 min-h-[55vh] lg:min-h-screen flex-shrink-0">
                <Image
                    src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Pool%20Hm3.png"
                    alt="The compound pool at Indah Morib Homestay, Selangor"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Subtle left-edge fade on desktop only — helps text panel legibility */}
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent hidden lg:block" />
            </div>

            {/* Right: editorial text panel */}
            <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-14 lg:px-16 xl:px-20 py-20 lg:py-0 bg-[var(--background)]">
                {/* Eyebrow */}
                <p className="hero-subtitle animate-fade-up mb-6">
                    Morib, Selangor
                </p>

                {/* Display headline — Playfair italic */}
                <h1 className="text-display animate-fade-up delay-100 text-[var(--primary)] mb-6"
                    style={{ fontSize: "clamp(2.75rem, 5.5vw, 5rem)" }}>
                    Where family<br />
                    gathers, and<br />
                    the day unwinds.
                </h1>

                <p className="animate-fade-up delay-200 text-[var(--text-muted)] mb-10 leading-relaxed"
                    style={{ fontSize: "1.05rem", maxWidth: 380 }}>
                    A riverside compound for family retreats, gatherings, and celebrations —
                    an hour from Kuala Lumpur, a world away from the everyday.
                </p>

                <div className="animate-fade-up delay-300 flex flex-wrap gap-3 mb-12">
                    <a href="#rooms" className="btn-primary">
                        View Homestays
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href="https://wa.me/601157572001" className="btn-dark" target="_blank" rel="noopener noreferrer">
                        WhatsApp Us
                    </a>
                </div>

                {/* Trust signals */}
                <div className="animate-fade-up delay-400 flex flex-wrap items-center gap-x-6 gap-y-3">
                    {[
                        "Muslim-friendly",
                        "Private pools",
                        "Up to 120 guests",
                    ].map((item) => (
                        <span key={item} className="flex items-center gap-2 text-[var(--text-muted)]"
                            style={{ fontSize: "0.8125rem" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
