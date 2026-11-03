import { BUSINESS, SITE_URL } from "@/lib/site";

// LodgingBusiness structured data — lets Google surface rich results
// (name, address, phone, rating) for the homestay in local/Maps search.
const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BUSINESS.name,
    description:
        "Homestay compound in Morib, Selangor, for family retreats, gatherings, and celebrations. Private pools and up to 120 guests.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: BUSINESS.phones,
    email: BUSINESS.email,
    priceRange: "$$",
    address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.address.street,
        addressLocality: BUSINESS.address.locality,
        postalCode: BUSINESS.address.postalCode,
        addressRegion: BUSINESS.address.region,
        addressCountry: BUSINESS.address.country,
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
