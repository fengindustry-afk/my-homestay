// Builds room page titles, meta descriptions and JSON-LD from the DB fields,
// so every room (including ones added later in the admin panel) gets
// keyword-bearing Malay metadata without a hand-kept copy map.
// No imports on purpose: scripts/seo.test.mjs loads this file directly in Node.

export type RoomSeoInput = {
    id: number;
    title: string;
    type?: string | null;
    price: number;
    beds?: number | null;
    baths?: number | null;
    guests?: number | null;
    amenities?: string | null;
    image?: string | null;
};

// Keep in sync with BUSINESS.name in lib/site.ts (a test checks it).
const BRAND = "Indah Morib Homestay";
const MAX_DESCRIPTION = 155;

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
const money = (n: number) => `RM${n.toLocaleString("en-MY")}`;

function amenityList(room: RoomSeoInput): string[] {
    return (room.amenities ?? "")
        .split(",")
        .map(oneLine)
        .filter((a) => a && !/^(no|tiada)\b/i.test(a));
}

// "Snooker & Pool Table" and "No Pool" are not swimming pools.
function poolEntries(room: RoomSeoInput): string[] {
    return amenityList(room).filter((a) => /swimming pool|kolam renang/i.test(a) && !/\bno pool\b|tiada kolam/i.test(a));
}

function clip(text: string, max = MAX_DESCRIPTION): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max + 1);
    const at = cut.lastIndexOf(" ");
    return (at > 0 ? cut.slice(0, at) : text.slice(0, max)).replace(/[\s,:;]+$/, "");
}

export function isHall(room: RoomSeoInput): boolean {
    return /hall|dewan/i.test(room.type ?? "");
}

export function roomTitle(room: RoomSeoInput): string {
    const title = oneLine(room.title);
    if (isHall(room)) {
        return `${title}: Dewan Majlis${room.guests ? ` ${room.guests} Orang` : ""} di Banting`;
    }
    const type = oneLine(room.type ?? "");
    return (
        (type ? `${title}: ${type}` : title) +
        (room.guests ? ` untuk ${room.guests} Orang` : "") +
        (poolEntries(room).length ? " dengan Kolam Renang" : "")
    );
}

export function roomDescription(room: RoomSeoInput): string {
    const price = room.price ? money(room.price) : null;
    if (isHall(room)) {
        return clip(oneLine(
            "Dewan serbaguna di Banting untuk majlis kahwin, mesyuarat dan family day." +
            (room.guests ? ` Muat ${room.guests} orang.` : "") +
            (price ? ` Dari ${price}.` : "") +
            " Tempah terus atau WhatsApp kami.",
        ));
    }
    const pools = poolEntries(room);
    const details = [
        room.beds ? `${room.beds} katil` : null,
        room.baths ? `${room.baths} bilik air` : null,
        pools.length ? (pools.some((p) => /muslimah/i.test(p)) ? "kolam renang mesra muslimah" : "kolam renang") : null,
    ].filter(Boolean);
    return clip(oneLine(
        `${oneLine(room.type ?? "") || "Homestay"} di Morib, Banting` +
        (room.guests ? ` untuk ${room.guests} orang` : "") +
        (details.length ? `: ${details.join(", ")}` : "") +
        "." +
        (price ? ` Dari ${price} semalam.` : "") +
        " Tempah terus atau WhatsApp kami.",
    ));
}

export function roomJsonLd(room: RoomSeoInput, photos: string[], siteUrl: string): object[] {
    const url = `${siteUrl}/homestay/${room.id}`;
    const hall = isHall(room);
    const amenities = amenityList(room);
    const place: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": hall ? "EventVenue" : "Accommodation",
        "@id": `${url}#place`,
        name: oneLine(room.title),
        description: roomDescription(room),
        url,
        image: [...new Set([room.image, ...photos].filter((u): u is string => Boolean(u)))].slice(0, 6),
        containedInPlace: { "@id": `${siteUrl}/#lodging` },
    };
    if (amenities.length) {
        place.amenityFeature = amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }));
    }
    if (room.guests) {
        if (hall) place.maximumAttendeeCapacity = room.guests;
        else place.occupancy = { "@type": "QuantitativeValue", maxValue: room.guests };
    }
    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: BRAND, item: siteUrl },
            { "@type": "ListItem", position: 2, name: oneLine(room.title), item: url },
        ],
    };
    return [place, breadcrumb];
}

// JSON for a <script type="application/ld+json"> tag. Escaping "<" stops
// admin-entered text such as "</script>" from closing the tag early.
export function toJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
