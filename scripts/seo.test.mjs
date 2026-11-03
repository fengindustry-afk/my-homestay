// Run: node --test scripts/seo.test.mjs  (Node 24 loads the .ts modules directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESS, SITE_URL, waLink } from "../lib/site.ts";

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
