import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readJsonBody } from '@/lib/readJsonBody';

// Server-side booking confirmation for the /success page.
//
// The success page used to read + mutate `bookings` with the public anon
// client, which forced the anon key to have write access and PII read access
// on every booking. This route replaces that: it confirms payment
// AUTHORITATIVELY with Billplz (using the secret API key), then returns only
// a whitelisted, non-PII-minimal set of fields for display. Payment status
// itself is owned by the signed Billplz webhook (/api/callback) — the client
// can no longer set it.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BillplzBill {
  id: string;
  paid: boolean;
  state: string;
  paid_amount?: string;
  amount?: string;
}

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: body, error: bodyError } = await readJsonBody<any>(req);
  if (bodyError) return bodyError;

  const billId = typeof body?.billId === 'string' ? body.billId : '';
  if (!billId) {
    return NextResponse.json({ error: 'Missing bill id' }, { status: 400 });
  }

  const apiKey = process.env.BILLPLZ_API_KEY;
  if (!apiKey) {
    console.error('Billplz API key not configured');
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
  }

  // 1. Ask Billplz for the real state of this bill (don't trust the client).
  const isSandbox = apiKey.startsWith('s-');
  const base = isSandbox ? 'https://www.billplz-sandbox.com' : 'https://www.billplz.com';
  const auth = Buffer.from(`${apiKey}:`).toString('base64');

  let bill: BillplzBill;
  try {
    const res = await fetch(`${base}/api/v3/bills/${encodeURIComponent(billId)}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) {
      return NextResponse.json({ status: 'failed' });
    }
    bill = await res.json();
  } catch (error) {
    console.error('Billplz lookup failed:', error);
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 });
  }

  // 2. Not paid -> release the still-pending booking (server-side) and report.
  if (!bill.paid) {
    await supabase
      .from('bookings')
      .delete()
      .eq('billplz_id', billId)
      .eq('payment_status', 'awaiting_payment');
    return NextResponse.json({ status: 'failed' });
  }

  // 3. Paid -> fall back to writing payment_status ourselves, since the
  //    webhook (/api/callback) can be delayed or fail to arrive. We've just
  //    confirmed payment authoritatively with Billplz above, so this is safe.
  const amountCents = parseInt(bill.paid_amount || bill.amount || '0');
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      amount_paid: amountCents / 100,
      updated_at: new Date().toISOString(),
    })
    .eq('billplz_id', billId)
    .eq('payment_status', 'awaiting_payment');

  // Return ONLY the fields the confirmation UI needs. Never IC number or
  // internal/payment columns.
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('unit_name, guest_name, guest_email, check_in, check_out, package_name, total_price, rooms(title)')
    .eq('billplz_id', billId)
    .single();

  if (error || !booking) {
    // Payment is confirmed by Billplz; the webhook may not have written the
    // row yet. Report success without details rather than leaking an error.
    return NextResponse.json({ status: 'success', booking: null });
  }

  return NextResponse.json({ status: 'success', booking });
}
