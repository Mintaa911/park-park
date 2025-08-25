"use client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ParkingLot, ParkingSchedule, Event } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getEventSchedules } from "@/lib/supabase/queries/schedule";
import { createClient } from "@/lib/supabase/client";
import { useDeleteMutation, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { toast } from "sonner";
import { getPriceTiers } from "@/lib/supabase/queries/price-tier";
import UpcomingEventCard from "@/components/up-coming-event-card";
import PricedEventCard from "@/components/priced-event-card";
import PriceTierList from "@/components/price-tier-list";
import EventForm from "./event-form";

interface AvailableEventsProps {
  selectedLot: ParkingLot;
}

export default function AvailableEvents({ selectedLot }: AvailableEventsProps) {
  const [view, setView] = useState<"upcoming" | "priced">("upcoming");
  const [selectedSchedule, setSelectedSchedule] = useState<ParkingSchedule | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const lotId = selectedLot.lot_id;

  //Queries
  const upcomingQuery = useQuery<Event[]>({
    queryKey: ["upcomingEvents", lotId],
    queryFn: async () => {
      const res = await fetch(`/api/available-events?lotId=${lotId}`);
      return res.json();
    },
    enabled: view === "upcoming",
  });

  const pricedQuery = useQuery<ParkingSchedule[]>({
    queryKey: ["pricedEvents", lotId],
    queryFn: () => getEventSchedules(supabase, lotId),
    enabled: view === "priced",
  });

  const priceTierQuery = useQuery({
    queryKey: ["price-tiers", selectedSchedule?.schedule_id],
    queryFn: () => getPriceTiers(supabase, selectedSchedule?.schedule_id ?? ""),
    enabled: !!selectedSchedule?.schedule_id,
  });
  //mutations
  const { mutateAsync: updateSchedule } = useUpdateMutation(
    supabase.from("schedules"),
    ["schedule_id"],
    "schedule_id",
    {
      onSuccess: () => {
        toast.success("Schedule updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["pricedEvents", selectedLot.lot_id],
        });
      },
      onError: (error) => {
        console.error("Error updating schedule", error);
        toast.error("Error updating schedule");
      },
    }
  );

  const deleteSchedule = async (schedule_id: string) => {
    await updateSchedule({ schedule_id, deleted_at: new Date().toISOString() })
  }

  const { mutateAsync: deletePriceTier } = useDeleteMutation(
    supabase.from("price_tiers"),
    ["price_id"],
    "price_id",
    {
      onSuccess: () => {
        toast.success("Price tier deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["price-tiers", selectedSchedule?.schedule_id],
        });
      },
      onError: () => toast.error("Error deleting price tier"),
    }
  );

  const { data, isLoading } = useMemo(() => {
    return view === "upcoming"
      ? { data: upcomingQuery.data, isLoading: upcomingQuery.isLoading }
      : { data: pricedQuery.data, isLoading: pricedQuery.isLoading };
  }, [view, upcomingQuery, pricedQuery]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nearby Events</h2>
          <div className="flex justify-between items-center">
            <EventForm selectedLot={selectedLot} />
            <select
              value={view}
              onChange={(e) => setView(e.target.value as "upcoming" | "priced")}
              className="border rounded-md p-1 text-sm"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="priced">Priced Events</option>
            </select>
          </div>
        </div>
        <p className="text-muted-foreground">No {view} events near this lot.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Nearby Events</h2>
        <div className="flex justify-between items-center">
          <EventForm selectedLot={selectedLot} />
          <select
            value={view}
            onChange={(e) => setView(e.target.value as "upcoming" | "priced")}
            className="border rounded-md p-1 text-sm"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="priced">Priced Events</option>
          </select>
        </div>
      </div>

      <div
        className={`grid  ${view === "priced" && ` grid-cols-2 `} gap-4 h-80`}
      >
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {view === "upcoming" &&
              (data as Event[]).map((event) => (
                <UpcomingEventCard
                  key={event.id}
                  event={event}
                  selectedLot={selectedLot}
                />
              ))}

            {view === "priced" &&
              (data as ParkingSchedule[]).map((event) => (
                <PricedEventCard
                  key={event.schedule_id}
                  event={event}
                  selectedLot={selectedLot}
                  selectedSchedule={selectedSchedule}
                  onSelect={() => setSelectedSchedule(event)}
                  onDelete={deleteSchedule}
                />
              ))}
          </div>
        </ScrollArea>

        {view === "priced" && (
          <PriceTierList
            schedule={selectedSchedule}
            priceTiers={priceTierQuery.data}
            onDelete={deletePriceTier}
          />
        )}
      </div>
    </Card>
  );
}
