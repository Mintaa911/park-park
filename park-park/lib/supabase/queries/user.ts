import { TypedSupabaseClient } from "@/types";


export async function getUser(client: TypedSupabaseClient) {
    try {
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        const { data: userData, error: userError } = await client.from('users').select('role').eq('user_id', data.user?.id).maybeSingle();
        if (userError) throw userError;

        return { ...data.user, role: userData?.role};
    } catch (error) {
        console.error(error);
        throw error;
    }
}