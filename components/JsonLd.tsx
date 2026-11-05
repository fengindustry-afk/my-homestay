import { getTranslations } from "next-intl/server";
import { lodgingJsonLd, toJsonLd, websiteJsonLd } from "@/lib/seo";
import { BUSINESS, SITE_URL } from "@/lib/site";

// LodgingBusiness and WebSite structured data on every page: name, address, phones,
// check-in times and amenities. No rating markup: Google ignores reviews a
// business publishes about itself.
export default async function JsonLd({ lang }: { lang: string }) {
    // Same text as the meta description, in the page language.
    const t = await getTranslations({ locale: lang, namespace: "Meta" });
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: toJsonLd(lodgingJsonLd(BUSINESS, SITE_URL, t("description"))) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: toJsonLd(websiteJsonLd(BUSINESS.name, SITE_URL)) }}
            />
        </>
    );
}
