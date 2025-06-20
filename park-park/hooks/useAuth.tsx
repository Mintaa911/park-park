
import { useState, useEffect } from 'react';

import { getUser } from '@/lib/supabase/queries/user';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';


interface UseAuthReturn {
  user: User | null;
  userLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient()

  useEffect(() => {
    async function getUserInfo() {
      try {
        const userData = await getUser(supabase);
        if (!userData) return;

        setUser(userData);
      } catch {
        console.error('Error loading user');
      } finally {
        setIsLoading(false);
      }
    }

    getUserInfo();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) return;

    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      router.push('/auth/login');
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, userLoading: isLoading, signOut };
}
