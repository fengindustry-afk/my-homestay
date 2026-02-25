import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaff } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { isStaff } = await verifyStaff();
    if (!isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const [totalBookings, upcomingCheckIns, activeRooms] = await Promise.all([
      supabaseAdmin.from('bookings').select('id', { count: 'exact' }),
      supabaseAdmin
        .from('bookings')
        .select('id')
        .gte('check_in', today)
        .lt('check_in', new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10)),
      supabaseAdmin.from('rooms').select('id', { count: 'exact' }),
    ]);

    return NextResponse.json({
      totalBookings: totalBookings.count ?? 0,
      upcomingCheckIns: upcomingCheckIns.data?.length ?? 0,
      activeRooms: activeRooms.count ?? 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
