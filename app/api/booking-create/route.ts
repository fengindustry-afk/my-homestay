import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePrice } from '@/lib/price-utils';
import { readJsonBody } from '@/lib/readJsonBody';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: body, error: bodyError } = await readJsonBody<any>(req);
    if (bodyError) return bodyError;
    const {
      listingId,
      guestPhone,
      guestName,
      checkIn,
      checkOut,
      unitName,
      packageName,
      checkInTime,
      checkOutTime,
      unitsCount,
      addOns
    } = body;

    if (!listingId || !guestPhone || !guestName || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch Room Details and Discounts from Database for Price Verification
    const [roomRes, discountsRes] = await Promise.all([
      supabase.from('rooms').select('id, title, price, basic_price, full_price').eq('id', listingId).single(),
      supabase.from('discounts').select('room_id, discount_date, percentage').eq('room_id', listingId).eq('is_deleted', false)
    ]);

    if (roomRes.error || !roomRes.data) {
      return NextResponse.json({ error: "Invalid room selected" }, { status: 400 });
    }

    // Multi-unit rooms (same titles as BookingModal isMultiUnitRoom) must name a unit.
    // shortcut: title match duplicates the modal list, move to a DB column when one exists.
    if (/homestay (2|4|6)/i.test(roomRes.data.title) && !unitName) {
      return NextResponse.json({ error: "Unit is required for this homestay" }, { status: 400 });
    }

    // 1b. Check for exact Time-Based Overlaps
    const { data: overlappingBookings } = await supabase
      .from('bookings')
      .select('id, unit_name')
      .eq('room_id', listingId)
      .in('payment_status', ['paid', 'confirmed'])
      .lt('check_in', checkOut) // Quick date filter first
      .gt('check_out', checkIn);

    if (overlappingBookings && overlappingBookings.length > 0) {
      // Precise check for specific units and full timestamps
      const hasConflict = overlappingBookings.some(booking => {
        // If units match, check times
        const unitsMatch = !unitName || !booking.unit_name ||
          unitName.split(',').some((u: string) => booking.unit_name.includes(u.trim()));

        if (unitsMatch) {
          // This confirms the "Two customers, same day" logic:
          // Conflict only if (RequestStart < ExistingEnd) AND (RequestEnd > ExistingStart)
          return true; // Simple date overlap is a conflict for now; we'll refine with full timestamps if columns exist
        }
        return false;
      });

      if (hasConflict) {
        return NextResponse.json({ error: "The selected unit/time is no longer available." }, { status: 400 });
      }
    }

    // 2. Recalculate Price on Server
    const serverPrice = calculatePrice({
      room: roomRes.data,
      checkIn,
      checkOut,
      selectedUnit: unitName,
      selectedPackage: packageName,
      unitsCount: Number(unitsCount || 1),
      checkInTime,
      checkOutTime,
      addOns,
      discounts: discountsRes.data || []
    });

    // SECURITY: always use server price
    const finalPrice = serverPrice;

    // 3. Create a pending booking in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: listingId,
        guest_name: guestName,
        guest_email: guestPhone,
        ic_number: null,
        check_in: checkIn,
        check_out: checkOut,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        total_price: finalPrice,
        payment_status: 'pending',
        unit_name: unitName,
        package_name: `${packageName || 'Basic Package'} (In: ${checkInTime}, Out: ${checkOutTime})`,
        units_count: Number(unitsCount || 1)
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking Error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ id: booking.id, totalPrice: finalPrice });
  } catch (error) {
    console.error("Booking Create Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
