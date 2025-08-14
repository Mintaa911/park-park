import { TypedSupabaseClient } from "@/types";


export async function getLotById(client: TypedSupabaseClient, lotId: string) {
    return await client.from('lots').select('*').eq('lot_id', lotId).maybeSingle();
}

export async function getLotBySlug(client: TypedSupabaseClient, lotSlug: string) {
    return await client.from('lots').select('*').ilike('slug', `%${lotSlug}%`).maybeSingle();
}

export async function searchParkingLots(client: TypedSupabaseClient, searchQuery: string) {
    if (!searchQuery.trim()) {
        return await client.from('lots').select('*').eq('status', 'OPEN').limit(10);
    }
    
    return await client
        .from('lots')
        .select('*')
        .eq('status', 'OPEN')
        .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(10);
}
