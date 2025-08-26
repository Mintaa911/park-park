"use client";

import { useSearchParams } from "next/navigation";
import { Car, CheckCircle2, Clock, Calendar, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("session_id");

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(`/api/orders?paymentIntentId=${paymentIntentId}`);
      if (!res.ok) throw new Error("Error fetching booking data");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your parking pass...</p>
        </div>
      </div>
    );

  const formatExitTime = (endTime: string, maxHour: number) => {
    const endDate = new Date(endTime);
    const exitTime = new Date(endDate.getTime() + 1000 * 60 * 60 * maxHour);
    return exitTime;
  };
  return (
    <div className="flex flex-col items-center min-h-screen  px-4 py-8">
      {order ? (
        <div>
          {/* Success header */}
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              Payment Successful
            </h1>
            <p className="text-gray-500">Your parking pass is confirmed</p>
          </div>

          {/* Ticket container */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-6 text-center border-b border-dashed border-gray-300">
              <Car className="w-6 h-6 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">LICENSE PLATE</p>
              <p className="text-xl font-extrabold tracking-widest text-gray-900">
                {order?.license_plate || "XXXXXXX"}{" "}
              </p>

              <div className="mt-4">
                <p className="text-sm text-gray-500">PASS NUMBER</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-mono text-gray-800 text-sm">
                    {order?.stripe_payment_intent_id || "XXXXXXX"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 border-b border-dashed border-gray-300">
              <div className="flex flex-col gap-6 relative">
                {/* timeline line */}
                <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200" />
                {/* Start */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">START</p>
                    <p className="font-semibold text-gray-800">
                      {" "}
                      {new Date(order.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      .{" "}
                      {new Date(order.start_time).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {/* End */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">END</p>
                    <p className="font-semibold text-gray-800">
                      {" "}
                      {formatExitTime(
                        order.start_time,
                        order.price_tiers?.maxHour || 1
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      .{" "}
                      {formatExitTime(
                        order.start_time,
                        order.price_tiers?.maxHour || 1
                      ).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="px-6 py-6 text-center space-y-4">
              {/* Lot info */}
              <div>
                <p className="font-semibold text-gray-800">
                  {" "}
                  {order?.lots?.name || ""}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />

                  <p className="text-gray-500 text-sm">
                    {" "}
                    {order?.lots?.location || ""}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                {/* <QRCode value={passNumber} size={140} /> */}
              </div>
            </div>
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>
                    Please ensure your license plate is clearly visible and exit
                    before the specified time to avoid additional charges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2 mt-6">
            <p className="text-gray-600">Thank you for choosing Pro Parking!</p>
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email
              address.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 justify-center">
          <p>Please refresh the page to load your booking information</p>
          <Button
            onClick={() => {
              window.location.reload();
            }}
            className="w-fit"
          >
            Reload page
          </Button>
        </div>
      )}
    </div>
  );
}
