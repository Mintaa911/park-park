import { TypedSupabaseClient } from "@/types";


export function getLotSchedules(client: TypedSupabaseClient, lot_id: string) {
    return client.from('schedules').select('*').eq('lot_id', lot_id)
}