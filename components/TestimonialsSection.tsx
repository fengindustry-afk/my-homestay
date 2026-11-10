import Image from "next/image";
import { useTranslations } from "next-intl";

const testimonials = [
    {
        name: "Haqeem Noorazli",
        role: "roleBusiness",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Haqiem.png",
        text: "I stayed with my colleagues for a work trip. The person whom I speak/message via whatsapp to book was helpful and attentive. Indah Morib is a building with a 4 unit homestay.The unit I stayed in had 2 rooms 2 bath and a complete kitchen. The unit and 2 rooms are big, spacious, most importantly very clean. Rooms come with air conditioner and toilet comes with heater shower, water pressure is amazing.Will definitely stay here if I come to Morib. I highly recommend this place if you are coming with/for family, big family, work outing activities, weddings.Thanks Indah Morib HStay!",
        stars: 5,
    },
    {
        name: "najwa syolehah",
        role: "roleFamilyDay",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Najwa.png",
        text: "We held a Family Day with almost 120 people in attendance. A very suitable place with the best facilities. Resort level. Toilets, fields, swimming pool, house, dining area all met the needs of our program. Highly recommended!",
        stars: 5,
    },
    {
        name: "Che Maryam Ahmad",
        role: "roleRetreat",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Che%20Maryam%20Ahmad.png",
        text: "The place is spacious and neat, the room is comfortable and clean, the kitchen and bathroom are also clean. Ample kitchen equipment, comfortable dining area, many pools and some are covered, suitable for women to bathe. The large hall can be used as a place for congregational prayer. I give 5/5.",
        stars: 5,
    },
];

function Stars({ count }: { count: number }) {
    const t = useTranslations("Testimonials");
    return (
        <div className="testimonial-stars" role="img" aria-label={t("stars", { count })}>
            {Array.from({ length: 5 }, (_, i) => (
                <svg
                    key={i}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill={i < count ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsSection() {
    const t = useTranslations("Testimonials");
    const tr = t;
    return (
        <section className="section">
            <div className="wrap">
                <div className="split-head" data-reveal>
                    <div>
                        <p className="section-tag">{t("eyebrow")}</p>
                        <h2 className="section-title">
                            <span className="title-roman">{t.rich("title", { em: (c) => <em className="title-em">{c}</em> })}</span>
                        </h2>
                    </div>
                    <p className="section-description">
                        {t("intro")}
                    </p>
                </div>

                {/* items-start: each card keeps its own height rather than
                    stretching to the longest review. The middle card is the
                    inked one. */}
                <div className="testimonial-grid" data-stagger>
                    {testimonials.map((t, i) => (
                        <figure
                            key={t.name}
                            className={i === 1 ? "testimonial-card is-feature" : "testimonial-card"}
                            id={`testimonial-${t.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                            <Stars count={t.stars} />
                            <blockquote className="testimonial-text">{t.text}</blockquote>
                            <figcaption className="testimonial-author">
                                <Image
                                    src={t.avatar}
                                    alt=""
                                    width={46}
                                    height={46}
                                    className="testimonial-avatar"
                                />
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-role">{tr(t.role)}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
