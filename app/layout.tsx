import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}