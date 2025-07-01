import { ParkingLot, TypedSupabaseClient } from "@/types";

export function getLotById(client: TypedSupabaseClient, lotId: string) {
    return client.from('lots').select('*').eq('lot_id', lotId).maybeSingle();
}

export function getLotsCount(client: TypedSupabaseClient) {
    return client.from('lots').select('*', { count: 'exact', head: true })
}

export async function getLotsBySupervisor(client: TypedSupabaseClient, user_id: string) {
    const { data, error } = await client.from('lots').select('*').contains('supervisors', [user_id]);
    if (error) {
        throw error;
    }
    return data;
}

export function getLotBySlug(client: TypedSupabaseClient, lotSlug: string) {
    return client.from('lots').select('*').ilike('slug', `%${lotSlug}%`).maybeSingle();
}

export async function createLot(client: TypedSupabaseClient, lot: ParkingLot) {
    return client.from('lots').insert(lot);
}

export function searchParkingLots(client: TypedSupabaseClient, searchQuery: string) {
    if (!searchQuery.trim()) {
        return client.from('lots').select('*').eq('status', 'OPEN').limit(10);
    }
    
    return client
        .from('lots')
        .select('*')
        .eq('status', 'OPEN')
        .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);
}
