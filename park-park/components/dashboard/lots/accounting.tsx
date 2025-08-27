'use client'

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  Car
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLotMonthlyRevenue, getLotOrdersCount, getLotOrdersCountByType, getLotTotalRevenue } from "@/lib/supabase/queries/order";
import { createClient } from "@/lib/supabase/client";
import { LotBookingTypeChart } from "@/components/lot-booking-type-chart";
import { LotMonthlyBookingChart } from "@/components/lot-montly-booking-chart";

export default function Accounting({ lot_id }: { lot_id: string }) {
  const supabase = createClient()

  const { data: totalRevenue } = useQuery({
    queryKey: ['totalRevenue', lot_id],
    queryFn: () => getLotTotalRevenue(supabase, lot_id),
    enabled: !!lot_id
  })
  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', lot_id],
    queryFn: () => getLotMonthlyRevenue(supabase, lot_id),
    enabled: !!lot_id
  })
  const { data: totalBookings } = useQuery({
    queryKey: ['totalBooking', lot_id],
    queryFn: () => getLotOrdersCount(supabase, lot_id),
    enabled: !!lot_id
  })
  const { data: bookingTypeCount } = useQuery({
    queryKey: ['bookingTypeCount', lot_id],
    queryFn: () => getLotOrdersCountByType(supabase, lot_id),
    enabled: !!lot_id
  })

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Financial Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue && (
                    formatCurrency(totalRevenue)
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {monthlyRevenue && formatCurrency(monthlyRevenue)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalBookings}
                </p>
              </div>
              <Car className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {accountingInfo.occupancy_rate}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>
      
      <LotMonthlyBookingChart lot_id={lot_id} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookingTypeCount && (
          <LotBookingTypeChart countData={bookingTypeCount} />
        )}

        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Peak Hours Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Highest demand periods:</p>
              {accountingInfo.peak_hours.map((hour, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {hour}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Current Occupancy</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full"
                  style={{ width: `${accountingInfo.occupancy_rate}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold mt-2">
                {accountingInfo.occupancy_rate}%
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
