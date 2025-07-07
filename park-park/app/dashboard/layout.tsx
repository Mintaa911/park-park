
import SidebarContent from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { getUser } from '@/lib/supabase/queries/user';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getOrdersCount } from '@/lib/supabase/queries/order';
import { getLotsCount } from '@/lib/supabase/queries/lot';
import { getLotSchedulesCount } from '@/lib/supabase/queries/schedule';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const queryClient = new QueryClient();

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  await prefetchQuery(queryClient, getOrdersCount(supabase))
  await prefetchQuery(queryClient, getLotsCount(supabase))
  await prefetchQuery(queryClient, getLotSchedulesCount(supabase))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:flex lg:w-72  lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white shadow-xl border-r border-gray-200">
            <SidebarContent />
          </div>
        </div>

        <div className="flex flex-col flex-1 lg:pl-72">
          <Header />

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </HydrationBoundary>

  );
}