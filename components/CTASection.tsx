import Image from "next/image";
import { BUSINESS, WA_DEFAULT_MESSAGE, waLink } from "@/lib/site";

const CONTACTS = [
    { label: "Phone", value: BUSINESS.phones[0], href: `tel:${BUSINESS.phones[0].replace(/[^+\d]/g, "")}` },
    { label: "Email", value: BUSINESS.email.split("@")[0], href: `mailto:${BUSINESS.email}` },
    {
        label: "Location",
        value: `${BUSINESS.address.locality}, ${BUSINESS.address.region}`,
        // The main Google profile's share link once known; a Maps search until then.
        href: BUSINESS.mapsUrl ?? "https://maps.google.com/?q=Indah+Morib+Homestay+Banting+Selangor",
    },
];

export default function CTASection() {
    return (
        <section id="contact" className="cta-section on-media">
            <div className="cta-photo">
                <Image
                    src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/Langit.jpg"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>
            <div className="cta-scrim" aria-hidden="true" />

            <div className="wrap cta-inner">
                <div className="cta-top">
                    <h2 className="text-display cta-title" data-reveal>
                        <span className="title-italic">Book your stay</span>
                        <span className="title-roman">and let the day run itself</span>
                    </h2>

                    <div data-reveal data-reveal-delay="120">
                        <p className="cta-lede">
                            Message us directly for current rates, package pricing for large
                            groups, and event bookings.
                        </p>
                        <div className="cta-buttons">
                            <a
                                href={waLink(WA_DEFAULT_MESSAGE)}
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
                            <a href={`mailto:${BUSINESS.email}`} className="btn-outline" id="email-btn">
                                Email us
                            </a>
                        </div>
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
                            <span className="contact-chip-label">{item.label}</span>
                            <span className="contact-chip-value">{item.value}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
