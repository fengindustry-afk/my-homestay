import { useTranslations } from "next-intl";
import CoverPicture from "./CoverPicture";
import { WA_DEFAULT_MESSAGE, waLink } from "@/lib/site";

export default function HeroSection() {
    const t = useTranslations("Hero");
    const HEADLINE = [t("line1"), t("line2")];
    const TRUST = [t("trust1"), t("trust2"), t("trust3")];
    return (
        <section id="home" className="hero-band">
            <div className="wrap hero-grid">
                <div>
                    <p className="section-tag">{t("eyebrow")}</p>

                    <h1 className="text-display hero-h1">
                        {HEADLINE.map((line) => (
                            <span key={line} className="title-roman">
                                {line}
                            </span>
                        ))}
                    </h1>

                    <p className="hero-lede">
                        {t("lede")}
                    </p>

                    <div className="hero-ctas">
                        <a href="#rooms" className="btn-primary">
                            {t("viewRooms")}
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

                    <ul className="hero-trust">
                        {TRUST.map((item) => (
                            <li key={item} className="tag-in">{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="hero-photo">
                    <CoverPicture
                        desktop="/images/hero-pool.jpg"
                        mobile="/images/hero-pool-portrait.jpg"
                        alt={t("photoAlt")}
                        eager
                    />
                </div>
            </div>
        </section>
    );
}
