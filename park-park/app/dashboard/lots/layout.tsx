import { createClient } from "@/lib/supabase/server";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function LotsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
  
    const queryClient = new QueryClient();

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div>{children}</div>
        </HydrationBoundary>
    )
}