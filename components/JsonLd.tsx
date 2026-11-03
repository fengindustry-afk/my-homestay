import { lodgingJsonLd, toJsonLd } from "@/lib/seo";
import { BUSINESS, SITE_URL } from "@/lib/site";

const DESCRIPTION =
    "Homestay compound in Morib, Selangor, for family retreats, gatherings, and celebrations. Private pools and up to 120 guests.";

// LodgingBusiness structured data on every page: name, address, phones,
// check-in times and amenities. No rating markup: Google ignores reviews a
// business publishes about itself.
export default function JsonLd() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLd(lodgingJsonLd(BUSINESS, SITE_URL, DESCRIPTION)) }}
        />
    );
}
