'use client';

import { createClient } from "@/lib/supabase/client";
import { getOrderByPaymentIntentId } from "@/lib/supabase/queries/order";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, Car } from "lucide-react";
import Image from "next/image";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const paymentIntentId = searchParams.get('session_id');

    const supabase = createClient();

    const { data: order, isLoading } = useQuery(getOrderByPaymentIntentId(supabase, paymentIntentId!))

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-blue-700 font-medium">Loading your parking pass...</p>
            </div>
        </div>
    )

    const formatExitTime = (endTime: string, maxHour: number) => {
        const endDate = new Date(endTime);
        const exitTime = new Date(endDate.getTime() + (1000 * 60 * 60 * maxHour));
        return exitTime;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="md:w-[70%] md:mx-auto max-w-2xl">
                {order && (
                    <div className="space-y-6">
                        {/* Header with Logo and Success Message */}
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="relative w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Image
                                        src="/parking.png"
                                        alt="Park Park Logo"
                                        width={100}
                                        height={100}
                                        className="rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                    <h1 className="text-2xl font-bold">Payment Successful!</h1>
                                </div>
                                <p className="text-gray-600 text-lg">Your parking reservation has been confirmed</p>
                            </div>
                        </div>

                        {/* Main Parking Pass Card */}
                        <Card className="w-full shadow-xl border-0  ">
                            <CardHeader className="rounded-t-xl text-center p-6 ">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <Car className="w-6 h-6" />
                                    <CardTitle className="text-xl font-bold">PARKING PASS</CardTitle>
                                </div>
                                <p className="text-sm">Keep this pass visible in your vehicle</p>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4 py-8">
                                {/* Pass Number and License Plate */}
                                <div className="w-full md:p-4 rounded-xl border-2 text-center space-y-3">
                                    <div className="text-sm text-blue-700 font-semibold tracking-wider uppercase">
                                        Pass #{order?.stripe_payment_intent_id || 'XXXXXXX'}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-blue-900 bg-white px-4 py-2">
                                        <Car className="w-4 h-4 text-blue-600" />
                                        {order?.license_plate || 'XXXXXXX'}
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                {/* Time Information */}
                                <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 md:p-6 border-2 border-green-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-xs text-green-700 font-semibold uppercase tracking-wider">Park After</span>
                                            <span className="text-xl font-bold text-green-900 mt-1">
                                                {new Date(order.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <p className="text-xs text-green-700 mt-1">
                                                {new Date(order.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">→</span>
                                            </div>
                                            <span className="text-xs text-center text-green-600 mt-1 font-medium">Valid for {order.price_tiers?.maxHour || 1}h</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-xs text-red-700 font-semibold uppercase tracking-wider">Exit Before</span>
                                            <span className="text-xl font-bold text-red-900 mt-1">
                                                {formatExitTime(order.start_time, order.price_tiers?.maxHour || 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <p className="text-xs text-red-700 mt-1">
                                                {formatExitTime(order.start_time, order.price_tiers?.maxHour || 1).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div className="w-full p-4">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900 text-lg">{order?.lots?.location || ''}</div>
                                        <div className="text-sm text-gray-600">{order?.lots?.name || ''}</div>
                                    </div>
                                </div>

                                {/* Important Notice */}
                                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-semibold mb-1">Important:</p>
                                            <p>Please ensure your license plate is clearly visible and exit before the specified time to avoid additional charges.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer Message */}
                        <div className="text-center space-y-2">
                            <p className="text-gray-600">Thank you for choosing Park Park!</p>
                            <p className="text-sm text-gray-500">A confirmation email has been sent to your registered email address.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}