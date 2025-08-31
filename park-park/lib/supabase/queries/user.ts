import { TypedSupabaseClient, UserRole } from "@/types";


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


export async function getUsers(client: TypedSupabaseClient, limit = 20, page = 1, searchQuery?: string) {
    let query = client
        .from('users')
        .select('*')
        .neq('role', UserRole.OWNER)
        .order('created_at', { ascending: false });
    
    if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.range((page - 1) * limit, page * limit)

    if(error) throw error
    
    return data;
}

export async function getUsersCount(client: TypedSupabaseClient) {
    const { count, error } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('role', UserRole.OWNER);

    if(error) throw error
    
    return count;
}