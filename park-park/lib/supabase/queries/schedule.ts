import { TypedSupabaseClient } from "@/types";


export function getLotSchedules(client: TypedSupabaseClient, lot_id: string) {
    return client.from('schedules').select('*').eq('lot_id', lot_id)
}

export async function getScheduleBySlug(client: TypedSupabaseClient, scheduleSlug: string) {
    return client.from('schedules').select('*').ilike('slug', `%${scheduleSlug}%`).maybeSingle();
}