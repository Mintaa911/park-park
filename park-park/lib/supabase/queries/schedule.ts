import { getDayNumber } from "@/lib/utils";
import { TypedSupabaseClient } from "@/types";


export function getLotSchedules(client: TypedSupabaseClient, lot_id: string) {
    return client.from('schedules').select('*').eq('lot_id', lot_id)
}

export function getScheduleByScheduleId(client: TypedSupabaseClient, schedule_id: string) {
    return client.from('schedules').select('*').eq('schedule_id', schedule_id).maybeSingle();
}

export async function getScheduleBySlug(client: TypedSupabaseClient, scheduleSlug: string) {
    return client.from('schedules').select('*').ilike('slug', `%${scheduleSlug}%`).maybeSingle();
}

export async function getSchedulesByDay(client: TypedSupabaseClient, date: Date, lot_id: string) {
    try {
        const { data: eventSchedule, error: eventScheduleError } = await client.from('schedules')
        .select('*')
        .eq('lot_id', lot_id)
        .eq('is_event', true)
        .lte('event_start', date.toISOString())
        .gte('event_end', date.toISOString())


        if (eventScheduleError) throw eventScheduleError;
        if(eventSchedule.length > 0) return eventSchedule

        const day = getDayNumber(date)

        const { data: regularSchedule, error: regularScheduleError } = await client.from('schedules')  
        .select('*')
        .eq('lot_id', lot_id)
        .eq('is_event', false)
        .contains('days', [day])


        if (regularScheduleError) throw regularScheduleError;

        return regularSchedule
    } catch (error) {
        console.error(error);
    }
}
