"use client"

import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Car, Loader2, Search } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { getPaymentStatusColor } from "@/lib/utils";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotOrders } from "@/lib/supabase/queries/order";
import { ParkingLot } from "@/types";
import { useState } from "react";


export default function Booking({ selectedLot }: { selectedLot: ParkingLot }) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: lotBookings, isLoading: isLoadingLotBookings } = useQuery(getLotOrders(supabase, selectedLot.lot_id, searchQuery))



  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Bookings</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search plate number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {isLoadingLotBookings && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      {!isLoadingLotBookings && lotBookings && lotBookings.length > 0 ? (
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