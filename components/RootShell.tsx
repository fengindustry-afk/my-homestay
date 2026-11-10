import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import JsonLd from "@/components/JsonLd";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollFX from "@/components/ScrollFX";
import ButtonFX from "@/components/ButtonFX";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  // Only the admin tree uses this face now, so it is not preloaded on public pages.
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// The <html> document both root layouts share: the public [locale] tree and
// the (admin) tree. Only lang differs between them.
// className lets the public tree add its own face and token scope to <body>.
export default function RootShell({ lang, className = "", children }: { lang: string; className?: string; children: React.ReactNode }) {
  return (
    // No scroll-smooth class here: Lenis owns scrolling and the two conflict.
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* GSAP drives the reveals, so without JS nothing would ever animate in. */}
        <noscript>
          <style>{`[data-reveal],[data-stagger]>*{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <JsonLd lang={lang} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased ${className}`}>
        {/* Messages come from i18n/request.ts. The admin tree falls back to BM. */}
        <NextIntlClientProvider locale={lang}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScroll />
          <ScrollFX />
          <ButtonFX />
          {children}
          <WhatsAppFloat />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
        </NextIntlClientProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N4W8198R6K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-N4W8198R6K');
          `}
        </Script>
      </body>
    </html>
  );
}
