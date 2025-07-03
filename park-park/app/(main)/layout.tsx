
import Link from "next/link";

import { type LucideProps, CarFront } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getLotBySlug } from "@/lib/supabase/queries/lot";

interface LayoutProps {
    children: React.ReactNode
    params: Promise<{ lot: string}>
}

export default async function Layout({ children, params }: LayoutProps){
    const { lot: lotSlug } = await params
    const supabase = await createClient()

    const queryClient = new QueryClient()

    await prefetchQuery(queryClient, getLotBySlug(supabase, lotSlug))

    const Icons = {
        logo: (props: LucideProps) => <CarFront {...props} />,
    };

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex flex-col flex-1 ">
                <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white flex justify-center h-16 border-b">
                    <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
                        <div className="flex gap-5 items-center font-semibold">
                            <Link
                                href={"/"}
                                className="flex items-center gap-2 font-bold"
                            >
                                <Icons.logo className="w-8 h-8" /> ParkPark
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 overflow-auto w-full max-w-7xl mx-auto px-5 py-4 pt-20">
                    {children}
                </main>
            </div>
        </HydrationBoundary>
    );
}