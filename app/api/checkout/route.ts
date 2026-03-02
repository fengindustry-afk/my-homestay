import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePrice } from '@/lib/price-utils';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      listingId,
      price: clientPrice, // We'll validate this
      title,
      guestPhone,
      guestName,
      icNumber,
      checkIn,
      checkOut,
      unitName,
      packageName,
      checkInTime,
      checkOutTime,
      unitsCount,
      addOns // Optional, for Homestay 2
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

    // 1b. Check for exact Time-Based Overlaps
    const requestedStart = `${checkIn}T${checkInTime || '15:00'}:00`;
    const requestedEnd = `${checkOut}T${checkOutTime || '12:00'}:00`;

    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('id, unit_name')
      .eq('room_id', listingId)
      .eq('payment_status', 'paid')
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

    // SECURITY: If client price differs significantly or is lower, use server price
    // We'll just always use server price to be safe
    const finalPrice = serverPrice;

    // 3. Create a pending booking in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: listingId,
        guest_name: guestName,
        guest_email: guestPhone,
        ic_number: icNumber,
        check_in: checkIn,
        check_out: checkOut,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        total_price: finalPrice,
        payment_status: 'awaiting_payment',
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

    // 4. Create Billplz bill
    const apiKey = process.env.BILLPLZ_API_KEY;
    const collectionId = process.env.BILLPLZ_COLLECTION_ID;
    const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY;

    if (!apiKey || !collectionId) {
      console.error("Missing Billplz Configuration:", { apiKeyExists: !!apiKey, collectionIdExists: !!collectionId });
      return NextResponse.json({ error: "Payment system is not configured correctly." }, { status: 500 });
    }

    const authString = `${apiKey}:`;
    const auth = Buffer.from(authString).toString('base64');

    const isSandbox = apiKey.startsWith('s-');
    const billplzUrl = isSandbox
      ? 'https://www.billplz-sandbox.com/api/v3/bills'
      : 'https://www.billplz.com/api/v3/bills';

    const billPayload: any = {
      collection_id: collectionId,
      email: 'guest@indahmorib.com',
      mobile: guestPhone,
      name: guestName,
      amount: Math.round(finalPrice * 100), // Amount in cents
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      description: `Booking for ${title} (${checkIn} to ${checkOut})`.substring(0, 120),
      metadata: {
        listingId,
        bookingId: booking.id
      }
    };

    // Calculate X-Signature if key is available (required if "X-Signature for Bill Creation" is enabled)
    if (xSignatureKey) {
      // Exclude objects/metadata from signature as Billplz signature usually only covers flat strings/numbers
      const signParams = Object.keys(billPayload)
        .filter(key => typeof billPayload[key] !== 'object' && key !== 'x_signature')
        .sort()
        .map(key => `${key}${billPayload[key]}`)
        .join('|');

      const signature = crypto
        .createHmac('sha256', xSignatureKey)
        .update(signParams)
        .digest('hex');

      billPayload.x_signature = signature;
      console.log("Generated X-Signature for bill creation:", signature);
    }

    console.log(`Initializing Billplz ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} payment with:`, {
      url: billplzUrl,
      collection_id: collectionId,
      mobile: guestPhone,
      name: guestName,
      amount: billPayload.amount,
      hasSignature: !!billPayload.x_signature
    });

    const res = await fetch(billplzUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billPayload),
    });

    const bill = await res.json();

    if (!bill.url) {
      console.error("Billplz Initialization Failed:", bill);
      const errorMessage = bill.error?.message || "Unknown Billplz error";
      return NextResponse.json({
        error: "Failed to initialize payment",
        detail: errorMessage,
        billplz_response: bill
      }, { status: 500 });
    }

    // 5. Update booking with billplz_id
    await supabase
      .from('bookings')
      .update({ billplz_id: bill.id })
      .eq('id', booking.id);

    return NextResponse.json({ url: bill.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
