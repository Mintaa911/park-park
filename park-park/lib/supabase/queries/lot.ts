import { ParkingLot, TypedSupabaseClient } from "@/types";




export async function getLotsBySupervisor(client: TypedSupabaseClient, user_id: string) {
    const { data, error } = await client.from('lots').select('*').contains('supervisors', [user_id]);
    if (error) {
        throw error;
    }
    return data;
}


export async function createLot(client: TypedSupabaseClient, lot: ParkingLot) {
    return client.from('lots').insert(lot);
}
