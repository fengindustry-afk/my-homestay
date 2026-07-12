import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://indahmoribhomestay.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  title: "Indah Morib Homestay — Your Home Away From Home",
  description:
    "Experience luxurious homestay living in Malaysia. Beautifully designed rooms, world-class amenities, and unforgettable memories await you at Indah Morib Homestay.",
  keywords:
    "homestay, Malaysia, vacation rental, luxury accommodation, holiday home",
  openGraph: {
    title: "Indah Morib Homestay",
    description: "Experience luxurious homestay living in Malaysia. Your perfect home away from home.",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Without JS, scroll-reveal can't fire — show everything up front. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
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