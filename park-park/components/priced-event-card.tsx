import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParkingSchedule, ParkingLot } from "@/types";
import { Trash2 } from "lucide-react";
import ScheduleForm from "./dashboard/lots/schedule-form";
import { formatTime } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";

interface Props {
  event: ParkingSchedule;
  selectedLot: ParkingLot;
  selectedSchedule: ParkingSchedule | null;
  onSelect: () => void;

  onDelete: (
    schedule_id: string
  ) => Promise<void>;
}
export default function PricedEventCard({
  event,
  selectedLot,
  selectedSchedule,
  onSelect,
  onDelete,
}: Props) {
  return (
    <Card
      key={event.schedule_id}
      onClick={onSelect}
      className={`shadow-none border-b border-gray-200 transition-all duration-200 h-fit ${
        selectedSchedule?.schedule_id === event.schedule_id
          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
          : "hover:bg-gray-50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className={`font-semibold text-lg`}>{event.name}</h4>
            <p className={`flex items-center gap-1`}>{event.description}</p>
          </div>
          <div className="flex gap-2">
            <ScheduleForm selectedLot={selectedLot} schedule={event} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(event.schedule_id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex flex-1 gap-12">
            <div>
              <p>{event.is_event ? "Event Start" : "Open Time"}</p>
              <p>
                {event.is_event
                  ? formatTime(event.event_start)
                  : event.start_time}
              </p>
            </div>
            <div>
              <p>{event.is_event ? "Event End" : "Close Time"}</p>
              <p>
                {event.is_event ? formatTime(event.event_end) : event.end_time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${
                event.is_event
                  ? "bg-blue-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {!event.is_event
                ? "Regular"
                : new Date(event.event_end ?? "").getTime() <
                  new Date().getTime()
                ? "Event Passed"
                : "Event"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
