import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, BarChart3, Car, PieChart, CreditCard, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AccountingInfo {
    total_revenue: number;
    monthly_revenue: number;
    weekly_revenue: number;
    daily_revenue: number;
    total_bookings: number;
    pending_payments: number;
    refunds_issued: number;
    average_booking_value: number;
    occupancy_rate: number;
    peak_hours: string[];
  }

export default function Accounting() {
      // Sample accounting data
  const [accountingInfo] = useState<AccountingInfo>({
    total_revenue: 12450.00,
    monthly_revenue: 3200.00,
    weekly_revenue: 850.00,
    daily_revenue: 125.00,
    total_bookings: 245,
    pending_payments: 3,
    refunds_issued: 2,
    average_booking_value: 16.75,
    occupancy_rate: 78.5,
    peak_hours: ['07:00-10:00', '17:00-20:00']
  });

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(accountingInfo.total_revenue)}
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
                                    {formatCurrency(accountingInfo.monthly_revenue)}
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
                                <p className="text-2xl font-bold text-purple-600">{accountingInfo.total_bookings}</p>
                            </div>
                            <Car className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Occupancy Rate</p>
                                <p className="text-2xl font-bold text-orange-600">{accountingInfo.occupancy_rate}%</p>
                            </div>
                            <PieChart className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Booking Value</span>
                            <span className="font-semibold">{formatCurrency(accountingInfo.average_booking_value)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pending Payments</span>
                            <span className="font-semibold text-yellow-600">{accountingInfo.pending_payments}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Refunds Issued</span>
                            <span className="font-semibold text-red-600">{accountingInfo.refunds_issued}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Weekly Revenue</span>
                            <span className="font-semibold">{formatCurrency(accountingInfo.weekly_revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Daily Revenue</span>
                            <span className="font-semibold">{formatCurrency(accountingInfo.daily_revenue)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
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
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                                    style={{ width: `${accountingInfo.occupancy_rate}%` }}
                                ></div>
                            </div>
                            <p className="text-lg font-bold mt-2">{accountingInfo.occupancy_rate}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
