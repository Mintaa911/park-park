'use client';

import { createClient } from "@/lib/supabase/client";
import { getOrderByPaymentIntentId } from "@/lib/supabase/queries/order";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const paymentIntentId = searchParams.get('session_id');

    const supabase = createClient();

    const { data: order, isLoading } = useQuery(getOrderByPaymentIntentId(supabase, paymentIntentId!))


    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    )

    const formatExitTime = (endTime: string, maxHour: number) => {
        const endDate = new Date(endTime);
        const exitTime = new Date(endDate.getTime() + (1000 * 60 * 60 * maxHour));
        return exitTime;
    }

    return (
        <div className="md:w-[70%] md:mx-auto md:p-4">
            {order && (
                <Card className="w-full md:max-w-xl shadow-lg">
                    <CardHeader className="rounded-t-xl text-center p-4">
                        <CardTitle className="text-lg font-bold">This is your parking pass</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-2 py-6">
                        <div className=" rounded-lg w-full p-4 flex flex-col items-center gap-2 border border-blue-100">
                            <div className="text-xs text-blue-900 font-semibold tracking-wider">PARKING PASS #{order?.stripe_payment_intent_id || 'XXXXXXX'}</div>
                            <div className="flex items-center gap-2 text-base font-bold text-blue-900">
                                License Plate: {order?.license_plate || 'XXXXXXX'}
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex w-full justify-between items-center bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-blue-700 font-semibold">PARK AFTER</span>
                                <span className="text-lg font-bold text-blue-900">
                                    {new Date(order.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <p className="text-xs text-blue-700">
                                    {new Date(order.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <span className="text-2xl text-blue-400">→</span>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-blue-700 font-semibold">EXIT BEFORE</span>
                                <span className="text-lg font-bold text-blue-900">
                                    {formatExitTime(order.start_time, order.price_tiers?.maxHour || 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <p className="text-xs text-blue-700">
                                    {formatExitTime(order.start_time, order.price_tiers?.maxHour || 1).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 w-full text-left text-sm text-blue-900">
                            <div className="font-semibold">{order?.lots?.location || ''}</div>
                            <div className="text-xs">{order?.lots?.name || ''}</div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}