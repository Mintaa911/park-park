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
    const { schedule, lot, customerInfo, recaptchaToken } = body;


    // Verify reCAPTCHA
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: "POST" }
    );
    const recaptchaData = await verifyRes.json();

    if (!recaptchaData.success || recaptchaData.score < 0.7) {
      return NextResponse.json({ error: "reCAPTCHA failed", score: recaptchaData.score }, { status: 400 });
    }

    const supabase = await createClient()

    const { data, error } = await getPriceTierById(supabase, schedule.tierId)

    if (error || !data) throw error

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
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Unable to create payment intent' },
      { status: 500 }
    );
  }
} 