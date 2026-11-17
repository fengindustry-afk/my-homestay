import { NextResponse } from 'next/server';
import { verifyStaff } from '@/lib/auth-utils';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { decryptToken } from '@/lib/token-crypto';

export const runtime = 'nodejs';

export async function POST() {
  const staff = await verifyStaff();
  if (!staff.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row } = await supabaseAdmin
    .from('sync_credentials')
    .select('refresh_token_enc')
    .eq('provider', 'graph')
    .maybeSingle();

  if (row?.refresh_token_enc) {
    try {
      const refreshToken = decryptToken(row.refresh_token_enc);
      await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }),
      });
    } catch {
      // best-effort
    }
  }

  await supabaseAdmin.from('sync_credentials').delete().eq('provider', 'graph');
  return NextResponse.json({ ok: true });
}
