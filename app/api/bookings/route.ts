import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaff } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We use all columns from the whitelist. If columns are missing in DB, this will fail.
    // Ensure you have run the latest migrations!
    const { data: roomsData, error: roomsError } = await supabaseAdmin
      .from("rooms")
      .select("id,title,price,basic_price,full_price");

    if (roomsError) throw roomsError;

    const { data: bookingsData, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("id,room_id,unit_name,guest_name,guest_email,ic_number,check_in,check_out,check_in_time,check_out_time,total_price,package_name,units_count,payment_status,created_at,amount_paid,billplz_id,admin_notes")
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error('Database Error:', bookingsError);
      // If we can't read the new columns yet, fall back to basic info to avoid breaking the dashboard
      const { data: fallbackData } = await supabaseAdmin
        .from("bookings")
        .select("id,room_id,guest_name,guest_email,check_in,check_out,total_price,payment_status,created_at")
        .order("created_at", { ascending: false });

      return NextResponse.json({
        rooms: roomsData || [],
        bookings: fallbackData || [],
        warning: "Some columns are missing from the database. Please run the latest SQL migrations."
      });
    }

    return NextResponse.json({
      rooms: roomsData || [],
      bookings: bookingsData || []
    });
  } catch (error: any) {
    console.error('Final API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist allowed fields to prevent object injection
    const payload = {
      room_id: Number(body.room_id),
      unit_name: body.unit_name,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      ic_number: body.ic_number,
      check_in: body.check_in,
      check_out: body.check_out,
      total_price: Number(body.total_price),
      amount_paid: Number(body.amount_paid || 0),
      package_name: body.package_name,
      units_count: Number(body.units_count || 1),
      payment_status: body.payment_status || 'pending',
      check_in_time: body.check_in_time,
      check_out_time: body.check_out_time,
      admin_notes: body.admin_notes
    };

    if (!payload.room_id || !payload.guest_name || !payload.check_in || !payload.check_out) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(payload)
      .select();

    if (error) throw error;
    return NextResponse.json({ data: data[0] });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Whitelist allowed fields to prevent object injection
    const payload = {
      room_id: Number(body.room_id),
      unit_name: body.unit_name,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      ic_number: body.ic_number,
      check_in: body.check_in,
      check_out: body.check_out,
      total_price: Number(body.total_price),
      amount_paid: Number(body.amount_paid),
      package_name: body.package_name,
      units_count: Number(body.units_count),
      check_in_time: body.check_in_time,
      check_out_time: body.check_out_time,
      payment_status: body.payment_status,
      admin_notes: body.admin_notes,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json({ data: data[0] });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
