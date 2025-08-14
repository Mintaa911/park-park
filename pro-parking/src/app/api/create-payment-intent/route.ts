import { getPriceTierById } from '@/lib/supabase/queries/price-tier';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schedule, lotId, customerInfo } = body;

    const supabase = await createClient()

    const { data, error } = await getPriceTierById(supabase, schedule.tier_id)

    if(error || !data) throw error

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(data.price) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        email: customerInfo.email,
        phone: customerInfo.phone,
        license_plate: customerInfo.licensePlate,
        license_state: customerInfo.licenseState,
        lot_id: lotId,
        schedule_id: schedule.schedule_id,
        price_tier: schedule.tier_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.log("Server Error:", error)
    return NextResponse.json(
      { error: 'Unable to create payment intent' },
      { status: 500 }
    );
  }
} 