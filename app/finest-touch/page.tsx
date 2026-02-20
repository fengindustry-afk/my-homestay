"use client";

import { getCurrentUserRole } from "@/lib/roles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FinestTabs } from "@/components/finest/Tabs";
import { DashboardPanel } from "@/components/finest/DashboardPanel";
import { BookingsPanel } from "@/components/finest/BookingsPanel";
import { RoomsPanel } from "@/components/finest/RoomsPanel";
import { ContentPanel } from "@/components/finest/ContentPanel";
import type { DashboardStats } from "@/components/finest/types";

const initialStats: DashboardStats = {
  totalBookings: 0,
  upcomingCheckIns: 0,
  activeRooms: 0,
};

export default function FinestTouchPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Existing stats loading logic
  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const today = new Date().toISOString().slice(0, 10);

        let totalBookings = 0;
        let upcomingCheckIns = 0;

        const [
          { count: bookingsCount, error: bookingsError },
          { count: upcomingCount, error: upcomingError },
        ] = await Promise.all([
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .gte("check_in", today),
        ]);

        if (!bookingsError && typeof bookingsCount === "number") {
          totalBookings = bookingsCount;
        }
        if (!upcomingError && typeof upcomingCount === "number") {
          upcomingCheckIns = upcomingCount;
        }

        const { count: roomsCount, error: roomsError } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true });

        if (isMounted) {
          setStats({
            totalBookings,
            upcomingCheckIns,
            activeRooms:
              roomsError || typeof roomsCount !== "number" ? 0 : roomsCount,
          });
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // NEW: load current user role
  useEffect(() => {
    getCurrentUserRole().then((r) => {
      setRole(r);
      setLoadingRole(false);
    });
  }, []);

  if (loadingRole) {
    return <div className="p-6">Loading permissions...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Admin-only stats summary */}
      {role === "admin" && (
        <section className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalBookings}
              </div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.upcomingCheckIns}
              </div>
              <div className="text-sm text-gray-600">Upcoming Check‑ins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.activeRooms}
              </div>
              <div className="text-sm text-gray-600">Active Rooms</div>
            </div>
          </div>
        </section>
      )}

      {/* Existing header */}
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] md:text-3xl">
            Website Insight Overview
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
            A quiet corner reserved just for you to review bookings, rooms and
            the overall performance of Serenity Homestay.
          </p>
        </div>
        <div className="flex gap-2 text-xs text-[var(--text-muted)]" />
      </section>

      {/* Existing tabs & panels */}
      <FinestTabs>
        {(active) => {
          if (active === "bookings") return <BookingsPanel />;
          if (active === "rooms") return <RoomsPanel />;
          if (active === "content") return <ContentPanel />;
          return <DashboardPanel stats={stats} />;
        }}
      </FinestTabs>

      {/* Staff notice */}
      {role === "staff" && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold text-yellow-800">Staff Access</h3>
          <p className="text-yellow-700">
            You can view bookings and rooms. Admin features are restricted.
          </p>
        </div>
      )}
    </div>
  );
}