import Image from "next/image";
import { useTranslations } from "next-intl";
import { BUSINESS, WA_DEFAULT_MESSAGE, waLink } from "@/lib/site";

const CONTACTS = [
    { label: "phone", value: BUSINESS.phones[0], href: `tel:${BUSINESS.phones[0].replace(/[^+\d]/g, "")}` },
    { label: "email", value: BUSINESS.email.split("@")[0], href: `mailto:${BUSINESS.email}` },
    {
        label: "location",
        value: `${BUSINESS.address.locality}, ${BUSINESS.address.region}`,
        // The main Google profile's share link once known; a Maps search until then.
        href: BUSINESS.mapsUrl ?? "https://maps.google.com/?q=Indah+Morib+Homestay+Banting+Selangor",
    },
];

export default function CTASection() {
    const t = useTranslations("CTA");
    return (
        <section id="contact" className="cta-section">
            <div className="wrap cta-grid">
                <div>
                    <h2 className="section-title" data-reveal>
                        <span className="title-italic">{t("title1")}</span>
                        <span className="title-roman">{t("title2")}</span>
                    </h2>

                    <div data-reveal data-reveal-delay="120">
                        <p className="cta-lede">
                            {t("lede")}
                        </p>
                        <div className="cta-buttons">
                            <a
                                href={waLink(WA_DEFAULT_MESSAGE)}
                                className="btn-primary"
                                id="whatsapp-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("whatsapp")}
                            </a>
                            <a href={`mailto:${BUSINESS.email}`} className="btn-outline" id="email-btn">
                                {t("emailUs")}
                            </a>
                        </div>
                    </div>

                    <div className="contact-row" data-stagger>
                        {CONTACTS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="contact-chip"
                            >
                                <span className="contact-chip-label">{t(item.label)}</span>
                                <span className="contact-chip-value">{item.value}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="cta-photo photo-frame">
                    <Image
                        src="/images/content/langit.jpg"
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={85}
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
