import { TypedSupabaseClient } from "@/types";


export function getLotOrders(client: TypedSupabaseClient, lot_id: string) {
    return client.from('orders').select('*').eq('lot_id', lot_id)
}
