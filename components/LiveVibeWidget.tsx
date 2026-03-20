"use client";
import React, { useState, useEffect } from "react";

export default function LiveVibeWidget() {
    const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
    const [goldenHour, setGoldenHour] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVibe = async () => {
            try {
                // Fetching Banting weather (mocked for now, but structured for real API)
                // In a real scenario, we'd use OpenWeatherMap or similar
                const mockTemp = 28 + Math.floor(Math.random() * 5);
                const conditions = ["Sunny", "Partly Cloudy", "Tropical Breeze", "Clear Skies"];
                const mockCondition = conditions[Math.floor(Math.random() * conditions.length)];
                
                setWeather({ temp: mockTemp, condition: mockCondition });

                // Calculate Golden Hour for Banting (approximate for 2026)
                // Typically 1 hour before sunset (around 6:30 PM - 7:30 PM in Selangor)
                setGoldenHour("6:45 PM - 7:30 PM");
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch vibe", error);
                setLoading(false);
            }
        };

        fetchVibe();
    }, []);

    if (loading) return <div className="animate-pulse bg-[var(--surface)] h-24 rounded-3xl"></div>;

    return (
        <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)] hover:border-[var(--accent)] transition-all group shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--accent-light)] rounded-full flex items-center justify-center text-[var(--accent-dark)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v2M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Live Banting Vibe</p>
                        <h4 className="font-serif text-lg text-[var(--primary)]">{weather?.condition}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-[var(--primary)]">{weather?.temp}°C</span>
                </div>
            </div>
            
            <div className="bg-white/50 p-4 rounded-2xl flex items-center justify-between border border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.07l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    <span className="text-xs font-bold text-[var(--primary)]">Golden Hour</span>
                </div>
                <span className="text-xs font-medium text-[var(--accent-dark)]">{goldenHour}</span>
            </div>
            
            <p className="mt-4 text-[10px] text-[var(--text-muted)] italic text-center">
                Perfect for photography-loving guests.
            </p>
        </div>
    );
}
