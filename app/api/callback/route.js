import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const data = await req.formData();
  const status = data.get('paid'); // 'true' or 'false'
  const billId = data.get('id');

  if (status === 'true') {
    // 1. Update your Supabase 'bookings' table
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('bill_id', billId);
  }

  return new Response('OK', { status: 200 });
}