import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Filter, Mail, Phone, Eye } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { getBookingStatusColor, getPaymentStatusColor } from "@/lib/utils";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotOrders } from "@/lib/supabase/queries/order";
import { ParkingLot } from "@/types";


export default function Booking({ selectedLot }: { selectedLot: ParkingLot }) {
    const supabase = createClient();
    const { data: lotBookings, isLoading: isLoadingLotBookings } = useQuery(getLotOrders(supabase, selectedLot.lot_id))
    return (
        <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Recent Bookings</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </div>

                  {!isLoadingLotBookings && lotBookings && lotBookings.length > 0 ? (
                    <div className="space-y-4">
                      {lotBookings.map((booking) => (
                        <Card key={booking.order_id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-lg text-gray-900">{booking.email}</h4>
                                <p className="text-gray-600 flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {booking.email}
                                </p>
                                <p className="text-gray-600 flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {booking.phone}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={getBookingStatusColor(booking.payment_status)}>
                                  {booking.payment_status}
                                </Badge>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">Booking Date</p>
                                <p className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Time Slot</p>
                                <p className="font-medium">
                                  {formatTime(booking.start_time)} - {formatTime(booking.start_time)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Payment</p>
                                <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                                  {booking.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No bookings found for this parking lot.</p>
                    </div>
                  )}
        </div>
    )
}