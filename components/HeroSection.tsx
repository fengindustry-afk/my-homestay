import CoverPicture from "./CoverPicture";
import { WA_DEFAULT_MESSAGE, waLink } from "@/lib/site";

const HEADLINE = [
    { text: "Where family gathers,", italic: true },
    { text: "and the day unwinds.", italic: false },
];

const TRUST = ["Muslim-friendly", "Private pools", "Up to 120 guests"];

export default function HeroSection() {
    return (
        <section id="home" className="on-media hero-band">
            <div className="hero-photo">
                {/* Oversized so the photo has room to drift on scroll. */}
                <div className="hero-media absolute inset-0 -top-[8%] h-[116%]" data-parallax="0.12">
                    <CoverPicture
                        desktop="/images/hero-pool.jpg"
                        mobile="/images/hero-pool-portrait.jpg"
                        alt="The pool area at Indah Morib Homestay, Selangor"
                        eager
                    />
                </div>
            </div>
            <div className="hero-scrim" aria-hidden="true" />

            <p className="section-tag animate-fade-up">Morib, Selangor</p>

            <h1 className="text-display hero-h1">
                {HEADLINE.map((line, i) => (
                    <span key={line.text} className="line-mask">
                        <span
                            className={line.italic ? "title-italic" : "title-roman"}
                            style={{ animationDelay: `${0.2 + i * 0.11}s` }}
                        >
                            {line.text}
                        </span>
                    </span>
                ))}
            </h1>

            <p className="hero-lede animate-fade-up delay-500">
                A riverside compound for family retreats, gatherings, and celebrations.
                An hour from Kuala Lumpur, a world away from the everyday.
            </p>

            <div className="hero-ctas animate-fade-up delay-600">
                <a href="#rooms" className="btn-primary">
                    View Homestays
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
                <a
                    href={waLink(WA_DEFAULT_MESSAGE)}
                    className="btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    WhatsApp Us
                </a>
            </div>

            <ul className="hero-trust animate-fade-in delay-600">
                {TRUST.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </section>
    );
}
