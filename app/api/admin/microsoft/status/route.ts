import { NextResponse } from 'next/server';
import { verifyStaff } from '@/lib/auth-utils';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  const staff = await verifyStaff();
  if (!staff.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row } = await supabaseAdmin
    .from('sync_credentials')
    .select('account_upn, expires_at')
    .eq('provider', 'graph')
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    account_upn: row.account_upn ?? '',
    expires_at: row.expires_at ?? null,
  });
}
