"use client";

import { useEffect, useMemo, useState } from "react";
import type { RoomSummary, BookingRow } from "./types";
import { eachDayOfInterval, format } from "date-fns";

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
  ic_number: string;
  price_mode: "default" | "promo";
  total_price: string;
  amount_paid: string;
  admin_notes: string;
  payment_status: string;
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
  package_name: "Basic Package",
  units_count: "0", // Start with 0 units selected
  ic_number: "",
  price_mode: "default",
  total_price: "0", // Start with RM0
  amount_paid: "",
  admin_notes: "",
  payment_status: "paid",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PALETTE = ["#DCE6FF", "#F9E1F3", "#FFE8D2", "#D9F3EB"];

const toKey = (date: Date) => {
  try {
    if (isNaN(date.getTime())) return "invalid";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch (e) {
    return "invalid";
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

const formatSelectedDatesAsRanges = (dates: string[]) => {
  if (dates.length === 0) return "";
  if (dates.length === 1) return formatDate(dates[0]);

  // Sort dates chronologically
  const sortedDates = [...dates].sort();
  const ranges: string[] = [];
  let currentRange: { start: string; end: string } | null = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const dateObj = new Date(date);
    const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;

    if (!currentRange) {
      currentRange = { start: date, end: date };
    } else if (nextDate) {
      const diffTime = nextDate.getTime() - dateObj.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentRange.end = date;
      } else {
        ranges.push(formatDateRange(currentRange.start, currentRange.end));
        currentRange = { start: date, end: date };
      }
    }
  }

  if (currentRange) {
    ranges.push(formatDateRange(currentRange.start, currentRange.end));
  }

  return ranges.join(", ");
};

const formatDateRange = (startDate: string, endDate: string) => {
  if (startDate === endDate) return formatDate(startDate);

  const [startYear, startMonth, startDay] = startDate.split("-");
  const [endYear, endMonth, endDay] = endDate.split("-");

  // If same month and year, format as "X-Y/M/YYYY"
  if (startYear === endYear && startMonth === endMonth) {
    return `${parseInt(startDay)}-${parseInt(endDay)}/${parseInt(startMonth)}/${startYear}`;
  }

  // Otherwise, format as "DD/MM/YYYY - DD/MM/YYYY"
  return `${formatDate(startDate)}-${formatDate(endDate)}`;
};

export function BookingsPanel() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BookingFormState>(emptyForm);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayBookings, setSelectedDayBookings] = useState<{ date: Date, bookings: BookingRow[] } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingRow | null>(null);
  const [discounts, setDiscounts] = useState<{ [key: string]: { roomId: number, percentage: number } }>({});
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [discountMode, setDiscountMode] = useState(false);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [txMonth, setTxMonth] = useState(new Date().getMonth());
  const [txYear, setTxYear] = useState(new Date().getFullYear());

  // Load discounts from database on mount
  useEffect(() => {
    async function loadDiscounts() {
      try {
        setDiscountsLoading(true);
        const response = await fetch('/api/discounts');
        const data = await response.json();

        if (data.discounts) {
          const discountsMap: { [key: string]: { roomId: number, percentage: number } } = {};
          data.discounts.forEach((discount: any) => {
            const dateKey = discount.discount_date;
            const roomId = discount.room_id;
            // Only add valid discounts with proper room_id
            if (roomId && typeof roomId === 'number' && roomId > 0) {
              const compositeKey = `${dateKey}_${roomId}`;
              discountsMap[compositeKey] = {
                roomId: roomId,
                percentage: discount.percentage
              };
            }
          });
          setDiscounts(discountsMap);
        }
      } catch (error) {
        console.warn('Failed to load discounts from database:', error);
      } finally {
        setDiscountsLoading(false);
      }
    }

    loadDiscounts();
  }, []);

  // Save discounts to database whenever they change
  useEffect(() => {
    async function saveDiscounts() {
      try {
        // Convert discounts map to API format
        const discountData = Object.entries(discounts).map(([compositeKey, discount]) => {
          const [date] = compositeKey.split('_');
          return {
            room_id: discount.roomId,
            discount_date: date,
            percentage: discount.percentage
          };
        }).filter(discount => {
          // Strict validation: room_id must be a positive number, discount_date must be valid, percentage must be > 0
          return discount.room_id &&
            typeof discount.room_id === 'number' &&
            discount.room_id > 0 &&
            discount.discount_date &&
            discount.percentage &&
            discount.percentage > 0;
        });

        if (discountData.length === 0) {
          return;
        }

        // Save each discount to database
        for (const discount of discountData) {
          await fetch('/api/discounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discount)
          });
        }
      } catch (error) {
        console.warn('Failed to save discounts to database:', error);
      }
    }

    // Only save if there are discounts to save
    if (Object.keys(discounts).length > 0) {
      saveDiscounts();
    }
  }, [discounts]);

  const todayKey = useMemo(() => toKey(new Date()), []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings');
        }

        if (isMounted) {
          setRooms(data.rooms || []);
          setBookings(data.bookings || []);
        }
      } catch (e: any) {
        console.warn("Unable to load bookings:", e.message);
        if (isMounted) {
          setError(
            "Bookings cannot be read with the current Supabase policies. You can still create new bookings via the public website."
          );
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

    const roomTitle = room.title.toLowerCase();

    let nights = 1;
    if (form.check_in && form.check_out) {
      const start = new Date(form.check_in);
      const end = new Date(form.check_out);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = diffDays > 0 ? diffDays : 1;
    }

    let subtotal = 0;
    if (roomTitle.includes("homestay 2")) {
      const selected = form.unit_name.split(", ").filter(Boolean);
      selected.forEach((u) => {
        if (u.includes("1") || u.includes("2")) subtotal += 350; // Lower Floor units
        else if (u.includes("3") || u.includes("4")) subtotal += 300; // Upper Floor units
      });
      if (selected.length === 0) subtotal = 0; // No units selected = RM0
    } else {
      let basePrice = Number(room.price || 0);
      if (form.package_name === "Basic Package" && room.basic_price) basePrice = Number(room.basic_price);
      if (form.package_name === "Full Package" && room.full_price) basePrice = Number(room.full_price);
      subtotal = basePrice * Math.max(1, Number(form.units_count || 1)); // At least 1 unit for non-homestay2
    }

    // Late check-out calculation
    const [hours, mins] = form.check_out_time.split(":").map(Number);
    let extraHours = 0;
    if (hours > 12 || (hours === 12 && mins > 0)) {
      extraHours = hours - 12 + (mins > 0 ? 1 : 0);
    }

    const isHomestay3or5 = roomTitle.includes("homestay 3") || roomTitle.includes("homestay 5");
    const lateFeeRate = isHomestay3or5 ? 20 : 10;
    const totalLateFee = extraHours * lateFeeRate;

    const computed = (subtotal * nights) + totalLateFee;

    // Apply discount if available
    let finalPrice = computed;
    if (form.check_in && form.check_out && form.room_id) {
      const checkInDate = new Date(form.check_in);
      const checkOutDate = new Date(form.check_out);
      const roomId = Number(form.room_id);
      const totalDiscountPercentage = calculateTotalDiscount(checkInDate, checkOutDate, roomId);
      const discountAmount = (computed * totalDiscountPercentage) / 100;
      finalPrice = Math.max(0, computed - discountAmount);
    }

    if (String(finalPrice) !== form.total_price) {
      setForm(prev => ({ ...prev, total_price: String(finalPrice) }));
    }
  }, [form.room_id, form.package_name, form.units_count, form.check_in, form.check_out, form.check_in_time, form.check_out_time, form.price_mode, rooms, form.unit_name]);

  // Ensure check-out is after check-in
  useEffect(() => {
    if (form.check_in && form.check_out) {
      if (form.check_out <= form.check_in) {
        const nextDay = new Date(form.check_in);
        nextDay.setDate(nextDay.getDate() + 1);
        setForm(prev => ({ ...prev, check_out: toKey(nextDay) }));
      }
    }
  }, [form.check_in, form.check_out]);

  const [wsText, setWsText] = useState("");

  const handleWhatsAppParse = () => {
    if (!wsText.trim()) return;
    const lines = wsText.split('\n');

    const updates: Partial<BookingFormState> = {};

    lines.forEach(line => {
      const part = line.includes(':') ? line.split(':') : line.split('=');
      if (part.length < 2) return;

      const key = part[0].trim().toLowerCase();
      const val = part.slice(1).join(':').trim(); // Join back in case of time in val

      if (key.includes('nama penuh')) updates.guest_name = val;
      if (key.includes('no. ic')) updates.ic_number = val;
      if (key.includes('no. tel')) updates.guest_email = val;
      if (key.includes('jenis homestay')) {
        const found = rooms.find(r => r.title.toLowerCase().includes(val.toLowerCase()));
        if (found) updates.room_id = String(found.id);
      }
      if (key.includes('tarikh')) {
        let checkInVal = "";
        let checkOutVal = "";

        // Handle shorthand pattern like "22-24/3/2026"
        const shorthandMatch = val.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})([/.-].+)$/);
        if (shorthandMatch) {
          const dayStart = shorthandMatch[1];
          const dayEnd = shorthandMatch[2];
          const tail = shorthandMatch[3]; // e.g. "/3/2026"
          checkInVal = `${dayStart}${tail}`;
          checkOutVal = `${dayEnd}${tail}`;
        } else {
          const dates = val.split(/to|until|(?<!\d)[-–]|[-–](?!\d)|(?<=\d)[-–](?=\d)|(?<=\d)[-–](?=\d)/i);
          // The regex above is tricky. Let's simplify.
          const rangeParts = val.split(/to|until/i);
          if (rangeParts.length >= 2) {
            checkInVal = rangeParts[0].trim();
            checkOutVal = rangeParts[1].trim();
          } else {
            // Try splitting by dash but only if it's acting as a separator between full dates or days
            const dashParts = val.split(/[-–]/);
            if (dashParts.length >= 2) {
              checkInVal = dashParts[0].trim();
              checkOutVal = dashParts[1].trim();

              // If checkIn is just a day and checkOut has month/year
              if (!checkInVal.includes('/') && !checkInVal.includes('-') && (checkOutVal.includes('/') || checkOutVal.includes('-'))) {
                const parts = checkOutVal.split(/[/-]/);
                if (parts.length === 3) {
                  checkInVal = `${checkInVal}/${parts[1]}/${parts[2]}`;
                }
              }
            } else {
              checkInVal = val.trim();
            }
          }
        }

        // Attempt to normalize DD/MM/YYYY to YYYY-MM-DD
        const normalizeDate = (d: string) => {
          if (!d) return "";
          const parts = d.split(/[/-]/);
          if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) year = `20${year}`;
            if (parts[0].length === 4) return d; // Already YYYY-MM-DD
            return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD/MM/YYYY
          }
          return d;
        };

        const normalizedCheckIn = normalizeDate(checkInVal);
        const normalizedCheckOut = checkOutVal ? normalizeDate(checkOutVal) : "";

        // Validate dates
        const isValidCheckIn = !isNaN(new Date(normalizedCheckIn).getTime());
        const isValidCheckOut = !normalizedCheckOut || !isNaN(new Date(normalizedCheckOut).getTime());

        if (isValidCheckIn) {
          updates.check_in = normalizedCheckIn;
        } else {
          alert(`Warning: Could not parse check-in date "${checkInVal}". Please enter manually.`);
        }
        if (isValidCheckOut && normalizedCheckOut) {
          updates.check_out = normalizedCheckOut;
        } else if (normalizedCheckOut) {
          alert(`Warning: Could not parse check-out date "${checkOutVal}". Please enter manually.`);
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setForm(prev => ({ ...prev, ...updates }));
      setWsText("");
      alert("Details translated and filled!");
    } else {
      alert("Could not find any matching fields in the pasted text.");
    }
  };

  const handleAdminUnitToggle = (unit: string) => {
    const currentUnits = form.unit_name ? form.unit_name.split(", ").filter(Boolean) : [];
    let newUnits;
    if (currentUnits.includes(unit)) {
      newUnits = currentUnits.filter(u => u !== unit);
    } else {
      newUnits = [...currentUnits, unit];
    }
    const unitName = newUnits.join(", ");
    const unitsCount = String(newUnits.length || 1);
    setForm(prev => ({ ...prev, unit_name: unitName, units_count: unitsCount }));
  };

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
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
        ic_number: form.ic_number,
        check_in: form.check_in,
        check_out: form.check_out,
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
        package_name: `${form.package_name || 'Standard Package'} (In: ${form.check_in_time}, Out: ${form.check_out_time})`,
        units_count: Number(form.units_count || 1),
        total_price: Number(form.total_price || 0),
        amount_paid: Number(form.amount_paid || 0),
        admin_notes: form.admin_notes || null,
        payment_status: form.payment_status || 'paid',
      };

      if (editingId) {
        const response = await fetch(`/api/bookings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId })
        });

        const data = await response.json();
        if (!response.ok) {
          alert(`Could not update booking: ${data.error}`);
          return;
        }
      } else {
        const response = await fetch(`/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          alert(`Could not create booking: ${data.error}`);
          return;
        }
      }

      setForm(emptyForm);
      setEditingId(null);

      // Refresh bookings list
      const refreshResponse = await fetch('/api/bookings');
      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        setBookings(refreshData.bookings || []);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (booking: BookingRow) => {
    let checkInTime = booking.check_in_time || "15:00";
    let checkOutTime = booking.check_out_time || "12:00";
    let purePackageName = booking.package_name || "Basic Package";

    // Clean package name if it still contains the legacy "In: XX, Out: YY" string
    if (purePackageName.includes(" (In: ")) {
      purePackageName = purePackageName.split(" (In: ")[0];
    }

    setForm({
      room_id: String(booking.room_id),
      unit_name: booking.unit_name || "",
      guest_name: booking.guest_name || "",
      guest_email: booking.guest_email || "",
      ic_number: booking.ic_number || "",
      check_in: booking.check_in || "",
      check_out: booking.check_out || "",
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      package_name: purePackageName,
      units_count: String(booking.units_count || 1),
      price_mode: "promo", // Default to promo for edits manually
      total_price: String(booking.total_price || 0),
      amount_paid: String(booking.amount_paid || 0),
      admin_notes: booking.admin_notes || "",
      payment_status: booking.payment_status || "paid",
    });
    setEditingId(booking.id);
    setSelectedDayBookings(null); // Close modal if open
    // Scroll to form
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStatusChange = async (id: number, payment_status: string) => {
    const previous = bookings;
    setBookings((current) => current.map((b) => (b.id === id ? { ...b, payment_status } : b)));

    const response = await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, payment_status })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Could not update status: ${data.error}`);
      setBookings(previous);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;

    const previous = bookings;
    setBookings((current) => current.filter((b) => b.id !== id));

    const response = await fetch(`/api/bookings?id=${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Could not delete booking: ${data.error}`);
      setBookings(previous);
    }
  };

  const getRoomTitle = (room_id: number | null) =>
    rooms.find((r) => r.id === room_id)?.title || "Unknown homestay";

  const getDiscountForDate = (day: Date, roomId: number) => {
    const dateKey = toKey(day);
    const compositeKey = `${dateKey}_${roomId}`;
    const discount = discounts[compositeKey];
    return discount ? discount.percentage : 0;
  };

  const calculateTotalDiscount = (checkIn: Date, checkOut: Date, roomId: number) => {
    const interval = eachDayOfInterval({ start: checkIn, end: checkOut });
    const discountPercentages = interval.map(d => getDiscountForDate(d, roomId)).filter(p => p > 0);

    // If there are any discounts, use the first (highest) percentage found
    // This ensures the same percentage is applied across all chosen dates
    return discountPercentages.length > 0 ? Math.max(...discountPercentages) : 0;
  };
  const handleDateSelection = (date: Date) => {
    // If discount mode is not active, show booking details instead
    if (!discountMode) {
      const dateKey = toKey(date);
      const dayBookings = bookingsByDay[dateKey] || [];
      if (dayBookings.length > 0) {
        setSelectedDayBookings({ date, bookings: dayBookings });
      }
      return;
    }

    // Discount mode: allow any date selection (not just dates with bookings)
    const dateKey = toKey(date);

    setSelectedDates(prev => {
      if (prev.includes(dateKey)) {
        return prev.filter(d => d !== dateKey);
      } else {
        return [...prev, dateKey];
      }
    });
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.includes(toKey(date));
  };

  const clearSelectedDates = () => {
    setSelectedDates([]);
  };

  const activateDiscountMode = () => {
    setDiscountMode(true);
  };

  const deactivateDiscountMode = () => {
    setDiscountMode(false);
  };

  // Handle click outside to deactivate discount mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is outside the calendar container
      const calendarContainer = document.getElementById('calendar-container');
      if (calendarContainer && !calendarContainer.contains(target)) {
        deactivateDiscountMode();
      }
    };

    if (discountMode) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [discountMode]);

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

    // Show 'paid' and 'pending' bookings on the calendar
    // 'pending' will be visually dimmed
    bookings.filter(b => b.payment_status === 'paid' || b.payment_status === 'pending').forEach((b) => {
      if (!b.check_in || !b.check_out) return;
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);

      const cursor = new Date(start);
      while (cursor < end) { // Changed to < to support same-day turnovers (Check-out day is free for check-in)
        const key = toKey(cursor);
        if (key !== "invalid") {
          if (!map[key]) map[key] = [];
          map[key].push(b);
        }
        cursor.setDate(cursor.getDate() + 1);
        if (cursor.getFullYear() > 2100) break; // Infinite loop protection
      }
      // Special case for 1rd day bookings if check-in = check-out (though unlikely)
      if (b.check_in === b.check_out) {
        const key = b.check_in;
        if (!map[key]) map[key] = [];
        map[key].push(b);
      }
    });

    return map;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!search.trim()) return bookings;
    const s = search.toLowerCase();
    return bookings.filter(b =>
      b.guest_name?.toLowerCase().includes(s) ||
      b.guest_email?.toLowerCase().includes(s) ||
      b.check_in?.includes(s) ||
      b.check_out?.includes(s) ||
      getRoomTitle(b.room_id).toLowerCase().includes(s) ||
      b.unit_name?.toLowerCase().includes(s)
    );
  }, [bookings, search]);

  const recentFive = filteredBookings.slice(0, 10); // Show more if searching

  const transactions = useMemo(() => {
    return bookings
      .filter(b => b.billplz_id && b.payment_status === 'paid')
      .filter(b => {
        const d = new Date(b.created_at);
        return d.getMonth() === txMonth && d.getFullYear() === txYear;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bookings, txMonth, txYear]);

  const totalTxAmount = transactions.reduce((sum, tx) => sum + (tx.amount_paid || 0), 0);

  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">Bookings calendar</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            A monthly view that uses soft colours to show busy days and gaps so you can quickly spot vacancies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => setMonthOffset((v) => v - 1)}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--surface)_80%,white_20%)]"
          >
            ←
          </button>
          <span className="min-w-[8rem] text-center font-semibold text-[var(--text-strong)] text-base">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setMonthOffset((v) => v + 1)}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--surface)_80%,white_20%)]"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)]">
        <div id="calendar-container" className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {DAY_LABELS.map((label) => (
              <div key={label} className="px-2 py-1 text-center">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {calendarCells.map(({ date, inCurrentMonth }) => {
              const key = toKey(date);
              const dayBookings = bookingsByDay[key] || [];
              const isToday = key === todayKey;
              const isPast = key < todayKey;

              return (
                <div
                  key={key + String(inCurrentMonth)}
                  onClick={() => {
                    handleDateSelection(date);
                  }}
                  className={`flex min-h-[5.5rem] flex-col rounded-xl border px-2 py-2 ${inCurrentMonth
                    ? "border-[var(--border-subtle)] bg-[var(--surface)]"
                    : "border-transparent bg-[color-mix(in_srgb,var(--surface)_90%,white_10%)] text-[var(--text-muted)] opacity-60"
                    } ${discountMode
                      ? 'cursor-pointer hover:border-green-500 shadow-sm transition-all hover:-translate-y-0.5'
                      : (dayBookings.length > 0 ? 'cursor-pointer hover:border-[var(--primary)] shadow-sm transition-all hover:-translate-y-0.5' : 'cursor-default')
                    } ${isPast ? 'opacity-30 grayscale-[0.8] pointer-events-none bg-[var(--surface-dark)]' : ''} ${isDateSelected(date) ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                >
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span
                      className={
                        isToday ? "rounded-full bg-[var(--primary)] px-2 py-1 text-[11px] text-white font-bold" : "font-medium"
                      }
                    >
                      {date.getDate()}
                    </span>
                    <div className="flex items-center gap-1">
                      {dayBookings.length > 0 && (
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent_88%)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase tracking-tight">
                          {dayBookings.length} stay{dayBookings.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    {dayBookings.slice(0, 2).map((b) => {
                      const colorIndex = (b.room_id || 0) % PALETTE.length;
                      const bg = PALETTE[colorIndex];
                      const isPending = b.payment_status === 'pending';
                      const discountPercentage = getDiscountForDate(date, b.room_id || 0);
                      return (
                        <div
                          key={b.id}
                          className={`truncate rounded-md px-2 py-1 text-[10px] font-semibold text-[var(--text-strong)] shadow-sm ${isPending ? 'opacity-40 grayscale-[0.5]' : ''}`}
                          style={{ backgroundColor: bg }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`}
                            </span>
                            {discountPercentage > 0 && (
                              <span className="text-green-700 font-bold text-[9px] ml-1">
                                -{discountPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {dayBookings.length > 2 && (
                      <span className="text-[10px] font-medium text-[var(--text-muted)] pl-1">
                        +{dayBookings.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legitimate Transactions List */}
          <div id="transactions-list" className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--text-strong)] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Legitimate Transactions
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">Verified digital payments via Billplz gateway.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)]"
                  value={txMonth}
                  onChange={(e) => setTxMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)]"
                  value={txYear}
                  onChange={(e) => setTxYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/70">Monthly Revenue</span>
                <span className="text-xl font-black text-[var(--primary)]">RM {totalTxAmount.toFixed(2)}</span>
              </div>
              <div className="mt-1 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                {transactions.length} verified transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs text-[var(--text-muted)] italic">No transactions found for this period.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedBookingDetail(tx)}
                      className="group relative flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-white hover:border-[var(--primary)] transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-all" />
                      <div className="min-w-0 pr-4">
                        <div className="text-[11px] font-bold text-[var(--text-strong)] truncate">{tx.guest_name}</div>
                        <div className="text-[9px] font-medium text-[var(--text-muted)] mt-0.5">
                          {getRoomTitle(tx.room_id)} • {formatDate(tx.check_in)}
                        </div>
                        <div className="text-[8px] text-[var(--text-muted)] mt-1 font-mono">{tx.billplz_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-[var(--text-strong)]">RM {(tx.amount_paid || 0).toFixed(2)}</div>
                        <div className="text-[8px] font-bold text-green-600 uppercase tracking-tighter mt-1 bg-green-50 px-1.5 py-0.5 rounded leading-none border border-green-100 inline-block">SUCCESS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div id="booking-form" className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-6 space-y-3">
              <h2 className="text-xl font-black text-[var(--text-strong)] uppercase tracking-tight">{editingId ? "Edit booking" : "Create a booking"}</h2>

              {/* WhatsApp Autocomplete Section */}
              <div className="rounded-2xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 transition-all hover:border-[var(--primary)]/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)]">WhatsApp Autocomplete</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-3 leading-tight font-medium">
                  Paste the details from WhatsApp (Tarikh, Nama Penuh, No. Ic, No. Tel, Jenis homestay) to auto-fill the form!
                  <br /><span className="opacity-70">Example: Tarikh: 22-24/3/2026, Nama Penuh: John, No. Ic: 000000000000, No. Tel: 0123456789</span>
                </p>
                <textarea
                  className="w-full rounded-xl border-2 border-[var(--border-subtle)] bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-[var(--primary)] min-h-[80px]"
                  placeholder="Paste WhatsApp message here..."
                  value={wsText}
                  onChange={(e) => setWsText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleWhatsAppParse}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                >
                  Translate & Auto-Fill
                </button>
              </div>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {editingId ? "Update existing reservation details." : "Record phone, WhatsApp or walk‑in reservations manually."}
              </p>
            </div>

            <form onSubmit={handleSave} className="mt-5 grid gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Homestay</span>
                  <select
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all"
                    value={form.room_id}
                    onChange={(e) => {
                      handleChange("room_id", e.target.value);
                      handleChange("unit_name", ""); // Reset unit on room change
                    }}
                    required
                  >
                    <option value="">Select homestay</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Unit (if any)</span>
                  {(() => {
                    const roomTitle = rooms.find(r => r.id === Number(form.room_id))?.title.toLowerCase() || "";
                    const isMultiUnit = roomTitle.includes("homestay 2") || roomTitle.includes("homestay 4") || roomTitle.includes("homestay 6");

                    if (isMultiUnit) {
                      const selected = form.unit_name.split(", ").filter(Boolean);
                      if (roomTitle.includes("homestay 2")) {
                        const lower = ["Unit 1 (Left)", "Unit 2 (Right)"];
                        const upper = ["Unit 3 (Left)", "Unit 4 (Right)"];
                        return (
                          <div className="space-y-4 py-2">
                            <div>
                              <p className="text-[10px] font-black uppercase text-[var(--primary)] mb-2 opacity-60">Lower Floor (RM350)</p>
                              <div className="flex flex-wrap gap-2">
                                {lower.map(u => (
                                  <button key={u} type="button" onClick={() => handleAdminUnitToggle(u)}
                                    className={`px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight transition-all ${selected.includes(u)
                                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg translate-y-[-1px]"
                                      : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--primary)]"}`}
                                  > {u} </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-[var(--primary)] mb-2 opacity-60">Upper Floor (RM300)</p>
                              <div className="flex flex-wrap gap-2">
                                {upper.map(u => (
                                  <button key={u} type="button" onClick={() => handleAdminUnitToggle(u)}
                                    className={`px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight transition-all ${selected.includes(u)
                                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg translate-y-[-1px]"
                                      : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--primary)]"}`}
                                  > {u} </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      let allUnits: string[] = [];
                      if (roomTitle.includes("homestay 4")) allUnits = ["Unit Right", "Unit Left"];
                      else if (roomTitle.includes("homestay 6")) allUnits = ["Unit Right", "Unit Left", "Main Unit"];

                      return (
                        <div className="flex flex-wrap gap-2 py-2">
                          {allUnits.map(u => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => handleAdminUnitToggle(u)}
                              className={`px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight transition-all ${selected.includes(u)
                                ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg translate-y-[-2px]"
                                : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:bg-white"
                                }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <select
                        className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                        value={form.unit_name}
                        onChange={(e) => handleChange("unit_name", e.target.value)}
                      >
                        <option value="">No unit</option>
                      </select>
                    );
                  })()}
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Guest Name</span>
                <input
                  className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                  value={form.guest_name}
                  onChange={(e) => handleChange("guest_name", e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Guest Phone</span>
                <input
                  type="tel"
                  className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                  value={form.guest_email}
                  onChange={(e) => handleChange("guest_email", e.target.value)}
                  placeholder="0123456789"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">IC Number</span>
                <input
                  className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                  value={form.ic_number}
                  onChange={(e) => handleChange("ic_number", e.target.value)}
                  placeholder="000000000000"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Check-in</span>
                  <input
                    type="date"
                    min={todayKey}
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.check_in}
                    onChange={(e) => handleChange("check_in", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Check-out</span>
                  <input
                    type="date"
                    min={form.check_in ? (() => {
                      const d = new Date(form.check_in);
                      d.setDate(d.getDate() + 1);
                      return toKey(d);
                    })() : todayKey}
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.check_out}
                    onChange={(e) => handleChange("check_out", e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Time In (Min 15:00)</span>
                  <input
                    type="time"
                    min="15:00"
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.check_in_time}
                    onChange={(e) => handleChange("check_in_time", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Time Out</span>
                  <input
                    type="time"
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.check_out_time}
                    onChange={(e) => handleChange("check_out_time", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1">
                <label className={`flex flex-col gap-1.5 ${rooms.find(r => r.id === Number(form.room_id))?.title.toLowerCase().includes("homestay 2") ? 'hidden' : ''}`}>
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Package</span>
                  <select
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.package_name}
                    onChange={(e) => handleChange("package_name", e.target.value)}
                  >
                    {(() => {
                      const room = rooms.find(r => r.id === Number(form.room_id));
                      const title = room?.title.toLowerCase() || "";
                      if (title.includes("homestay 2")) return null;
                      return (
                        <>
                          <option value="Basic Package">Basic Package</option>
                          <option value="Full Package">Full Package</option>
                        </>
                      );
                    })()}
                  </select>
                </label>
              </div>

              {/* Discount Management Section */}
              <div id="discount-management-section" className={`rounded-2xl border-2 border-dashed p-4 transition-all ${discountMode ? 'border-green-500/50 bg-green-50/50' : 'border-green-500/30 bg-green-50/30 hover:border-green-500/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-green-600">Homestay Discounts</span>
                </div>
                <p className="text-[10px] text-green-700 mb-3 leading-tight font-medium">
                  {discountsLoading ? 'Loading discounts...' : (discountMode ? 'Click any calendar dates to select for discount. Click outside to cancel.' : 'Select homestay to activate discount selection mode.')}
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2" onClick={() => activateDiscountMode()}>
                    <select
                      className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-medium focus:border-green-500 outline-none"
                      id="discount-room"
                      value={selectedRoomId || ''}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        activateDiscountMode();
                      }}
                      onChange={(e) => {
                        const roomId = e.target.value ? Number(e.target.value) : null;
                        setSelectedRoomId(roomId);
                        if (roomId) {
                          activateDiscountMode();
                        } else {
                          deactivateDiscountMode();
                        }
                      }}
                    >
                      <option value="">Select Homestay</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.title}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Discount %"
                      className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-medium focus:border-green-500 outline-none"
                      id="discount-percentage"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        activateDiscountMode();
                      }}
                    />
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="rounded-lg bg-green-100 p-2 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-green-700">
                          {formatSelectedDatesAsRanges(selectedDates)}
                        </span>
                        <button
                          type="button"
                          onClick={clearSelectedDates}
                          className="text-[10px] text-green-600 hover:text-green-800 font-medium"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const percentageInput = document.getElementById('discount-percentage') as HTMLInputElement;
                      const roomId = selectedRoomId;
                      const percentage = Number(percentageInput.value);

                      if (!roomId) {
                        alert('Please select a homestay');
                        return;
                      }
                      if (selectedDates.length === 0) {
                        alert('Please select dates from the calendar first');
                        return;
                      }
                      if (percentage <= 0 || percentage > 100) {
                        alert('Please enter a valid percentage (1-100)');
                        return;
                      }

                      const newDiscounts: { [key: string]: { roomId: number, percentage: number } } = {};
                      selectedDates.forEach(date => {
                        const compositeKey = `${date}_${roomId}`;
                        newDiscounts[compositeKey] = { roomId, percentage };
                      });

                      // Save discounts first
                      const updatedDiscounts = { ...discounts, ...newDiscounts };
                      setDiscounts(updatedDiscounts);

                      // Update localStorage for immediate feedback across components if on same browser
                      localStorage.setItem('homestay-discounts', JSON.stringify(updatedDiscounts));

                      // Then clear UI state after a small delay
                      setTimeout(() => {
                        clearSelectedDates();
                        setSelectedRoomId(null);
                        percentageInput.value = '';
                      }, 100);
                      // Don't deactivate mode immediately - let user see the applied discounts
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
                    disabled={selectedDates.length === 0}
                  >
                    Apply Discount to {selectedDates.length} {selectedDates.length === 1 ? 'Date' : 'Dates'}
                  </button>
                  <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                    {Object.entries(discounts).sort((a, b) => a[0].localeCompare(b[0])).map(([compositeKey, discount]) => {
                      const [date] = compositeKey.split('_');
                      const room = rooms.find(r => r.id === discount.roomId);
                      return (
                        <span key={compositeKey} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700">
                          {formatDate(date)}: {room?.title || 'Unknown'} -{discount.percentage}%
                          <button
                            type="button"
                            onClick={async () => {
                              // Then delete from database
                              try {
                                await fetch('/api/discounts', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    discount_date: date,
                                    room_id: discount.roomId
                                  })
                                });
                              } catch (error) {
                                console.warn('Failed to delete discount from database:', error);
                              }

                              // Remove from local state
                              setDiscounts(prev => {
                                const newDiscounts = { ...prev };
                                delete newDiscounts[compositeKey];
                                // Sync local storage too
                                localStorage.setItem('homestay-discounts', JSON.stringify(newDiscounts));
                                return newDiscounts;
                              });
                            }}
                            className="text-green-500 hover:text-green-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Payment Status</span>
                  <select
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.payment_status}
                    onChange={(e) => handleChange("payment_status", e.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Amount Paid (RM)</span>
                  <input
                    type="number"
                    min="0"
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.amount_paid}
                    onChange={(e) => handleChange("amount_paid", e.target.value)}
                    placeholder="e.g. 100 or 0 for notes"
                  />
                </label>
              </div>

              <div className="grid grid-cols-[1.5fr_2fr] gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Price Mode</span>
                  <select
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium focus:border-[var(--primary)] outline-none transition-all"
                    value={form.price_mode}
                    onChange={(e) => handleChange("price_mode", e.target.value as "default" | "promo")}
                  >
                    <option value="default">Default Price</option>
                    <option value="promo">Promo / Custom</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                    Total Price (RM) {form.price_mode === "default" && "(Auto)"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={form.price_mode === "default"}
                    className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3.5 text-base font-medium disabled:opacity-50 focus:border-[var(--primary)] outline-none transition-all"
                    value={form.total_price}
                    onChange={(e) => handleChange("total_price", e.target.value)}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Admin Notes</span>
                <textarea
                  rows={2}
                  className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
                  value={form.admin_notes}
                  onChange={(e) => handleChange("admin_notes", e.target.value)}
                  placeholder="Additional notes for this booking..."
                />
              </label>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-4 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-[color-mix(in_srgb,var(--primary)_90%,black_10%)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving…" : editingId ? "Update Booking" : "Save Booking"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyForm);
                      setEditingId(null);
                    }}
                    className="rounded-2xl border-2 border-[var(--border-subtle)] px-6 py-5 text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-2 text-[10px] text-amber-500 font-medium">
                  {error}
                </p>
              )}
            </form>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--text-strong)] uppercase tracking-widest">Recent Bookings</h3>
                {loading && <span className="text-xs text-[var(--text-muted)] animate-pulse">Loading…</span>}
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search name, date, homestay..."
                  className="w-full rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-medium focus:border-[var(--primary)] outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
              </div>
            </div>

            {recentFive.length === 0 && !loading ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                No recent bookings found.
              </p>
            ) : (
              <ul className="space-y-3 text-xs">
                {recentFive.map((b) => (
                  <li
                    key={b.id}
                    onClick={() => setSelectedBookingDetail(b)}
                    className={`flex items-start justify-between gap-3 p-3 rounded-xl border border-[var(--border-subtle)] transition-all hover:border-[var(--primary)] cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${b.payment_status === 'pending' ? 'bg-[color-mix(in_srgb,var(--surface)_95%,black_5%)] opacity-70' : 'bg-[var(--surface-elevated)]'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--text-strong)] truncate">
                        {b.guest_name}
                      </div>
                      <div className="text-[var(--text-muted)] text-[10px] mt-0.5">
                        {getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`}
                      </div>
                      <div className="text-[var(--text-muted)] mt-1 font-medium">
                        {formatDate(b.check_in)} – {formatDate(b.check_out)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-[10px] font-bold outline-none focus:border-[var(--primary)]"
                        value={b.payment_status || "pending"}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(b)}
                          className="text-[10px] font-bold text-[var(--primary)] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
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
                Bookings for {formatDate(toKey(selectedDayBookings.date))}
              </h3>
              <button onClick={() => setSelectedDayBookings(null)} className="text-[var(--text-muted)] hover:text-[var(--text-strong)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedDayBookings.bookings.map(b => {
                const colorIndex = (b.room_id || 0) % PALETTE.length;
                const bg = PALETTE[colorIndex];
                return (
                  <div key={b.id}
                    className={`rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm transition-all ${b.payment_status === 'pending' ? 'opacity-60 grayscale-[0.3]' : ''}`}
                    style={{ backgroundColor: bg }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-sm text-[var(--text-strong)]">{getRoomTitle(b.room_id)} {b.unit_name && `(${b.unit_name})`}</span>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-white/40 shadow-sm text-gray-700`}>
                          {b.payment_status}
                        </span>
                        <button
                          onClick={() => handleEdit(b)}
                          className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="text-sm space-y-2 text-[var(--text-muted)]">
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Guest:</span> <span>{b.guest_name}</span></p>
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Phone:</span> <span>{b.guest_email}</span></p>
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">IC:</span> <span>{b.ic_number || 'N/A'}</span></p>
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Package:</span> <span>{b.package_name || 'Standard Package'}</span></p>
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Stay:</span> <span>{formatDate(b.check_in)} – {formatDate(b.check_out)}</span></p>
                      <p className="flex justify-between"><span className="font-semibold text-[var(--text-strong)]">Price:</span> <span>RM {b.total_price}</span></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Individual Booking Detail Modal */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBookingDetail(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-2xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-[var(--text-strong)] uppercase tracking-tight">Booking Details</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium">Record ID: #{selectedBookingDetail.id}</p>
              </div>
              <button onClick={() => setSelectedBookingDetail(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div className="col-span-2 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Homestay</p>
                <p className="text-base font-bold text-[var(--text-strong)]">{getRoomTitle(selectedBookingDetail.room_id)} {selectedBookingDetail.unit_name && `(${selectedBookingDetail.unit_name})`}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Guest Name</p>
                <p className="font-bold text-[var(--text-strong)]">{selectedBookingDetail.guest_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">WhatsApp Number</p>
                <p className="font-bold text-[var(--text-strong)]">{selectedBookingDetail.guest_email}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Check-in</p>
                <p className="font-bold text-[var(--text-strong)]">{formatDate(selectedBookingDetail.check_in)} ({selectedBookingDetail.check_in_time || '15:00'})</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Check-out</p>
                <p className="font-bold text-[var(--text-strong)]">{formatDate(selectedBookingDetail.check_out)} ({selectedBookingDetail.check_out_time || '12:00'})</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Price</p>
                <p className="text-lg font-black text-[var(--text-strong)]">RM {selectedBookingDetail.total_price}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${selectedBookingDetail.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {selectedBookingDetail.payment_status}
                </span>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Amount Paid (Record)</p>
                  <p className="font-black text-blue-800">RM {selectedBookingDetail.amount_paid || 0}</p>
                </div>
                {selectedBookingDetail.billplz_id && (
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-green-100/50 rounded-md border border-green-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-tighter">Billplz Verified</span>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Admin Notes</p>
                <p className="text-sm font-medium text-[var(--text-strong)] bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                  {selectedBookingDetail.admin_notes || "No additional notes."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  handleEdit(selectedBookingDetail);
                  setSelectedBookingDetail(null);
                }}
                className="flex-1 py-3.5 rounded-xl bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Edit Record
              </button>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="flex-1 py-3.5 rounded-xl border-2 border-[var(--border-subtle)] text-[var(--text-strong)] text-xs font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
