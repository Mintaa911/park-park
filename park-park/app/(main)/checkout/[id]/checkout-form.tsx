'use client';

import { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PriceTier } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parkingCheckoutEmail } from '@/lib/twillio/email-format';
import { useQueryClient } from '@tanstack/react-query';

interface CheckoutFormProps {
    schedule_id: string;
    lot_id: string;
    lot_name: string;
    location: string;
    priceTier: PriceTier;
    customerInfo: {
        email: string;
        phone: string;
        licensePlate: string;
        licenseState: string;
    };
    clientSecret: string;
}

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

export function CheckoutForm({ schedule_id, lot_id, lot_name, location, customerInfo, clientSecret, priceTier }: CheckoutFormProps) {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const queryClient = useQueryClient();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        const cardNumberElement = elements.getElement(CardNumberElement);

        if (!cardNumberElement) {
            setError('Card element not found');
            setLoading(false);
            return;
        }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                    },
                },
            }
        );

        if (stripeError) {
            setError(stripeError.message || 'Payment failed');
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment successful - save to database
            try {
                const supabase = createClient();
                
                const { error: dbError } = await supabase.from('orders').insert({
                    lot_id: lot_id,
                    schedule_id: schedule_id,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    license_plate: customerInfo.licensePlate,
                    license_state: customerInfo.licenseState,
                    total_amount: priceTier.price,
                    price_tier: priceTier.price_id,
                    payment_status: 'PAID',
                    start_time: new Date().toISOString(),
                    stripe_payment_intent_id: paymentIntent.id,
                }).select().single();

                if (dbError) {
                    throw dbError;
                }

                queryClient.invalidateQueries({ queryKey: ['orders'] });
                
                setSuccess(true);
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: 'Parking Pass',
                        to: customerInfo.email,
                        html: parkingCheckoutEmail({
                            email: customerInfo.email,
                            stripe_payment_id: paymentIntent.id,
                            lot_name: lot_name,
                            location: location,
                            start_time: new Date().toISOString(),
                            end_time: new Date(new Date().getTime() + (1000 * 60 * 60 * priceTier.maxHour!)).toISOString(),
                            session_id: paymentIntent.id,
                            amount_paid: priceTier.price,
                        }),
                    }),
                });

                // You can redirect to a success page or show success message
                setTimeout(() => {
                    router.push(`/checkout/success?session_id=${paymentIntent.id}`);
                }, 500);

            } catch (err) {
                console.error('Error saving booking:', err);
                toast.error('Error saving booking. Please contact support.');
                setError('Error saving booking. Please contact support.');
            }
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">Your parking reservation has been confirmed.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}

            {/* Payment Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                        Enter your card details to complete the payment
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Card Number</label>
                            <div className="border rounded-md p-4">
                                <CardNumberElement options={cardElementOptions} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry Date</label>
                                <div className="border rounded-md p-4">
                                    <CardExpiryElement options={cardElementOptions} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CVC</label>
                                <div className="border rounded-md p-4">
                                    <CardCvcElement options={cardElementOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={!stripe || loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                
                                Pay {formatPrice(priceTier.price)}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
} 