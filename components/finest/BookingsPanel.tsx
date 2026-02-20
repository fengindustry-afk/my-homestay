"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RoomSummary, BookingRow } from "./types";

type BookingFormState = {
  room_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_price: string;
};

const emptyForm: BookingFormState = {
  room_id: "",
  guest_name: "",
  guest_email: "",
  check_in: "",
  check_out: "",
  total_price: "",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PALETTE = ["#DCE6FF", "#F9E1F3", "#FFE8D2", "#D9F3EB"];

const toKey = (date: Date) => date.toISOString().slice(0, 10);

export function BookingsPanel() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BookingFormState>(emptyForm);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          supabase.from("rooms").select("id,title,price"),
          supabase
            .from("bookings")
            .select(
              "id,room_id,guest_name,guest_email,check_in,check_out,total_price,payment_status,created_at"
            )
            .order("check_in", { ascending: true }),
        ]);

        if (!roomsRes.error && isMounted) {
          setRooms((roomsRes.data || []) as RoomSummary[]);
        }

        if (bookingsRes.error) {
          console.warn("Unable to load bookings (check RLS policies):", bookingsRes.error.message);
          if (isMounted) {
            setError(
              "Bookings cannot be read with the current Supabase policies. You can still create new bookings via the public website."
            );
          }
        } else if (isMounted) {
          setBookings((bookingsRes.data || []) as BookingRow[]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_id || !form.guest_name || !form.guest_email || !form.check_in || !form.check_out) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        room_id: Number(form.room_id),
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        check_in: form.check_in,
        check_out: form.check_out,
        total_price: Number(form.total_price || 0),
      };

      const { error: insertError } = await supabase.from("bookings").insert(payload);
      if (insertError) {
        alert(`Could not create booking: ${insertError.message}`);
        return;
      }

      setForm(emptyForm);

      const refreshed = await supabase
        .from("bookings")
        .select(
          "id,room_id,guest_name,guest_email,check_in,check_out,total_price,payment_status,created_at"
        )
        .order("check_in", { ascending: true });
      if (!refreshed.error) {
        setBookings((refreshed.data || []) as BookingRow[]);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, payment_status: string) => {
    const previous = bookings;
    setBookings((current) => current.map((b) => (b.id === id ? { ...b, payment_status } : b)));

    const { error: updateError } = await supabase.from("bookings").update({ payment_status }).eq("id", id);
    if (updateError) {
      alert(`Could not update status: ${updateError.message}`);
      setBookings(previous);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;

    const previous = bookings;
    setBookings((current) => current.filter((b) => b.id !== id));

    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", id);
    if (deleteError) {
      alert(`Could not delete booking: ${deleteError.message}`);
      setBookings(previous);
    }
  };

  const getRoomTitle = (room_id: number | null) =>
    rooms.find((r) => r.id === room_id)?.title || "Unknown room";

  const visibleMonthDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const monthLabel = visibleMonthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(() => {
    const year = visibleMonthDate.getFullYear();
    const month = visibleMonthDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; inCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startWeekday; i += 1) {
      const day = prevMonthDays - startWeekday + 1 + i;
      cells.push({ date: new Date(year, month - 1, day), inCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
    }

    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      cells.push({ date: next, inCurrentMonth: false });
    }

    return cells;
  }, [visibleMonthDate]);

  const bookingsByDay = useMemo(() => {
    const map: Record<string, BookingRow[]> = {};

    bookings.forEach((b) => {
      if (!b.check_in || !b.check_out) return;
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);

      const cursor = new Date(start);
      while (cursor < end) {
        const key = toKey(cursor);
        if (!map[key]) map[key] = [];
        map[key].push(b);
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return map;
  }, [bookings]);

  const recentFive = bookings.slice(0, 5);

  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">Bookings calendar</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            A monthly view that uses soft colours to show busy days and gaps so you can quickly spot vacancies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => setMonthOffset((v) => v - 1)}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 hover:bg-[color-mix(in_srgb,var(--surface)_80%,white_20%)]"
          >
            ←
          </button>
          <span className="min-w-[7rem] text-center font-semibold text-[var(--text-strong)]">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setMonthOffset((v) => v + 1)}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 hover:bg-[color-mix(in_srgb,var(--surface)_80%,white_20%)]"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)]">
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {DAY_LABELS.map((label) => (
              <div key={label} className="px-2 py-1 text-center">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarCells.map(({ date, inCurrentMonth }) => {
              const key = toKey(date);
              const dayBookings = bookingsByDay[key] || [];
              const isToday = key === toKey(new Date());

              return (
                <div
                  key={key + String(inCurrentMonth)}
                  className={`flex min-h-[4.75rem] flex-col rounded-lg border px-1.5 py-1 ${
                    inCurrentMonth
                      ? "border-[var(--border-subtle)] bg-[var(--surface)]"
                      : "border-transparent bg-[color-mix(in_srgb,var(--surface)_90%,white_10%)] text-[var(--text-muted)] opacity-60"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span
                      className={
                        isToday ? "rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] text-white" : ""
                      }
                    >
                      {date.getDate()}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent_88%)] px-1.5 py-0.5 text-[9px] text-[var(--primary)]">
                        {dayBookings.length} stay{dayBookings.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    {dayBookings.slice(0, 2).map((b) => {
                      const colorIndex = (b.room_id || 0) % PALETTE.length;
                      const bg = PALETTE[colorIndex];
                      return (
                        <div
                          key={b.id}
                          className="truncate rounded-md px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-strong)] shadow-sm"
                          style={{ backgroundColor: bg }}
                        >
                          {getRoomTitle(b.room_id)} · {b.guest_name}
                        </div>
                      );
                    })}
                    {dayBookings.length > 2 && (
                      <span className="text-[9px] text-[var(--text-muted)]">
                        +{dayBookings.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
            <h3 className="text-xs font-semibold text-[var(--text-strong)]">Create a booking</h3>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              Record phone, WhatsApp or walk‑in reservations and see them appear directly on the calendar.
            </p>

            <form onSubmit={handleCreate} className="mt-3 grid gap-2 text-[10px]">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-[var(--text-muted)]">Room</span>
                <select
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                  value={form.room_id}
                  onChange={(e) => handleChange("room_id", e.target.value)}
                  required
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-[var(--text-muted)]">Guest name</span>
                <input
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                  value={form.guest_name}
                  onChange={(e) => handleChange("guest_name", e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-[var(--text-muted)]">Guest email</span>
                <input
                  type="email"
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                  value={form.guest_email}
                  onChange={(e) => handleChange("guest_email", e.target.value)}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Check-in</span>
                  <input
                    type="date"
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.check_in}
                    onChange={(e) => handleChange("check_in", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Check-out</span>
                  <input
                    type="date"
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.check_out}
                    onChange={(e) => handleChange("check_out", e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-[var(--text-muted)]">Total price (RM)</span>
                <input
                  type="number"
                  min="0"
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                  value={form.total_price}
                  onChange={(e) => handleChange("total_price", e.target.value)}
                />
              </label>

              <button
                type="submit"
                className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-[var(--primary)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save booking"}
              </button>

              {error && (
                <p className="mt-2 text-[10px] text-amber-500">
                  {error} You can adjust policies later to unlock full bookings visibility.
                </p>
              )}
            </form>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[var(--text-strong)]">Recent bookings</h3>
              {loading && <span className="text-[10px] text-[var(--text-muted)]">Loading…</span>}
            </div>

            {recentFive.length === 0 && !loading ? (
              <p className="text-[10px] text-[var(--text-muted)]">
                Bookings created here will appear in this list and be highlighted in the calendar.
              </p>
            ) : (
              <ul className="space-y-1.5 text-[10px]">
                {recentFive.map((b) => (
                  <li key={b.id} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-[var(--text-strong)]">
                        {b.guest_name} · {getRoomTitle(b.room_id)}
                      </div>
                      <div className="text-[var(--text-muted)]">
                        {b.check_in} – {b.check_out}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <select
                        className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[9px]"
                        value={b.payment_status || "pending"}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="text-[9px] text-[var(--danger,#ef4444)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

