import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Removed admin verification for public access to discounts

    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select(`
        id,
        room_id,
        discount_date,
        percentage,
        created_at,
        rooms!inner(title)
      `)
      .eq('is_deleted', false)
      .order('discount_date', { ascending: true });

    if (error) {
      console.error('Error fetching discounts:', error);
      return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
    }

    return NextResponse.json({ discounts: data || [] });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { discount_date, percentage } = body;
    const room_id = Number(body.room_id);

    if (!room_id || !discount_date || percentage === undefined || percentage === null) {
      return NextResponse.json({ error: 'Missing required fields: room_id, discount_date, percentage' }, { status: 400 });
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }

    // Validate that room_id exists
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Invalid room_id: room does not exist' }, { status: 400 });
    }

    // Use upsert to avoid duplicates for the same room and date
    // Note: We'll need a unique constraint on (room_id, discount_date) for this to work perfectly across all rooms
    // but for now we'll just insert/update for this specific room and date
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .upsert([{
        room_id,
        discount_date,
        percentage,
        is_deleted: false, // Ensure it's not deleted if we're re-applying
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'room_id,discount_date'
      })
      .select(`
        id,
        room_id,
        discount_date,
        percentage,
        created_at,
        rooms!inner(title)
      `);

    if (error) {
      console.error('Error creating/updating discount:', error);
      return NextResponse.json({ error: 'Failed to save discount' }, { status: 500 });
    }

    return NextResponse.json({ discount: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { discount_date } = body;
    const room_id = Number(body.room_id);

    if (!discount_date || !room_id) {
      return NextResponse.json({ error: 'Discount date and room_id are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('discounts')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('discount_date', discount_date)
      .eq('room_id', room_id);

    if (error) {
      console.error('Error deleting discount:', error);
      return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
