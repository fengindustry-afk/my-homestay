// Single source of truth for the site URL and the business facts. The site,
// the JSON-LD and the Google Business Profile must all say the same thing.
// No imports on purpose: scripts/seo.test.mjs loads this file directly in Node.

export const SITE_URL = "https://indahmoribhomestay.vercel.app";

export const BUSINESS = {
    name: "Indah Morib Homestay",
    phones: ["+60 11-5757 2001", "+60 11-5504 3280"],
    whatsapp: "601157572001",
    email: "indahmoribhomestay@gmail.com",
    address: {
        street: "Pt 704, Jalan Perdana 2 Indah Perdana, Kampung Endah",
        locality: "Banting",
        postalCode: "42700",
        region: "Selangor",
        country: "MY",
    },
    // Pin of the main Google Business Profile. Null until the owner sends it.
    geo: null as { lat: number; lng: number } | null,
    // Share link of the main Google Business Profile. Null until known.
    mapsUrl: null as string | null,
    checkIn: "15:00",
    checkOut: "12:00",
    priceRange: "RM150 - RM1,800",
    // Compound-wide facts backed by the room data and guest reviews.
    amenities: [
        "Swimming pool",
        "Muslimah-friendly covered pool",
        "Children's pool",
        "Free Wi-Fi",
        "Air conditioning",
        "Free parking",
        "Barbecue pit",
        "Prayer room",
        "Event hall",
    ],
    sameAs: ["https://facebook.com/indahmoribhomestay", "https://indahmorib.orderla.my"],
};

// Google Search Console HTML-tag token. Empty renders no tag.
export const GOOGLE_SITE_VERIFICATION = "";

// The "(dari website)" tag lets the owner see in WhatsApp which chats the site sent.
export const WA_DEFAULT_MESSAGE = `Hi ${BUSINESS.name}, saya nak tanya tentang tempahan (dari website)`;

export function waLink(message: string): string {
    return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
