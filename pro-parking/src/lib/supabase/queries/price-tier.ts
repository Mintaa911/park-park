import { TypedSupabaseClient } from "@/types";

export async function getPriceTierById(supabase: TypedSupabaseClient, price_id: string) {
    return await supabase.from('price_tiers').select('*').eq('price_id', price_id).maybeSingle();
}




