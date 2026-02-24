import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { listingId, price, title, guestPhone, guestName, icNumber, checkIn, checkOut, unitName, packageName, checkInTime, checkOutTime, unitsCount } = await req.json();

    if (!listingId || !price || !guestPhone || !guestName || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create a pending booking in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: listingId,
        guest_name: guestName,
        guest_email: guestPhone, // Maps to guest_email column since guest_phone does not exist
        ic_number: icNumber,
        check_in: checkIn,
        check_out: checkOut,
        total_price: price,
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

    // 2. Create Billplz bill
    const auth = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64');

    const res = await fetch('https://www.billplz.com/api/v3/bills', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection_id: process.env.BILLPLZ_COLLECTION_ID,
        email: 'guest@indahmorib.com',
        mobile: guestPhone,
        name: guestName,
        amount: Math.round(price * 100), // Amount in cents
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        description: `Booking for ${title} (${checkIn} to ${checkOut})`,
        metadata: {
          listingId,
          bookingId: booking.id
        }
      }),
    });

    const bill = await res.json();

    if (!bill.url) {
      console.error("Billplz Error:", bill);
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }

    // 3. Update booking with billplz_id
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