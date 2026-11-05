import { useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/site";

// Order of the questions on the page and in the FAQPage JSON-LD.
export const FAQ_KEYS = ["checkin", "pool", "poolRules", "guests", "hall", "book", "deposit", "amenities", "location", "beach", "pets"] as const;
export type FaqKey = (typeof FAQ_KEYS)[number];

const a = BUSINESS.address;
// Facts the answers interpolate, so they always match lib/site.ts.
export const FAQ_VARS = {
    checkIn: BUSINESS.checkIn,
    checkOut: BUSINESS.checkOut,
    phone: BUSINESS.phones[0],
    address: `${a.street}, ${a.locality} ${a.postalCode}, ${a.region}`,
};

// Native <details>: works without JS, and every answer is in the raw HTML.
export default function FaqSection({ keys = FAQ_KEYS }: { keys?: readonly FaqKey[] }) {
    const t = useTranslations("Faq");
    return (
        <section id="faq" className="section">
            <div className="wrap">
                <div className="text-center" data-reveal>
                    <p className="section-tag">{t("eyebrow")}</p>
                    <h2 className="section-title">
                        <span className="title-roman">{t.rich("title", { em: (c) => <em className="title-em">{c}</em> })}</span>
                    </h2>
                </div>
                <div className="faq-list mt-16" data-reveal>
                    {keys.map((k) => (
                        <details key={k} className="faq-item">
                            <summary className="faq-q">{t(`${k}.q`)}</summary>
                            <p className="faq-a">{t(`${k}.a`, FAQ_VARS)}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
