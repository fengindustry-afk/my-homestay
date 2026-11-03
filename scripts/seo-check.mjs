#!/usr/bin/env node
// Raw-HTML SEO regression check: inspects what a crawler that does not run
// JavaScript receives. Run it before merging any branch into main.
//
// Usage: node scripts/seo-check.mjs [baseUrl] [--allow id,id]
//   baseUrl  defaults to production.
//   --allow  reports the listed check ids as WARN instead of FAIL, for checks
//            whose feature has not shipped yet. Never use it as a merge guard.
// Exit code: 0 when nothing FAILs, 1 otherwise.

const BRAND = "Indah Morib Homestay";
const LANDING_PAGES = ["/family-day", "/dewan-majlis-banting"];

const args = process.argv.slice(2);
const allowAt = args.indexOf("--allow");
const allow = new Set(allowAt >= 0 ? (args[allowAt + 1] ?? "").split(",").filter(Boolean) : []);
const positional = args.filter((a, i) => !a.startsWith("--") && !(allowAt >= 0 && i === allowAt + 1));
const base = (positional[0] ?? "https://indahmoribhomestay.vercel.app").replace(/\/+$/, "");

const tally = { PASS: 0, WARN: 0, FAIL: 0 };

function check(id, label, ok, detail = "") {
    const status = ok ? "PASS" : allow.has(id) ? "WARN" : "FAIL";
    tally[status]++;
    console.log(`${status} [${id}] ${label}${!ok && detail ? `: ${detail}` : ""}`);
}

async function get(path) {
    try {
        const res = await fetch(base + path, { redirect: "follow" });
        return { status: res.status, html: await res.text() };
    } catch (err) {
        return { status: 0, html: "", error: String(err) };
    }
}

const decode = (s) =>
    s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const withoutScripts = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

function attr(html, pattern) {
    const m = html.match(pattern);
    return m ? decode(m[1]) : null;
}

const normalisePath = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : "/") || "/";

function inspectPage(path, html, { room = false } = {}) {
    const titles = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => decode(m[1]));
    const title = titles[0] ?? "";
    check("title", `${path} has exactly one <title>`, titles.length === 1, `found ${titles.length}`);
    const brandCount = title.split(BRAND).length - 1;
    check("title", `${path} title names the brand at most once`, brandCount <= 1, JSON.stringify(title));
    check("title", `${path} title has no em dash`, !title.includes("—"), JSON.stringify(title));

    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
    const canonicalPath = canonical ? normalisePath(new URL(canonical, base).pathname) : null;
    check("canonical", `${path} canonical points at itself`, canonicalPath === normalisePath(path), `got ${canonical}`);

    const description = attr(html, /<meta name="description" content="([^"]*)"/);
    check("description", `${path} has a meta description`, description !== null);
    if (description !== null) {
        check("description", `${path} description is one line`, !/[\r\n]/.test(description), JSON.stringify(description.slice(0, 80)));
        check("description", `${path} description is <= 160 chars`, description.length <= 160, `${description.length} chars`);
    }

    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    check("jsonld", `${path} has JSON-LD`, blocks.length > 0);
    for (const [i, block] of blocks.entries()) {
        let parsed = true;
        try {
            JSON.parse(block);
        } catch {
            parsed = false;
        }
        check("jsonld", `${path} JSON-LD block ${i + 1} parses`, parsed);
        check("jsonld", `${path} JSON-LD block ${i + 1} has no aggregateRating`, !block.includes("aggregateRating"));
    }

    if (room) {
        check("og-image", `${path} has og:image`, attr(html, /<meta property="og:image" content="([^"]*)"/) !== null);
        check("room-h1", `${path} renders its <h1> on the server`, /<h1[\s>]/.test(withoutScripts(html)));
    }
}

async function main() {
    console.log(`seo-check against ${base}${allow.size ? ` (allowing: ${[...allow].join(", ")})` : ""}`);

    const home = await get("/");
    check("fetch", "/ returns 200", home.status === 200, home.error ?? `status ${home.status}`);
    let roomPath = "/homestay/6";
    if (home.status === 200) {
        const roomLinks = [...home.html.matchAll(/href="(\/homestay\/\d+)"/g)].map((m) => m[1]);
        check("room-links", "/ links to room pages in its HTML", roomLinks.length > 0, "0 links to /homestay/*");
        if (roomLinks.length) roomPath = roomLinks[0];
        check("kolam", "/ has Malay text (\"kolam\")", /kolam/i.test(withoutScripts(home.html)));
        inspectPage("/", home.html);
    }

    for (const path of new Set([roomPath, "/homestay/13"])) {
        const page = await get(path);
        check("fetch", `${path} returns 200`, page.status === 200, page.error ?? `status ${page.status}`);
        if (page.status === 200) inspectPage(path, page.html, { room: true });
    }

    for (const path of LANDING_PAGES) {
        const page = await get(path);
        check("landing", `${path} returns 200`, page.status === 200, page.error ?? `status ${page.status}`);
        if (page.status === 200) inspectPage(path, page.html);
    }

    const sitemap = await get("/sitemap.xml");
    check("fetch", "/sitemap.xml returns 200", sitemap.status === 200, sitemap.error ?? `status ${sitemap.status}`);
    for (const path of LANDING_PAGES) {
        check("landing", `sitemap lists ${path}`, sitemap.html.includes(`${path}</loc>`));
    }

    console.log(`seo-check: ${tally.PASS} pass, ${tally.WARN} warn, ${tally.FAIL} fail`);
    process.exit(tally.FAIL ? 1 : 0);
}

main();
