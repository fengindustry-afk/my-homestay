"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RoomSummary, BookingRow } from "./types";

type BookingFormState = {
  room_id: string;
  unit_name: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  check_in_time: string;
  check_out_time: string;
  package_name: string;
  units_count: string;
  price_mode: "default" | "promo";
  total_price: string;
};

const emptyForm: BookingFormState = {
  room_id: "",
  unit_name: "",
  guest_name: "",
  guest_email: "",
  check_in: "",
  check_out: "",
  check_in_time: "15:00",
  check_out_time: "12:00",
  package_name: "Room Only",
  units_count: "1",
  price_mode: "default",
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
  const [selectedDayBookings, setSelectedDayBookings] = useState<{ date: Date, bookings: BookingRow[] } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          supabase.from("rooms").select("id,title,price,basic_price,full_price"),
          supabase
            .from("bookings")
            .select(
              "id,room_id,unit_name,guest_name,guest_email,check_in,check_out,total_price,package_name,units_count,payment_status,created_at"
            )
            .neq('payment_status', 'pending')
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

  useEffect(() => {
    // Auto-calculate price
    if (form.price_mode !== "default") return;

    const roomIdNum = Number(form.room_id);
    const room = rooms.find(r => r.id === roomIdNum);
    if (!room) return;

    let basePrice = room.price || 0;
    const title = room.title.toLowerCase();
    if (title.includes("homestay 2")) {
      if (form.package_name.includes("Lower")) basePrice = 350;
      else if (form.package_name.includes("Upper")) basePrice = 300;
    } else if (form.package_name === "Basic Package") {
      basePrice = room.basic_price || basePrice;
    } else if (form.package_name === "Full Package") {
      basePrice = room.full_price || basePrice;
    }

    let nights = 1;
    if (form.check_in && form.check_out) {
      const start = new Date(form.check_in);
      const end = new Date(form.check_out);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = diffDays > 0 ? diffDays : 1;
    }

    // Late check-out calculation
    const [hours, mins] = form.check_out_time.split(":").map(Number);
    let extraHours = 0;
    if (hours > 12 || (hours === 12 && mins > 0)) {
      extraHours = hours - 12 + (mins > 0 ? 1 : 0);
    }

    const isHomestay3or5 = room.title.toLowerCase().includes("homestay 3") || room.title.toLowerCase().includes("homestay 5");
    const lateFeeRate = isHomestay3or5 ? 20 : 10;
    const totalLateFee = extraHours * lateFeeRate;

    const units = Number(form.units_count) || 1;
    const computed = (basePrice * units * nights) + totalLateFee;

    if (String(computed) !== form.total_price) {
      setForm(prev => ({ ...prev, total_price: String(computed) }));
    }
  }, [form.room_id, form.package_name, form.units_count, form.check_in, form.check_out, form.check_in_time, form.check_out_time, form.price_mode, rooms]);

  // Sync unit when package changes (Homestay 2)
  useEffect(() => {
    const room = rooms.find(r => r.id === Number(form.room_id));
    if (room?.title.toLowerCase().includes("homestay 2")) {
      const possibleUnits: string[] = [];
      if (form.package_name.includes("Unit 1")) possibleUnits.push("Unit 1 (Left)");
      else if (form.package_name.includes("Unit 2")) possibleUnits.push("Unit 2 (Right)");
      else if (form.package_name.includes("Unit 3")) possibleUnits.push("Unit 3 (Left)");
      else if (form.package_name.includes("Unit 4")) possibleUnits.push("Unit 4 (Right)");

      if (possibleUnits.length === 1 && form.unit_name !== possibleUnits[0]) {
        setForm(prev => ({ ...prev, unit_name: possibleUnits[0] }));
      }
    }
  }, [form.package_name, form.room_id, rooms]);

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
        unit_name: form.unit_name || null,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        check_in: form.check_in,
        check_out: form.check_out,
        package_name: `${form.package_name || 'Room Only'} (In: ${form.check_in_time}, Out: ${form.check_out_time})`,
        units_count: Number(form.units_count || 1),
        total_price: Number(form.total_price || 0),
        payment_status: 'paid', // Default to paid for manual admin entries
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
          "id,room_id,unit_name,guest_name,guest_email,check_in,check_out,total_price,package_name,units_count,payment_status,created_at"
        )
        .neq('payment_status', 'pending')
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

    // Only show 'paid' bookings on the calendar to avoid showing abandoned transactions
    bookings.filter(b => b.payment_status === 'paid').forEach((b) => {
      if (!b.check_in || !b.check_out) return;
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);

      const cursor = new Date(start);
      while (cursor <= end) {
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
                  onClick={() => dayBookings.length > 0 && setSelectedDayBookings({ date, bookings: dayBookings })}
                  className={`flex min-h-[4.75rem] flex-col rounded-lg border px-1.5 py-1 ${inCurrentMonth
                    ? "border-[var(--border-subtle)] bg-[var(--surface)]"
                    : "border-transparent bg-[color-mix(in_srgb,var(--surface)_90%,white_10%)] text-[var(--text-muted)] opacity-60"
                    } ${dayBookings.length > 0 ? 'cursor-pointer hover:border-[var(--primary)] transition-colors' : ''}`}
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
                          {getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`} · {b.guest_name}
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
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Room</span>
                  <select
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.room_id}
                    onChange={(e) => {
                      handleChange("room_id", e.target.value);
                      handleChange("unit_name", ""); // Reset unit on room change
                    }}
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
                  <span className="font-medium text-[var(--text-muted)]">Unit (if any)</span>
                  <select
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.unit_name}
                    onChange={(e) => handleChange("unit_name", e.target.value)}
                  >
                    <option value="">No unit</option>
                    {(() => {
                      const roomTitle = rooms.find(r => r.id === Number(form.room_id))?.title.toLowerCase() || "";
                      const pkg = form.package_name;
                      if (roomTitle.includes("homestay 2")) {
                        if (pkg.includes("Unit 1")) return <option value="Unit 1 (Left)">Unit 1 (Left)</option>;
                        if (pkg.includes("Unit 2")) return <option value="Unit 2 (Right)">Unit 2 (Right)</option>;
                        if (pkg.includes("Unit 3")) return <option value="Unit 3 (Left)">Unit 3 (Left)</option>;
                        if (pkg.includes("Unit 4")) return <option value="Unit 4 (Right)">Unit 4 (Right)</option>;

                        if (pkg.includes("Lower")) return ["Unit 1 (Left)", "Unit 2 (Right)"].map(u => <option key={u} value={u}>{u}</option>);
                        if (pkg.includes("Upper")) return ["Unit 3 (Left)", "Unit 4 (Right)"].map(u => <option key={u} value={u}>{u}</option>);
                        return ["Unit 1 (Left)", "Unit 2 (Right)", "Unit 3 (Left)", "Unit 4 (Right)"].map(u => <option key={u} value={u}>{u}</option>);
                      }
                      if (roomTitle.includes("homestay 4")) return ["Unit Right", "Unit Left"].map(u => <option key={u} value={u}>{u}</option>);
                      if (roomTitle.includes("homestay 6")) return ["Unit Right", "Unit Left", "Main Unit"].map(u => <option key={u} value={u}>{u}</option>);
                      return null;
                    })()}
                  </select>
                </label>
              </div>

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
                <span className="font-medium text-[var(--text-muted)]">Guest phone</span>
                <input
                  type="tel"
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                  value={form.guest_email}
                  onChange={(e) => handleChange("guest_email", e.target.value)}
                  placeholder="+60123456789"
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
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Time In</span>
                  <input
                    type="time"
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.check_in_time}
                    onChange={(e) => handleChange("check_in_time", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Time Out</span>
                  <input
                    type="time"
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.check_out_time}
                    onChange={(e) => handleChange("check_out_time", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Package</span>
                  <select
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.package_name}
                    onChange={(e) => handleChange("package_name", e.target.value)}
                  >
                    {(() => {
                      const room = rooms.find(r => r.id === Number(form.room_id));
                      const title = room?.title.toLowerCase() || "";
                      if (title.includes("homestay 2")) {
                        return (
                          <>
                            <option value="Lower Floor - Unit 1 (Left)">Lower Floor - Unit 1 (Left)</option>
                            <option value="Lower Floor - Unit 2 (Right)">Lower Floor - Unit 2 (Right)</option>
                            <option value="Upper Floor - Unit 3 (Left)">Upper Floor - Unit 3 (Left)</option>
                            <option value="Upper Floor - Unit 4 (Right)">Upper Floor - Unit 4 (Right)</option>
                          </>
                        );
                      }
                      return (
                        <>
                          <option value="Room Only">Room Only</option>
                          <option value="Basic Package">Basic Package</option>
                          <option value="Full Package">Full Package</option>
                        </>
                      );
                    })()}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Units</span>
                  <input
                    type="number"
                    min="1"
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.units_count}
                    onChange={(e) => handleChange("units_count", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">Price Mode</span>
                  <select
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1"
                    value={form.price_mode}
                    onChange={(e) => handleChange("price_mode", e.target.value as "default" | "promo")}
                  >
                    <option value="default">Default Price</option>
                    <option value="promo">Promo / Custom</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--text-muted)]">
                    Total price (RM) {form.price_mode === "default" && "(Auto)"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={form.price_mode === "default"}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1 disabled:opacity-50"
                    value={form.total_price}
                    onChange={(e) => handleChange("total_price", e.target.value)}
                  />
                </label>
              </div>

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
                  <li key={b.id} className={`flex items-start justify-between gap-2 p-2 rounded-lg transition-colors ${b.payment_status !== 'paid' ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
                    <div>
                      <div className="font-medium text-[var(--text-strong)]">
                        {b.guest_name} · {getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`} {b.package_name && b.package_name !== "Room Only" && `[${b.package_name}]`}
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

      {/* Bookings Modal Popup */}
      {selectedDayBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDayBookings(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-2xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--text-strong)]">
                Bookings for {selectedDayBookings.date.toLocaleDateString()}
              </h3>
              <button onClick={() => setSelectedDayBookings(null)} className="text-[var(--text-muted)] hover:text-[var(--text-strong)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedDayBookings.bookings.map(b => (
                <div key={b.id} className="rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm bg-[var(--surface-elevated)]">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm text-[var(--text-strong)]">{getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : b.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {b.payment_status}
                    </span>
                  </div>
                  <div className="text-sm space-y-2 text-[var(--text-muted)]">
                    <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Guest:</span> <span>{b.guest_name}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Phone:</span> <span>{b.guest_email}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Package:</span> <span>{b.package_name || 'Room Only'}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Stay:</span> <span>{b.check_in} – {b.check_out}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Price:</span> <span>RM {b.total_price}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
