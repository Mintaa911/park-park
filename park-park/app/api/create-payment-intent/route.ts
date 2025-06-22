import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schedule, lot, customerInfo } = body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(schedule.price) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        license_plate: customerInfo.licensePlate,
        license_state: customerInfo.licenseState,
        lot_id: lot.lot_id,
        schedule_id: schedule.schedule_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Unable to create payment intent' },
      { status: 500 }
    );
  }
} 