"use client";
import { RevenueTable } from "@/components/revenue-table";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { getRevenueByLot } from "@/lib/supabase/queries/order";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const supabase = createClient();
  // const [data, setData] = useState<OrderTypeDataItem[]>([]);
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // yyyy-MM format for <input type="month" />

  const {
    data: lotsRevenue,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lotsRevenue", month],
    queryFn: () => getRevenueByLot(supabase, month),
  });
  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-5 flex-grow mt-4" />
        <Skeleton className="h-2 flex-grow mt-4" />
        <Skeleton className="h-[50vh] flex-grow  mt-4 mb-4" />
      </div>
    );
  }
  if (error) {
    console.log(error.message);
  }

    return (
      <div className="min-h-screen p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-2">
              Monthly Revenue Report
            </h1>
            <p className="text-gray-600">
              Comprehensive management of your parking facilities
            </p>
          </div>
          {lotsRevenue && lotsRevenue.length > 0 ? (
            <RevenueTable data={lotsRevenue} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    );
  
}
