import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getLotBySlug } from '@/lib/supabase/queries/lot';

export const metadata: Metadata = {
    title: 'Parking Lot Schedule',
    description: 'View and book parking schedules',
};

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        lot: string;
    }>
}

export default async function Layout({ children, params }: LayoutProps) {
    const { lot: lotSlug } = await params;

    const supabase = await createClient();
    const queryClient = new QueryClient();

    await prefetchQuery(queryClient, getLotBySlug(supabase, lotSlug))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="min-h-screen bg-background">
                {children}
            </div>
        </HydrationBoundary>
    );
}