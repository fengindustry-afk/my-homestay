import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const isPaid = data.get('paid') === 'true';
    const billId = data.get('id');

    if (!billId) return new Response('Missing bill ID', { status: 400 });

    if (isPaid) {
      // 1. Mark as paid
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('billplz_id', billId);

      if (error) {
        console.error("Callback Update Error:", error);
        return new Response('Database Update Failed', { status: 500 });
      }
    } else {
      // 2. Clear the pending booking if payment failed or was cancelled
      // As per user request: "only sucessful transaction will be booked, otherwise ... booking slot should be empty"
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('billplz_id', billId)
        .eq('payment_status', 'awaiting_payment');

      if (error) {
        console.error("Callback Deletion Error:", error);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error("Callback Error:", error);
    return new Response('Error', { status: 500 });
  }
}