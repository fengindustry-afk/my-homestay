"use client";
import React from "react";
import LiveVibeWidget from "./LiveVibeWidget";

export default function HeroSection() {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--primary)]">
            {/* Background Image with Nature Distilled Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://skiaybyjtdkkqitvxrli.supabase.co/storage/v1/object/public/room-photos/Content/H5.jpg"
                    alt="Indah Morib Homestay - Boutique Staycation Selangor"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/60 via-transparent to-[var(--background)]"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-left">
                    <p className="section-tag text-[var(--accent-light)] mb-4">Visit Malaysia 2026</p>
                    <h1 className="font-serif text-white text-5xl md:text-7xl leading-tight mb-6">
                        Boutique <span className="text-[var(--accent)] italic">Staycation</span> in Selangor
                    </h1>
                    <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                        Experience the ultimate <strong>Morib Beach Escape</strong> at Indah Morib. 
                        A nature-distilled sanctuary in Banting, where modern eco-stay meets traditional Malaysian warmth.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-12">
                        <a href="#rooms" className="btn-primary">
                            Book Your Escape
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        <a href="/arrival" className="px-8 py-4 rounded-md border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all">
                            Seamless Arrival
                        </a>
                    </div>

                    <div className="flex items-center gap-6 text-white/60 text-sm font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                            Eco-Friendly
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                            Smart Tech
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                            Banting Roots
                        </span>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <div className="max-w-sm ml-auto">
                        <LiveVibeWidget />
                        <div className="mt-8 bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border border-white/20">
                            <h3 className="font-serif text-2xl text-white mb-4">Modern Eco-Stay</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Our solar-powered irrigation and smart features ensure a sustainable, high-tech experience in the heart of Kampung Endah.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
                <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
            </div>
        </section>
    );
}
