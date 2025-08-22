import { getDayNumber } from "@/lib/utils";
import { TypedSupabaseClient } from "@/types";

export async function getSchedulesByDay(client: TypedSupabaseClient, date: Date, lot_id: string) {
    try {
        const { data: eventSchedule, error: eventScheduleError } = await client.from('schedules')
        .select(`
            *,
            price_tiers(*)
        `)
        .eq('lot_id', lot_id)
        .eq('is_event', true)
        .lte('event_start', date.toLocaleString('sv-SE'))
        .gte('event_end', date.toLocaleString('sv-SE'))
        .is('deleted_at', null)


        if (eventScheduleError) throw eventScheduleError;
        if(eventSchedule.length > 0) return eventSchedule

        const day = getDayNumber(date)
        const hour = date.getHours().toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')

        const { data: regularSchedule, error: regularScheduleError } = await client.from('schedules')  
        .select(`
            *,
            price_tiers(*)
        `)
        .eq('lot_id', lot_id)
        .eq('is_event', false)
        .contains('days', [day])
        .lte('start_time', `${hour}:${minute}`)
        .gte('end_time', `${hour}:${minute}`)
        .is('deleted_at', null)


        if (regularScheduleError) throw regularScheduleError;

        return regularSchedule
    } catch (error) {
        console.error(error);
    }
}
