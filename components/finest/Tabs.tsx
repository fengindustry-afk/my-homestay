"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type TabKey = "dashboard" | "bookings" | "rooms" | "content";

const TABS: { key: TabKey; label: string; description: string }[] = [
  { key: "dashboard", label: "Overview", description: "Key numbers at a glance" },
  { key: "bookings", label: "Bookings", description: "View and manage reservations" },
  { key: "rooms", label: "Rooms", description: "Edit room details and photos" },
  { key: "content", label: "Content", description: "Fine‑tune website wording" },
];

export function FinestTabs({ children }: { children: (active: TabKey) => ReactNode }) {
  const [active, setActive] = useState<TabKey>("dashboard");

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1 text-xs">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`relative flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--surface-elevated)_80%,white_20%)]"
              }`}
            >
              <span className="font-semibold tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}

