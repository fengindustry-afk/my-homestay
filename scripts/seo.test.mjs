// Run: node --test scripts/seo.test.mjs  (Node 24 loads the .ts modules directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESS, SITE_URL, waLink } from "../lib/site.ts";
import { isHall, roomDescription, roomJsonLd, roomTitle, toJsonLd } from "../lib/seo.ts";

// Fixtures copied from rooms.json (the DB snapshot), images shortened.
const h3 = { id: 6, title: "Homestay 3", type: "Holiday Home", price: 1500, beds: 5, baths: 4, guests: 10,
    amenities: "Wifi, Smart Tv, Aircond, Swimming Pool (Muslimah Friendly), Kid Swimming Pool, Barbecue Pit, Soccer Field, Snooker & Pool Table, Indoor Parking",
    image: "https://x.supabase.co/h3.png" };
const h4 = { id: 4, title: "Homestay 4", type: "Studio Unit ", price: 160, beds: 1, baths: 1, guests: 3,
    amenities: "Wifi, Aircond, Indoor Parking, Smart Tv", image: "https://x.supabase.co/h4.jpg" };
const h5 = { id: 3, title: "Homestay 5", type: "Family Room", price: 1500, beds: 9, baths: 4, guests: 10,
    amenities: null, image: "https://x.supabase.co/h5.jpg" };
const hall = { id: 13, title: "Indah Morib Multipurpose Hall", type: "Event Hall", price: 800, beds: 10, baths: 4, guests: 100,
    amenities: "Cafe Table Set, Speaker, Screen & Projector, Aircond, Meeting Room, 2 Outdoor Restroom, 2 Indoor Retroom, Prayer Room",
    image: "https://x.supabase.co/hall.png" };
const noPool = { id: 99, title: "Homestay 9", type: "Bungalow Unit", price: 300, beds: 2, baths: 2, guests: 4,
    amenities: "Snooker & Pool Table, No Pool" };
const ALL = [h3, h4, h5, hall, noPool];

test("SITE_URL is the production origin without a trailing slash", () => {
    assert.equal(SITE_URL, "https://indahmoribhomestay.vercel.app");
});

test("business name is spelled one way", () => {
    assert.equal(BUSINESS.name, "Indah Morib Homestay");
});

test("waLink builds a wa.me link with the message URL-encoded", () => {
    assert.equal(
        waLink("Hi, saya nak tanya (dari website)"),
        "https://wa.me/601157572001?text=Hi%2C%20saya%20nak%20tanya%20(dari%20website)",
    );
});

test("unit title names type, capacity and swimming pool", () => {
    assert.equal(roomTitle(h3), "Homestay 3: Holiday Home untuk 10 Orang dengan Kolam Renang");
});

test("unit title trims the type and omits the pool when there is none", () => {
    assert.equal(roomTitle(h4), "Homestay 4: Studio Unit untuk 3 Orang");
});

test("unit title without a type keeps the room name as the head", () => {
    assert.equal(roomTitle({ ...h5, type: "  " }), "Homestay 5 untuk 10 Orang");
});

test("hall title names the dewan and its capacity", () => {
    assert.equal(roomTitle(hall), "Indah Morib Multipurpose Hall: Dewan Majlis 100 Orang di Banting");
});

test("isHall is true only for the event hall", () => {
    assert.equal(isHall(hall), true);
    assert.equal(isHall(h3), false);
});

test("a pool table or 'No Pool' never counts as a swimming pool", () => {
    assert.equal(roomTitle(noPool), "Homestay 9: Bungalow Unit untuk 4 Orang");
    assert.doesNotMatch(roomDescription(noPool), /kolam/i);
    const names = roomJsonLd(noPool, [], SITE_URL)[0].amenityFeature.map((f) => f.name);
    assert.ok(!names.includes("No Pool"));
    assert.ok(names.includes("Snooker & Pool Table"));
});

test("unit description mentions the muslimah pool and formats the price", () => {
    const d = roomDescription(h3);
    assert.match(d, /kolam renang mesra muslimah/);
    assert.ok(d.includes("RM1,500"), d);
});

test("description without a type starts with 'Homestay'", () => {
    assert.match(roomDescription({ ...h5, type: null }), /^Homestay di Morib, Banting/);
});

test("every description is one line, at most 155 chars, with no em dash or missing values", () => {
    for (const r of ALL) {
        const d = roomDescription(r);
        assert.ok(d.length <= 155, `${r.title}: ${d.length} chars`);
        assert.doesNotMatch(d, /\n|—|undefined|null/, d);
    }
});

test("an over-long description is cut at a word boundary", () => {
    const d = roomDescription({ ...h3, type: "Holiday Home ".repeat(12).trim() });
    assert.ok(d.length <= 155, `${d.length} chars`);
    const last = d.split(" ").pop();
    assert.ok(["Holiday", "Home"].includes(last), `cut mid-word: "${last}"`);
});

test("hall JSON-LD is an EventVenue inside the lodging, with breadcrumbs", () => {
    const [place, crumbs] = roomJsonLd(hall, [], SITE_URL);
    assert.equal(place["@type"], "EventVenue");
    assert.equal(place["@id"], `${SITE_URL}/homestay/13#place`);
    assert.equal(place.containedInPlace["@id"], `${SITE_URL}/#lodging`);
    assert.equal(place.maximumAttendeeCapacity, 100);
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.equal(crumbs.itemListElement[0].name, BUSINESS.name);
    assert.equal(crumbs.itemListElement.at(-1).item, `${SITE_URL}/homestay/13`);
});

test("unit JSON-LD is an Accommodation with occupancy and at most 6 images, cover first", () => {
    const photos = Array.from({ length: 10 }, (_, i) => `https://x.supabase.co/p${i}.jpg`);
    const [place] = roomJsonLd(h3, photos, SITE_URL);
    assert.equal(place["@type"], "Accommodation");
    assert.deepEqual(place.occupancy, { "@type": "QuantitativeValue", maxValue: 10 });
    assert.equal(place.image.length, 6);
    assert.equal(place.image[0], h3.image);
});

test("JSON-LD omits amenityFeature when the room lists none", () => {
    assert.equal(roomJsonLd(h5, [], SITE_URL)[0].amenityFeature, undefined);
});

test("JSON-LD never carries review or rating markup", () => {
    for (const r of ALL) assert.doesNotMatch(JSON.stringify(roomJsonLd(r, [], SITE_URL)), /aggregateRating|"review"/);
});

test("toJsonLd escapes < so admin text cannot close the script tag", () => {
    const value = { a: "</script><script>alert(1)</script>" };
    const s = toJsonLd(value);
    assert.ok(!s.includes("</script>"), s);
    assert.deepEqual(JSON.parse(s), value);
});
