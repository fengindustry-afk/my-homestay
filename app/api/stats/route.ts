import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const [totalBookings, upcomingCheckIns, activeRooms] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }),
    supabase
      .from('bookings')
      .select('id')
      .gte('check_in', today)
      .lt('check_in', new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10)),
    supabase.from('rooms').select('id', { count: 'exact' }),
  ]);

  return NextResponse.json({
    totalBookings: totalBookings.count ?? 0,
    upcomingCheckIns: upcomingCheckIns.data?.length ?? 0,
    activeRooms: activeRooms.count ?? 0,
  });
}