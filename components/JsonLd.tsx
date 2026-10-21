const SITE_URL = "https://indahmoribhomestay.vercel.app";

// LodgingBusiness structured data — lets Google surface rich results
// (name, address, phone, rating) for the homestay in local/Maps search.
const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Indah Morib Homestay",
    description:
        "Luxurious homestay living in Malaysia. Beautifully designed rooms, world-class amenities, and unforgettable memories.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: ["+60 11-5757 2001", "+60 11-5504 3280"],
    email: "indahmoribhomestay@gmail.com",
    priceRange: "$$",
    address: {
        "@type": "PostalAddress",
        streetAddress:
            "Pt 704, Jalan Perdana 2 Indah Perdana, Kampung Endah",
        addressLocality: "Banting",
        postalCode: "42700",
        addressRegion: "Selangor",
        addressCountry: "MY",
    },
    sameAs: ["https://facebook.com/indahmoribhomestay"],
};

export default function JsonLd() {
    return (
        <script
            type="application/ld+json"
            // Static, trusted content — safe to inject.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
