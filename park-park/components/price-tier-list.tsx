import PriceTierForm from "./dashboard/lots/price-tier-form";
import { ParkingSchedule, PriceTier } from "@/types";
import { ArrowRight, Trash2 } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";

interface Props {
  schedule: ParkingSchedule | null;
  priceTiers: PriceTier[] | undefined;
  onDelete: (args: {
    price_id: string;
  }) => Promise<{ price_id: string } | null>;
}

export default function PriceTierList({
  schedule,
  priceTiers,
  onDelete,
}: Props) {
  if (!schedule) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Select an event to view its pricing tiers
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Price Tiers</h3>
        {priceTiers && priceTiers.length > 0 ? (
          <div>
            <div className="flex flex-col gap-4">
              {priceTiers.map((tier) => (
                <div
                  key={tier.price_id}
                  className="space-y-2 border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between w-full">
                    <p className="font-semibold flex items-center gap-1">
                      {tier.maxHour} hours
                    </p>
                    <h4 className="font-semibold text-lg">
                      {formatCurrency(tier.price)}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <p>
                        {schedule?.is_event && formatTime(schedule.event_start)}
                        {!schedule?.is_event &&
                          schedule?.start_time &&
                          formatTime(schedule?.start_time)}
                      </p>
                      <ArrowRight className="w-4 h-4" />
                      <p>
                        {schedule?.is_event && formatTime(schedule.event_end)}
                        {!schedule?.is_event &&
                          schedule?.end_time &&
                          formatTime(schedule?.end_time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriceTierForm
                        sechuledId={schedule?.schedule_id ?? ""}
                        priceTier={tier}
                      />
                      <Trash2
                        className="w-4 h-4"
                        onClick={() => onDelete({ price_id: tier.price_id })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              {schedule?.schedule_id && (
                <PriceTierForm sechuledId={schedule.schedule_id} />
              )}
            </div>
          </div>
        ) : schedule?.schedule_id ? (
          <div className="text-center py-8 text-gray-500">
            <p>No price tiers available for this schedule.</p>
            <p className="text-sm mb-4">
              Create your first price tier to start accepting bookings.
            </p>
            <div className="flex justify-center mt-8">
              <PriceTierForm sechuledId={schedule.schedule_id} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No schedule selected.</p>
            <p className="text-sm mb-4">
              Select a schedule to create a price tier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
