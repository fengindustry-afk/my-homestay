import type { Metadata } from "next";
import type { Room } from "@/components/RoomsSection";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqJsonLd, localeAlternates, toJsonLd } from "@/lib/seo";
import { FAQ_KEYS, FAQ_VARS } from "@/components/FaqSection";
import HomePageClient from "./HomePageClient";

type Props = { params: Promise<{ locale: "ms" | "en" }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return { title: { absolute: t("title") }, alternates: localeAlternates("/", locale) };
}

// The room grid is rendered on the server so crawlers see the room links.
// Cached for 5 minutes; the browser still refreshes the list on load.
export const revalidate = 300;

async function getRooms(): Promise<Room[] | undefined> {
  try {
    // Imported lazily: supabaseAdmin throws at import when env is missing,
    // which would 500 the homepage instead of falling back to the browser fetch.
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    return error ? undefined : ((data ?? []) as Room[]);
  } catch {
    return undefined;
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Built from the same messages FaqSection renders, so markup matches the page.
  const t = await getTranslations({ locale, namespace: "Faq" });
  const faq = FAQ_KEYS.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`, FAQ_VARS) }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd(faq)) }} />
      <HomePageClient initialRooms={await getRooms()} />
    </>
  );
}
