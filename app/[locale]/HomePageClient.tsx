"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RoomsSection, { type Room } from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function HomePageClient({ initialRooms }: { initialRooms?: Room[] }) {
  const [filterCriteria, setFilterCriteria] = useState<{ roomType: string; guests: string } | undefined>(undefined);

  const handleSearch = (criteria: { roomType: string; guests: string }) => {
    setFilterCriteria(criteria);
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <RoomsSection
          initialRooms={initialRooms}
          filterCriteria={filterCriteria}
          onSearch={handleSearch}
          onReset={() => setFilterCriteria(undefined)}
        />
        <AmenitiesSection />
        <GallerySection />
        <TestimonialsSection />
        <FaqSection />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
