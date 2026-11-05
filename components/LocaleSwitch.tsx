"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

// BM | EN. Plain links to the same URLs as the hreflang tags (BM at /, English
// under /en), so crawlers follow them with no redirect in between.
export default function LocaleSwitch({ className = "" }: { className?: string }) {
    const locale = useLocale();
    const { languages } = localeAlternates(usePathname(), "ms");
    const t = useTranslations("Lang");
    return (
        <div className={`locale-switch ${className}`} role="group" aria-label={t("label")}>
            {routing.locales.map((l) => (
                <a
                    key={l}
                    href={languages[l]}
                    hrefLang={l}
                    lang={l}
                    aria-current={l === locale ? "true" : undefined}
                    className="locale-switch-link"
                >
                    {t(l)}
                </a>
            ))}
        </div>
    );
}
