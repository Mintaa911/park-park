import { TypedSupabaseClient } from "@/types";



export async function getLotVenue(client: TypedSupabaseClient, lot_id: string) {

  const { data, error } = await client
    .from('lot_venues')
    .select("*")
    .eq('lot_id', lot_id)

    if(error) throw error

    return data
}