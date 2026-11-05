import { useTranslations } from "next-intl";
import CoverPicture from "./CoverPicture";
import { WA_DEFAULT_MESSAGE, waLink } from "@/lib/site";

export default function HeroSection() {
    const t = useTranslations("Hero");
    const HEADLINE = [
        { text: t("line1"), italic: true },
        { text: t("line2"), italic: false },
    ];
    const TRUST = [t("trust1"), t("trust2"), t("trust3")];
    return (
        <section id="home" className="on-media hero-band">
            <div className="hero-photo">
                {/* Oversized so the photo has room to drift on scroll. */}
                <div className="hero-media absolute inset-0 -top-[8%] h-[116%]" data-parallax="0.12">
                    <CoverPicture
                        desktop="/images/hero-pool.jpg"
                        mobile="/images/hero-pool-portrait.jpg"
                        alt={t("photoAlt")}
                        eager
                    />
                </div>
            </div>
            <div className="hero-scrim" aria-hidden="true" />

            <p className="section-tag animate-fade-up">{t("eyebrow")}</p>

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
                {t("lede")}
            </p>

            <div className="hero-ctas animate-fade-up delay-600">
                <a href="#rooms" className="btn-primary">
                    {t("viewRooms")}
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
                    {t("whatsapp")}
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
