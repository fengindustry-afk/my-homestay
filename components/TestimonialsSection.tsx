import Image from "next/image";

const testimonials = [
    {
        name: "Haqeem Noorazli",
        role: "Business Trip",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Haqiem.png",
        text: "I stayed with my colleagues for a work trip. The person whom I speak/message via whatsapp to book was helpful and attentive. Indah Morib is a building with a 4 unit homestay.The unit I stayed in had 2 rooms 2 bath and a complete kitchen. The unit and 2 rooms are big, spacious, most importantly very clean. Rooms come with air conditioner and toilet comes with heater shower, water pressure is amazing.Will definitely stay here if I come to Morib. I highly recommend this place if you are coming with/for family, big family, work outing activities, weddings.Thanks Indah Morib HStay!",
        stars: 5,
    },
    {
        name: "najwa syolehah",
        role: "Family Day",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Najwa.png",
        text: "We held a Family Day with almost 120 people in attendance. A very suitable place with the best facilities. Resort level. Toilets, fields, swimming pool, house, dining area all met the needs of our program. Highly recommended!",
        stars: 5,
    },
    {
        name: "Che Maryam Ahmad",
        role: "Family Retreat",
        avatar: "https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/backgrounds/Che%20Maryam%20Ahmad.png",
        text: "The place is spacious and neat, the room is comfortable and clean, the kitchen and bathroom are also clean. Ample kitchen equipment, comfortable dining area, many pools and some are covered, suitable for women to bathe. The large hall can be used as a place for congregational prayer. I give 5/5.",
        stars: 5,
    },
];

function Stars({ count }: { count: number }) {
    return (
        <div className="testimonial-stars" role="img" aria-label={`${count} out of 5 stars`}>
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
    return (
        <section className="section" style={{ background: "var(--surface)" }}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7" data-reveal>
                        <p className="section-tag">05 &nbsp;/&nbsp; Testimonials</p>
                        <h2 className="section-title" data-split style={{ maxWidth: 560 }}>
                            What our <em style={{ color: "var(--accent)" }}>guests</em> say
                        </h2>
                    </div>
                    <div className="lg:col-span-5" data-reveal data-reveal-delay="120">
                        <p className="section-description">
                            Unedited reviews from families and companies who booked the compound.
                        </p>
                    </div>
                </div>

                {/* items-start: each card keeps its own height rather than
                    stretching to the longest review. */}
                <div className="grid items-start gap-7 md:grid-cols-3" data-stagger>
                    {testimonials.map((t) => (
                        <figure
                            key={t.name}
                            className="testimonial-card"
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
                                    <div className="testimonial-role">{t.role}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
