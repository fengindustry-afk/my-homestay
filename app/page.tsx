"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import AboutSection from "@/components/AboutSection";
import RoomsSection from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Reveal from "@/components/Reveal";

export default function Home() {
  const [filterCriteria, setFilterCriteria] = useState<{ roomType: string; guests: string } | undefined>(undefined);

  const handleSearch = (criteria: { roomType: string; guests: string }) => {
    setFilterCriteria(criteria);
  };

  return (
    <>
      <Navbar />
      <HeroSection />
      <Reveal>
        <AboutSection />
      </Reveal>
      <RoomsSection
        filterCriteria={filterCriteria}
        onSearch={handleSearch}
        onReset={() => setFilterCriteria(undefined)}
      />
      <Reveal>
        <AmenitiesSection />
      </Reveal>
      <Reveal>
        <GallerySection />
      </Reveal>
      <Reveal>
        <TestimonialsSection />
      </Reveal>
      <Reveal>
        <CTASection />
      </Reveal>
      <Footer />
      <ScrollToTop />
    </>
  );
}
