import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { verifyStaff } from '@/lib/auth-utils';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const staff = await verifyStaff();
  if (!staff.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!clientId || !baseUrl) {
    return NextResponse.json({ error: 'microsoft_not_configured' }, { status: 500 });
  }

  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('graph_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: baseUrl.startsWith('https://'),
    path: '/',
    maxAge: 600,
  });

  const redirectUri = `${baseUrl}/api/auth/graph/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'offline_access Files.ReadWrite User.Read',
    state,
    response_mode: 'query',
  });

  return NextResponse.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`);
}
