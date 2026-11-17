import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { decryptToken, encryptToken } from '@/lib/token-crypto';

type Ok = { token: string; account: string };
type Err = { error: string };

type CredRow = {
  id: number;
  refresh_token_enc: string | null;
  access_token_enc: string | null;
  expires_at: string | null;
  account_upn: string | null;
  item_id: string | null;
  worksheet: string | null;
};

async function deleteCredentials() {
  await supabaseAdmin.from('sync_credentials').delete().eq('provider', 'graph');
}

export async function getValidAccessToken(): Promise<Ok | Err> {
  const { data: row, error } = await supabaseAdmin
    .from('sync_credentials')
    .select('id, refresh_token_enc, access_token_enc, expires_at, account_upn, item_id, worksheet')
    .eq('provider', 'graph')
    .maybeSingle();

  if (error || !row) return { error: 'microsoft_not_connected' };
  const cred = row as CredRow;

  if (!cred.refresh_token_enc) return { error: 'microsoft_not_connected' };

  let refreshToken: string;
  try {
    refreshToken = decryptToken(cred.refresh_token_enc);
  } catch {
    await deleteCredentials();
    return { error: 'microsoft_token_refresh_failed' };
  }

  const now = Date.now();
  const expiresAt = cred.expires_at ? new Date(cred.expires_at).getTime() : 0;
  const needsRefresh = !cred.access_token_enc || !expiresAt || expiresAt < now + 300_000;

  if (!needsRefresh && cred.access_token_enc) {
    try {
      const token = decryptToken(cred.access_token_enc);
      return { token, account: cred.account_upn || '' };
    } catch {
      // fall through to refresh
    }
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { error: 'microsoft_not_connected' };

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    scope: 'offline_access Files.ReadWrite',
  });

  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    await deleteCredentials();
    return { error: 'microsoft_token_refresh_failed' };
  }

  const json = await res.json() as any;
  const accessToken = String(json.access_token || '');
  if (!accessToken) {
    await deleteCredentials();
    return { error: 'microsoft_token_refresh_failed' };
  }
  const newRefresh = json.refresh_token ? String(json.refresh_token) : refreshToken;
  const expiresIn = Number(json.expires_in || 3600);
  const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const accessEnc = encryptToken(accessToken);
  const refreshEnc = encryptToken(newRefresh);

  await supabaseAdmin
    .from('sync_credentials')
    .update({
      access_token_enc: accessEnc,
      refresh_token_enc: refreshEnc,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cred.id);

  return { token: accessToken, account: cred.account_upn || '' };
}

export async function getSyncTarget(): Promise<{ itemId: string; worksheet: string } | { error: string }> {
  const { data: row } = await supabaseAdmin
    .from('sync_credentials')
    .select('item_id, worksheet')
    .eq('provider', 'graph')
    .maybeSingle();
  if (!row?.item_id || !row?.worksheet) return { error: 'microsoft_not_connected' };
  return { itemId: String(row.item_id), worksheet: String(row.worksheet) };
}
