import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import WhatsAppFloat from "@/components/WhatsAppFloat";
import JsonLd from "@/components/JsonLd";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollFX from "@/components/ScrollFX";
import ButtonFX from "@/components/ButtonFX";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://indahmoribhomestay.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  title: "Indah Morib Homestay: Your Home Away From Home",
  description:
    "Homestay compound in Morib, Selangor, for family retreats, gatherings, and celebrations. Private pools and up to 120 guests.",
  keywords:
    "homestay Morib, homestay Selangor, family homestay Malaysia, private pool homestay, Banting homestay",
  openGraph: {
    title: "Indah Morib Homestay",
    description:
      "Homestay compound in Morib, Selangor, for family retreats, gatherings, and celebrations. Private pools and up to 120 guests.",
    url: "https://indahmoribhomestay.vercel.app",
    siteName: "Indah Morib Homestay",
    images: [
      {
        url: "/og-image.jpg", // You can upload an image here later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_MY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // No scroll-smooth class here: Lenis owns scrolling and the two conflict.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* GSAP drives the reveals, so without JS nothing would ever animate in. */}
        <noscript>
          <style>{`[data-reveal],[data-stagger]>*{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <JsonLd />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScroll />
          <ScrollFX />
          <ButtonFX />
          {children}
          <WhatsAppFloat />
          <SpeedInsights />
        </ThemeProvider>
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