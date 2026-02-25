import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaff } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [roomsRes, bookingsRes] = await Promise.all([
      supabaseAdmin.from("rooms").select("id,title,price,basic_price,full_price"),
      supabaseAdmin
        .from("bookings")
        .select(
          "id,room_id,unit_name,guest_name,guest_email,ic_number,check_in,check_out,total_price,package_name,units_count,payment_status,created_at,amount_paid,admin_notes"
        )
        .order("created_at", { ascending: false })
    ]);


    if (roomsRes.error) throw roomsRes.error;
    if (bookingsRes.error) throw bookingsRes.error;

    return NextResponse.json({
      rooms: roomsRes.data || [],
      bookings: bookingsRes.data || []
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
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
