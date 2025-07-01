"use client"

import Link from "next/link";
import { getOrdersCount } from "@/lib/supabase/queries/order";
import { getLotsCount } from "@/lib/supabase/queries/lot";
import { getLotSchedulesCount } from "@/lib/supabase/queries/schedule";

import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHome() {
  const supabase = createClient();

  const { count: ordersCount } = useQuery(getOrdersCount(supabase))
  const { count: lotsCount } = useQuery(getLotsCount(supabase))
  const { count: schedulesCount } = useQuery(getLotSchedulesCount(supabase))
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your parking system today.</p>
        </div>

        <div className="flex md:flex-row flex-col gap-6 mb-8 justify-between">
          <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lots</p>
                <p className="text-2xl font-bold text-gray-900">{lotsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🚗</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+12% from last month</p>
          </div>

          <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">👥</span>

              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2">+5% from yesterday</p>
          </div>



          <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{schedulesCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-2">+23 new this week</p>
          </div>
        </div>

        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to your ParkEase Dashboard</h2>
          <p className="text-gray-600 mb-6">Navigate using the sidebar to manage your parking lots, bookings, and more.</p>
          <div className="inline-flex items-center gap-2 text-blue-600">
            <span>Start by visiting</span>
            <Link href="/dashboard/lots" className="font-semibold hover:underline">Parking Lots</Link>
          </div>
        </div>
      </div>
    </div>
  );
}