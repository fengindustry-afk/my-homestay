"use client";

import type { DashboardStats } from "./types";

export function DashboardPanel({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Total Bookings
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-strong)]">{stats.totalBookings}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">All-time reservations across every room.</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Upcoming Check-ins
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-strong)]">{stats.upcomingCheckIns}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Guests arriving from today onwards.</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Active Rooms
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-strong)]">{stats.activeRooms}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Currently listed and available on the website.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">Today&apos;s Focus</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Use this space to quickly review new bookings, busy days and empty gaps in your calendar.
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-muted)]">
            <li>• Check for guests arriving today and tomorrow.</li>
            <li>• Look for long gaps where you may want to run a promotion.</li>
            <li>• Make sure each active room has an up-to-date photo and description.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">Quick Tips</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Bookings and rooms here are powered by your Supabase tables. If numbers do not look right, double‑check the
            data in Supabase or your Row Level Security (RLS) policies.
          </p>
        </div>
      </section>
    </div>
  );
}

