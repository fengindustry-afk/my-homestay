import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Catches bookings the Billplz webhook (/api/callback) never reached AND the
// guest never revisited /success for (so /api/booking-status's fallback never
// ran either). Runs on a schedule via vercel.json crons; Vercel signs cron
// requests with a bearer token matching CRON_SECRET.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BillplzBill {
  paid: boolean;
  paid_amount?: string;
  amount?: string;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.BILLPLZ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
  }
  const isSandbox = apiKey.startsWith('s-');
  const base = isSandbox ? 'https://www.billplz-sandbox.com' : 'https://www.billplz.com';
  const auth = Buffer.from(`${apiKey}:`).toString('base64');

  // Only look at bills old enough that the checkout flow has clearly finished
  // (avoids racing an in-progress payment) but not stale enough to be junk.
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: stale, error } = await supabase
    .from('bookings')
    .select('id, billplz_id')
    .eq('payment_status', 'awaiting_payment')
    .not('billplz_id', 'is', null)
    .lt('created_at', cutoff);

  if (error) {
    console.error('Reconcile query failed:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  let paidCount = 0;
  let releasedCount = 0;

  for (const booking of stale || []) {
    try {
      const res = await fetch(`${base}/api/v3/bills/${encodeURIComponent(booking.billplz_id)}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!res.ok) continue;
      const bill: BillplzBill = await res.json();

      if (bill.paid) {
        const amountCents = parseInt(bill.paid_amount || bill.amount || '0');
        await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            amount_paid: amountCents / 100,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id)
          .eq('payment_status', 'awaiting_payment');
        paidCount++;
      } else {
        await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id)
          .eq('payment_status', 'awaiting_payment');
        releasedCount++;
      }
    } catch (err) {
      console.error(`Reconcile failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ checked: stale?.length || 0, paidCount, releasedCount });
}
