"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RoomsSection from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  const [filterCriteria, setFilterCriteria] = useState<{ roomType: string; guests: string } | undefined>(undefined);

  const handleSearch = (criteria: { roomType: string; guests: string }) => {
    setFilterCriteria(criteria);
  };

  return (
    <>
      <Navbar />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <RoomsSection
          filterCriteria={filterCriteria}
          onSearch={handleSearch}
          onReset={() => setFilterCriteria(undefined)}
        />
        <AmenitiesSection />
        <GallerySection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
