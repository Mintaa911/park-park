import { TypedSupabaseClient } from "@/types";

export async function getPriceTiers(supabase: TypedSupabaseClient, schedule_id: string) {
    const { data, error } = await supabase.from('price_tiers').select('*').eq('schedule_id', schedule_id);
    if (error) {
        throw error;
    }
    return data;
}

export function getPriceTierById(supabase: TypedSupabaseClient, price_id: string) {
    return supabase.from('price_tiers').select('*').eq('price_id', price_id).maybeSingle();
}




