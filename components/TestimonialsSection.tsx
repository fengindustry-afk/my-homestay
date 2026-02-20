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
        text: "The place is spacious and neat, the room is comfortable and clean, the kitchen and bathroom are also clean. Ample kitchen equipment, comfortable dining area, many pools and some are covered, suitable for women to bathe. The large hall can be used as a place for congregational prayer. I give5/5👍🏻",
        stars: 5,
    },
];

export default function TestimonialsSection() {
    return (
        <section
            className="section"
            style={{ background: "var(--surface)" }}
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 text-center">
                    <p className="section-tag">Testimonials</p>
                    <h2
                        className="section-title"
                        style={{ maxWidth: 500, margin: "0 auto 16px" }}
                    >
                        What Our{" "}
                        <span style={{ color: "var(--accent)" }}>Guests</span> Say
                    </h2>
                    <p
                        className="section-description"
                        style={{ maxWidth: 520, margin: "0 auto" }}
                    >
                        Don&apos;t just take our word for it — hear from our happy guests.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <div key={t.name} className="testimonial-card" id={`testimonial-${t.name.toLowerCase().replace(/\s+/g, "-")}`}>
                            <div className="testimonial-stars">
                                {"★".repeat(t.stars)}
                                {"☆".repeat(5 - t.stars)}
                            </div>
                            <p className="testimonial-text">{t.text}</p>
                            <div className="testimonial-author">
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="testimonial-avatar"
                                    loading="lazy"
                                />
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
