import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { ParkingLot } from "@/types";
import EventForm from "./dashboard/lots/event-form";

interface Event {
  id: string;
  name: string;
  start_time: string;
  venue: string;
}

interface Props {
  event: Event;
  selectedLot: ParkingLot;
}

export default function UpcomingEventCard({ event, selectedLot }: Props) {
  return (
    <div
      key={event.id}
      className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{event.name}</h3>
        <EventForm selectedLot={selectedLot} event={event} />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatTime(event.start_time)}
      </p>
      <Badge variant="outline" className="mt-1">
        {event.venue}
      </Badge>
    </div>
  );
}
