import { TypedSupabaseClient } from "@/types";


export async function getOrderByPaymentIntentId(client: TypedSupabaseClient, payment_intent_id: string) {
    return await client
    .from('orders')
    .select(`*,
        price_tiers(price_id, price, maxHour),
        schedules(schedule_id, event_start, event_end, start_time, end_time, is_event),
        lots(lot_id, name, location, description)
        `)
    .eq('stripe_payment_intent_id', payment_intent_id)
    .maybeSingle()
}