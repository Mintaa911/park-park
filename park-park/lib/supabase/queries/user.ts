import { TypedSupabaseClient, UserRole } from "../../../types";


export async function getUser(client: TypedSupabaseClient) {
    try {
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        const { data: userData, error: userError } = await client.from('users').select('*').eq('user_id', data.user?.id).single();
        if (userError) throw userError;
        
        return { ...data.user, role: userData.role};
    } catch (error) {
        console.error(error);
        throw error;
    }
}