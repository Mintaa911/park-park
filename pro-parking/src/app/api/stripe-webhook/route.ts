// app/api/stripe-webhook/route.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import sendEmail from '@/lib/twillio/send-email';
import { parkingCheckoutEmail } from '@/lib/twillio/email-format';
import { NextResponse } from 'next/server';


// Initialize Stripe and Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature') ?? '';
  const body = await request.text()
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const { data: serverTime, error } = await supabase.rpc("get_server_time");

  if (error) {
    throw error;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;


    const { error } = await supabase.from('orders').insert({
      lot_id: metadata.lot_id,
      schedule_id: metadata.schedule_id,
      email: metadata.email,
      phone: metadata.phone,
      license_plate: metadata.license_plate,
      license_state: metadata.license_state,
      total_amount: (paymentIntent.amount/100),
      price_tier: metadata.price_tier,
      payment_status: 'PAID',
      start_time: "now()",
      stripe_payment_intent_id: paymentIntent.id,
    });

    if (error) {
      console.error('Supabase insert error:', error, paymentIntent);
      return new Response(JSON.stringify({ error: 'DB insert failed' }), { status: 500 });
    }

    // Send confirmation email
    try {

      await sendEmail(
        metadata.email,
        'Parking Pass',
        parkingCheckoutEmail({
          email: metadata.email,
          stripe_payment_id: paymentIntent.id,
          lot_name: metadata.lot_name,
          location: metadata.location,
          start_time: serverTime.toISOString(),
          end_time: new Date(
            new Date(serverTime).getTime() + (1000 * 60 * 60 * Number(metadata?.maxHour))
          ).toISOString(),
          session_id: paymentIntent.id,
          amount_paid: (paymentIntent.amount/100).toString(),
        })
      );
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
