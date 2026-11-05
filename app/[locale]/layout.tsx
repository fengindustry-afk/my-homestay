import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RootShell from "@/components/RootShell";
import { routing } from "@/i18n/routing";
import { GOOGLE_SITE_VERIFICATION, SITE_URL } from "@/lib/site";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

// Both languages are prerendered, so pages stay static and ISR still works.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL(SITE_URL),
    verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined,
    robots: { index: true, follow: true },
    title: { default: t("title"), template: "%s | Indah Morib Homestay" },
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: "Indah Morib Homestay",
      description: t("description"),
      url: SITE_URL,
      siteName: "Indah Morib Homestay",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
      locale: locale === "ms" ? "ms_MY" : "en_MY",
      alternateLocale: locale === "ms" ? "en_MY" : "ms_MY",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <RootShell lang={locale}>{children}</RootShell>;
}
