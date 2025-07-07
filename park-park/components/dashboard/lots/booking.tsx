"use client"

import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { getPaymentStatusColor } from "@/lib/utils";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotOrders, getOrdersCount } from "@/lib/supabase/queries/order";
import { ParkingLot } from "@/types";
import { useState } from "react";

const ITEMS_PER_PAGE = 20;

export default function Booking({ selectedLot }: { selectedLot: ParkingLot }) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: lotBookings, isLoading: isLoadingLotBookings } = useQuery(
    getLotOrders(supabase, selectedLot.lot_id, searchQuery, ITEMS_PER_PAGE, currentPage)
  );

  const { count: totalCount, isLoading: isLoadingCount } = useQuery(
    getOrdersCount(supabase, selectedLot.lot_id)
  );

  const totalPages = totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Bookings</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search plate number"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {(isLoadingLotBookings || isLoadingCount) && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      {!isLoadingLotBookings && lotBookings && lotBookings.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotBookings.map((booking) => (
                <TableRow key={booking.order_id}>
                  <TableCell>
                    {booking.phone}
                  </TableCell>
                  <TableCell>
                    {booking.license_state} {booking.license_plate}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {formatTime(booking.start_time)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(booking.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount || 0)} of{" "}
                {totalCount || 0} bookings
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>
            {searchQuery.trim()
              ? "No bookings found matching your search."
              : "No bookings found for this parking lot."
            }
          </p>
        </div>
      )}
    </div>
  )
}