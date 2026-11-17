import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyStaff } from '@/lib/auth-utils';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { encryptToken } from '@/lib/token-crypto';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const staff = await verifyStaff();
  if (!staff.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const cookieStore = await cookies();
  const cookieState = cookieStore.get('graph_state')?.value;
  cookieStore.delete('graph_state');

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.json({ error: 'microsoft_not_configured' }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/auth/graph/callback`;
  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      scope: 'offline_access Files.ReadWrite User.Read',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'token_exchange_failed', detail: await tokenRes.text() }, { status: 400 });
  }
  const tokens = await tokenRes.json() as any;
  const refreshToken = tokens.refresh_token ? String(tokens.refresh_token) : '';
  const accessToken = tokens.access_token ? String(tokens.access_token) : '';
  if (!refreshToken) {
    return NextResponse.json({ error: 'consent_missing' }, { status: 400 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: 'token_exchange_failed' }, { status: 400 });
  }

  const meRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=userPrincipalName,displayName,mail', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let upn = '';
  if (meRes.ok) {
    const me = await meRes.json() as any;
    upn = String(me.userPrincipalName || me.mail || me.displayName || '');
  }

  const expiresIn = Number(tokens.expires_in || 3600);
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const itemId = process.env.SYNC_EXCEL_ITEM_ID ?? '';
  const worksheet = process.env.SYNC_EXCEL_WORKSHEET ?? 'Book1';

  const payload = {
    provider: 'graph',
    refresh_token_enc: encryptToken(refreshToken),
    access_token_enc: encryptToken(accessToken),
    expires_at: expiresAt,
    account_upn: upn,
    item_id: itemId,
    worksheet,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin.from('sync_credentials').select('id').eq('provider', 'graph').maybeSingle();
  if (existing?.id) {
    await supabaseAdmin.from('sync_credentials').update(payload).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('sync_credentials').insert(payload);
  }

  return NextResponse.redirect(new URL('/finest-touch?microsoft=connected', baseUrl));
}
