"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ArrivalPage() {
    const steps = [
        {
            title: "Digital Check-in",
            desc: "Receive your smart-lock code via WhatsApp 2 hours before arrival. No physical keys needed.",
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
            ),
        },
        {
            title: "The Sugarcane Welcome",
            desc: "Follow the organic clay-toned path through our sugarcane garden to your unit's entrance.",
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
        },
        {
            title: "Smart Tech Ready",
            desc: "Your room temperature is pre-set via our solar-powered smart system for immediate comfort.",
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
            ),
        },
    ];

    return (
        <main className="bg-[var(--background)] min-h-screen">
            <Navbar />
            <section className="section pt-32">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="section-tag">Seamless Arrival</p>
                    <h1 className="section-title">Your Journey to <span className="text-[var(--accent)]">Indah Morib</span></h1>
                    <p className="text-lg text-[var(--text-muted)] mb-16">
                        We've designed our check-in process to be as stress-free as the stay itself. 
                        Experience the future of Malaysian hospitality.
                    </p>

                    <div className="grid gap-8 md:grid-cols-3 text-left">
                        {steps.map((step, i) => (
                            <div key={i} className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                                <div className="text-[var(--accent)] mb-6">{step.icon}</div>
                                <h3 className="font-serif text-xl mb-3 text-[var(--primary)]">{step.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 bg-[var(--primary)] text-white p-10 rounded-[3rem] text-left relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="font-serif text-3xl mb-4">Need Assistance?</h2>
                            <p className="opacity-80 mb-8 max-w-md">Our digital concierge is available 24/7 to ensure your arrival is perfect. Reach out via WhatsApp for instant support.</p>
                            <a href="https://wa.me/60123456789" className="bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--accent-dark)] transition-all inline-block">
                                Chat with Host
                            </a>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
