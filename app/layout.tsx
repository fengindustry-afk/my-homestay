import type { Metadata } from "next";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import BannerPopup from "@/components/BannerPopup";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

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

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indah Morib Homestay | Banting Homestay & Morib Beach Escape 2026",
  description:
    "Experience the ultimate Staycation Selangor at Indah Morib Homestay. A boutique eco-friendly stay near Morib Beach, perfect for Cuti-Cuti Malaysia 2026. Book your private beach homestay Banting today.",
  keywords:
    "Staycation Selangor, Banting Homestay, Morib Beach Escape, Cuti-Cuti Malaysia 2026, Kampung Endah Stay, Homestay near Morib, Sugarcane Garden Agrotourism, Private beach homestay Banting, Eco-friendly staycation Selangor, Smart Homestay Malaysia",
  openGraph: {
    title: "Indah Morib Homestay | Boutique Staycation Selangor 2026",
    description: "Discover a unique blend of luxury and nature at Indah Morib. Your premier Banting Homestay for an unforgettable Morib Beach Escape.",
    url: "https://indahmoribhomestay.vercel.app",
    siteName: "Indah Morib Homestay",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indah Morib Homestay - Boutique Staycation Selangor",
      },
    ],
    locale: "en_MY",
    type: "website",
  },
  alternates: {
    canonical: "https://indahmoribhomestay.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Indah Morib Homestay",
    "description": "Boutique eco-friendly homestay in Banting near Morib Beach, Selangor.",
    "url": "https://indahmoribhomestay.vercel.app",
    "telephone": "+60123456789",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kampung Endah",
      "addressLocality": "Banting",
      "addressRegion": "Selangor",
      "postalCode": "42700",
      "addressCountry": "MY"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "2.7983",
      "longitude": "101.4442"
    },
    "image": "https://indahmoribhomestay.vercel.app/og-image.jpg",
    "priceRange": "$$",
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Near Morib Beach", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Eco-friendly", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Smart Home Features", "value": true }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${plusJakarta.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
          <BannerPopup />
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
