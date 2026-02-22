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

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--text-strong)] uppercase tracking-widest mb-4">Sale Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 font-black uppercase tracking-widest text-[var(--text-muted)]">Month/Year</th>
                  <th className="pb-2 text-right font-black uppercase tracking-widest text-[var(--text-muted)]">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {(() => {
                  const salesMap: Record<string, number> = {};
                  stats.bookings?.forEach(b => {
                    if (!b.check_in || !b.total_price) return;
                    const [y, m, d] = b.check_in.split("-").map(Number);
                    const date = new Date(y, m - 1, d);
                    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    salesMap[key] = (salesMap[key] || 0) + Number(b.total_price);
                  });

                  const sortedKeys = Object.keys(salesMap).sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateB.getTime() - dateA.getTime();
                  });

                  if (sortedKeys.length === 0) {
                    return <tr><td colSpan={2} className="py-4 text-center italic text-[var(--text-muted)]">No historical data available yet.</td></tr>;
                  }

                  return sortedKeys.map(key => (
                    <tr key={key} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-2.5 font-bold text-[var(--text-strong)]">{key}</td>
                      <td className="py-2.5 text-right font-black text-[var(--accent)]">RM {salesMap[key].toLocaleString()}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">Today&apos;s Focus</h2>
          {/* ... existing content ... */}
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Use this space to quickly review new bookings, busy days and empty gaps in your calendar.
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-muted)]">
            <li>• Check for guests arriving today and tomorrow.</li>
            <li>• Look for long gaps where you may want to run a promotion.</li>
            <li>• Make sure each active room has an up-to-date photo and description.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

