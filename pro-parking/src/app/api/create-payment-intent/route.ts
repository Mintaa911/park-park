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
    const { schedule, lot, customerInfo } = body;

    const supabase = await createClient()

    const { data, error } = await getPriceTierById(supabase, schedule.tierId)

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
        lot_id: lot.lotId,
        schedule_id: schedule.scheduleId,
        price_tier: schedule.tierId,
        location: lot.location,
        lot_name: lot.name,
        maxHour: data.maxHour
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