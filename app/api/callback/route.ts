import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifies the Billplz signature to ensure the callback is authentic.
 */
function verifySignature(params: URLSearchParams, signature: string) {
  const secret = process.env.BILLPLZ_X_SIGNATURE_KEY || process.env.BILLPLZ_API_KEY || '';
  if (!secret) return false;

  // Billplz signature logic: sort keys, join with |, then hmac-sha256
  const sortedParams = Array.from(params.entries())
    .filter(([key]) => key !== 'x_signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('|');

  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(sortedParams).digest('hex');

  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      data[key] = value.toString();
      params.append(key, value.toString());
    });

    const signature = data['x_signature'];
    const billId = data['id'];
    const isPaid = data['paid'] === 'true';

    // SECURITY: Verify the signature from Billplz
    if (!signature || !verifySignature(params, signature)) {
      console.error("Invalid Billplz signature detected!");
      return new Response('Invalid Signature', { status: 401 });
    }

    if (!billId) return new Response('Missing bill ID', { status: 400 });

    if (isPaid) {
      // 1. Mark as paid
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('billplz_id', billId);

      if (error) {
        console.error("Callback Update Error:", error);
        return new Response('Database Update Failed', { status: 500 });
      }
      console.log(`Booking for bill ${billId} marked as paid.`);
    } else {
      // 2. Clear the pending booking if payment failed or was cancelled
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('billplz_id', billId)
        .eq('payment_status', 'awaiting_payment');

      if (error) {
        console.error("Callback Deletion Error:", error);
      }
      console.log(`Pending booking for bill ${billId} removed due to failed payment.`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error("Callback Error:", error);
    return new Response('Error', { status: 500 });
  }
}
