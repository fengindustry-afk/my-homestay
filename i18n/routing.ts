import { defineRouting } from "next-intl/routing";

// BM is the default and lives at /. English lives under /en.
// localeDetection is off: a language-detection tool will decide later.
export const routing = defineRouting({
    locales: ["ms", "en"],
    defaultLocale: "ms",
    localePrefix: "as-needed",
    localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
