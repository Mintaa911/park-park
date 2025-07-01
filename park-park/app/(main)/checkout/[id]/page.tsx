'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, ArrowRight } from 'lucide-react';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './checkout-form';
import { formatCurrency, formatTime } from '@/lib/utils';
import { getPriceTierById } from '@/lib/supabase/queries/price-tier';
import { getLotById } from '@/lib/supabase/queries/lot';

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormData {
    email: string;
    phone: string;
    licensePlate: string;
    licenseState: string;
}

export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const lotId = params.id as string;
    const scheduleId = searchParams.get('scheduleId') as string;
    const priceTierId = searchParams.get('priceTierId') as string;

    const supabase = createClient();
    const [formData, setFormData] = useState<CheckoutFormData>({
        email: '',
        phone: '',
        licensePlate: '',
        licenseState: '',
    });
    const [clientSecret, setClientSecret] = useState<string>('');

    const { data: priceTier, isLoading: priceTierLoading, error: priceTierError } = useQuery(getPriceTierById(supabase, priceTierId!));
    const { data: lot } = useQuery(getLotById(supabase, lotId!));


    const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const createPaymentIntent = async () => {
        if (!priceTier) return;
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schedule: {
                        schedule_id: scheduleId,
                        price: priceTier.price,
                    },
                    lot: lotId,
                    customerInfo: formData,
                }),
            });

            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
        } catch (error) {
            console.error('Payment intent error:', error);
            alert('Failed to initialize payment. Please try again.');
        }
    };

    if (priceTierLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading checkout information...</p>
                </div>
            </div>
        );
    }

    if (priceTierError || !priceTier) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
                    <p className="text-muted-foreground">
                        {'Invalid checkout information'}
                    </p>
                    <Button
                        onClick={() => router.back()}
                        className="mt-4"
                        variant="outline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Parking Lot
                    </Button>
                </div>


                <div className="flex flex-col gap-4 px-6 h-full">
                    <div
                        key={priceTier.price_id}
                        className={`space-y-2 border p-4 rounded-lg cursor-pointer transition-all duration-200 border-primary bg-primary/5 shadow-md`}
                    >
                        <div className="flex justify-between w-full">
                            <p className="font-semibold flex items-center gap-1">{priceTier.maxHour} hours</p>
                            <h4 className="font-semibold text-lg">{formatCurrency(priceTier.price)}</h4>
                        </div>
                        <div className="flex gap-2 items-center">
                            <p>
                                {formatTime(new Date().toISOString())}
                            </p>
                            <ArrowRight className="w-4 h-4" />
                            <p>
                                {formatTime(new Date(Date.now() + 1000 * 60 * 60 * priceTier.maxHour).toISOString())}
                            </p>
                        </div>
                    </div>
                    {/* Customer Information Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>
                                    Please provide your details to complete the booking
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="licensePlate">License Plate *</Label>
                                        <Input
                                            id="licensePlate"
                                            required
                                            value={formData.licensePlate}
                                            onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                                            placeholder="ABC123"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="licenseState">License State *</Label>
                                        <Input
                                            id="licenseState"
                                            required
                                            value={formData.licenseState}
                                            onChange={(e) => handleInputChange('licenseState', e.target.value)}
                                            placeholder="CA"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                                {clientSecret && priceTier && (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm
                                            schedule_id={scheduleId}
                                            lot_id={lotId}
                                            lot_name={lot?.name || ''}
                                            location={lot?.location || ''}
                                            customerInfo={formData}
                                            clientSecret={clientSecret}
                                            priceTier={priceTier}
                                        />
                                    </Elements>
                                )}
                                {!clientSecret && (
                                    <Button
                                        onClick={createPaymentIntent}
                                        disabled={!formData.email || !formData.phone || !formData.licensePlate || !formData.licenseState || !priceTier}
                                        className="w-full"
                                    >
                                        Continue to Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>


            </div>


        </div>
    );
} 