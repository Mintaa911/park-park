import { TypedSupabaseClient } from "@/types";

export function getOrdersCount(client: TypedSupabaseClient, lot_id?: string) {
    let query = client.from('orders').select('*', { count: 'exact', head: true })
    if (lot_id) {
        query = query.eq('lot_id', lot_id)
    }
    return query
}

export function getLotOrders(client: TypedSupabaseClient, lot_id: string, plate_number?: string, limit = 20, page = 1) {
    let query = client.from('orders').select('*').eq('lot_id', lot_id)
    if (plate_number && plate_number !== "") {
        query = query.ilike('license_plate', `%${plate_number}%`)
    }
    return query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit)
}

export function getOrderByPaymentIntentId(client: TypedSupabaseClient, payment_intent_id: string) {
    return client
    .from('orders')
    .select(`*,
        price_tiers(price_id, price, maxHour),
        schedules(schedule_id, event_start, event_end, start_time, end_time, is_event),
        lots(lot_id, name, location, description)
        `)
    .eq('stripe_payment_intent_id', payment_intent_id)
    .maybeSingle()
}