import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LandingPage, { landingMetadata } from "@/components/LandingPage";

type Props = { params: Promise<{ locale: "ms" | "en" }> };

// Same cache window as the home page: the room list comes from the DB.
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return landingMetadata("familyDay", (await params).locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPage kind="familyDay" locale={locale} />;
}
