import Image from "next/image";
import ShaderBackground from "./ShaderBackground";

const HEADLINE = ["Where family", "gathers, and", "the day unwinds."];

const TRUST = ["Muslim-friendly", "Private pools", "Up to 120 guests"];

export default function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden"
        >
            {/* Caustic WebGL field behind the whole hero. */}
            <ShaderBackground intensity={1} className="absolute inset-0 z-0" />

            {/* Left: editorial text panel */}
            <div className="hero-copy relative z-20 w-full lg:w-[52%] flex flex-col justify-center px-8 md:px-14 lg:px-16 xl:px-24 py-28 lg:py-0">
                <p className="hero-subtitle animate-fade-up">Morib, Selangor</p>

                {/* data-split="load": SplitText rises each line on mount. */}
                <h1
                    className="text-display text-[var(--primary)] mb-7"
                    data-split="load"
                    style={{ fontSize: "clamp(2.75rem, 5vw, 4.5rem)" }}
                >
                    {HEADLINE.map((line, i) => (
                        <span key={line}>
                            {line}
                            {i < HEADLINE.length - 1 && <br />}
                        </span>
                    ))}
                </h1>

                <p
                    className="animate-fade-up delay-500 text-[var(--text-muted)] mb-10 leading-relaxed"
                    style={{ fontSize: "1.05rem", maxWidth: 400 }}
                >
                    A riverside compound for family retreats, gatherings, and celebrations.
                    An hour from Kuala Lumpur, a world away from the everyday.
                </p>

                <div className="animate-fade-up delay-600 flex flex-wrap gap-3 mb-14">
                    <a href="#rooms" className="btn-primary">
                        View Homestays
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a
                        href="https://wa.me/601157572001"
                        className="btn-outline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp Us
                    </a>
                </div>

                <div className="animate-fade-up delay-600 flex flex-wrap items-center gap-x-7 gap-y-3">
                    {TRUST.map((item) => (
                        <span
                            key={item}
                            className="flex items-center gap-2 text-[var(--text-muted)]"
                            style={{ fontSize: "0.8125rem" }}
                        >
                            {/* Muted, not gold: these are separators. Keeping the
                                accent for the eyebrow and the primary action stops
                                it from becoming wallpaper. */}
                            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] flex-shrink-0" />
                            {item}
                        </span>
                    ))}
                </div>

                {/* Scroll affordance — desktop only, where the fold is real. */}
                <div className="hidden lg:flex items-center gap-4 mt-20 animate-fade-in delay-600">
                    <span className="scroll-hint" aria-hidden="true" />
                    <span
                        className="text-[var(--text-muted)]"
                        style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                    >
                        Scroll
                    </span>
                </div>
            </div>

            {/* Right: the photograph. Oversized so it has room to drift. */}
            <div className="relative z-10 w-full lg:w-[48%] min-h-[58vh] lg:min-h-screen flex-shrink-0 overflow-hidden">
                <div className="hero-media absolute inset-0 -top-[8%] h-[116%]" data-parallax="0.12">
                    <Image
                        src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Pool%20Hm3.png"
                        alt="The pool area at Indah Morib Homestay, Selangor"
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>

                {/* Feathered edge so the photo dissolves into the shader field
                    instead of butting against it with a hard seam. */}
                <div
                    className="absolute inset-y-0 left-0 w-40 hidden lg:block pointer-events-none"
                    style={{
                        background: "linear-gradient(90deg, var(--background) 0%, transparent 100%)",
                    }}
                />
                <div
                    className="absolute inset-x-0 top-0 h-32 lg:hidden pointer-events-none"
                    style={{
                        background: "linear-gradient(180deg, var(--background) 0%, transparent 100%)",
                    }}
                />
            </div>
        </section>
    );
}
