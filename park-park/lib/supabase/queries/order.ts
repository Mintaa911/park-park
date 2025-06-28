import { TypedSupabaseClient } from "@/types";


export function getLotOrders(client: TypedSupabaseClient, lot_id: string, plate_number?: string) {
    let query = client.from('orders').select('*').eq('lot_id', lot_id)
    if (plate_number && plate_number !== "") {
        query = query.ilike('license_plate', `%${plate_number}%`)
    }
    return query.order('created_at', { ascending: false })
}