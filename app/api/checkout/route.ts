import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { listingId, price, title, guestEmail, guestName } = await req.json();

  // Billplz uses Basic Auth with your API Key
  const auth = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64');

  const res = await fetch('https://www.billplz.com/api/v3/bills', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collection_id: process.env.BILLPLZ_COLLECTION_ID,
      email: guestEmail,
      name: guestName,
      amount: price * 100, // Amount in cents (RM 100 = 10000)
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      description: `Booking for ${title}`,
      metadata: { listingId } // Optional: to track which house
    }),
  });

  const bill = await res.json();
  return NextResponse.json({ url: bill.url });
}