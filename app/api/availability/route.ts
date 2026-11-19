import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BLOCKING_STATUSES, TENTATIVE_STATUS } from '@/lib/booking';
import { rateLimit } from '@/lib/rateLimit';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Public, PII-free availability. Reads via service_role so anon needs no table access.
// Returns only scheduling columns; guest/contact/price columns are never selected.
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`${ip}:availability`, 120, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const sp = request.nextUrl.searchParams;
    const roomId = sp.get('roomId');
    const from = sp.get('from');
    const to = sp.get('to');

    if (roomId && !/^\d+$/.test(roomId)) {
      return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 });
    }
    if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('bookings')
      .select('room_id, unit_name, units_count, check_in, check_out, check_in_time, check_out_time, payment_status, created_at')
      .in('payment_status', [...BLOCKING_STATUSES, TENTATIVE_STATUS]);

    if (roomId) query = query.eq('room_id', Number(roomId));
    // Overlap: check_in < to AND check_out > from
    if (from) query = query.gt('check_out', from);
    if (to) query = query.lt('check_in', to);

    const { data, error } = await query;
    if (error) {
      console.error('Availability query failed:', error);
      return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
    }

    return NextResponse.json(
      { bookings: data ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Availability route error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
