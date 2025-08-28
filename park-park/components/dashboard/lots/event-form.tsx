import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ParkingLot, ParkingSchedule as Schedule, Event } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const scheduleSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    is_event: z.boolean(),
    event_start: z.date().optional(),
    event_end: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.event_end && data.event_start) {
        return data.event_end > data.event_start;
      }
      return true;
    },
    {
      message: "Event start time must be before event end time",
      path: ["event_end"],
    }
  );

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  selectedLot: ParkingLot;
  schedule?: Schedule;
  event?: Event; // optional event
}

export default function EventForm({
  selectedLot,
  schedule,
  event,
}: ScheduleFormProps) {
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const eventStart = event?.start_time ? new Date(event.start_time) : undefined;

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: schedule?.name || "",
      description: schedule?.description || "",
      is_event: schedule?.is_event || false,
      event_start: schedule?.event_start
        ? new Date(schedule.event_start)
        : undefined,
      event_end: schedule?.event_end ? new Date(schedule.event_end) : undefined,
    },
  });
  const { mutateAsync: createSchedule } = useInsertMutation(
    supabase.from("schedules"),
    ["lot_id"],
    "lot_id",
    {
      onSuccess: () => {
        toast.success("Schedule created successfully");
        setIsCreateScheduleOpen(false);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: ["upcomingEvents", selectedLot.lot_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["pricedEvents", selectedLot.lot_id],
        });
      },
      onError: (error) => {
        console.error("Error creating schedule", error);
        toast.error("Error creating schedule");
      },
    }
  );

  // Reset form when dialog opens/closes or when schedule changes
  useEffect(() => {
    if (isCreateScheduleOpen) {
      form.reset({
        name: event?.name || "",
        description:
          event?.name && event?.venue ? event.name + " at " + event.venue : "",
        is_event: true,
        event_start: eventStart
          ? new Date(eventStart.getTime() - 2 * 60 * 60 * 1000)
          : undefined,
        event_end: eventStart
          ? new Date(eventStart.getTime() + 3 * 60 * 60 * 1000)
          : undefined,
      });
    }
  }, [isCreateScheduleOpen, schedule, form]);

  const handleOnSubmit = async (data: ScheduleFormData) => {
    try {
      // Create schedule data matching the database structure
      const scheduleData = {
        lot_id: selectedLot.lot_id,
        name: data.name,
        description: data.description,
        days: [],
        start_time: null,
        end_time: null,
        event_start: data.event_start?.toISOString(),
        event_end: data.event_end?.toISOString(),
        tm_event_id: event ? event?.id : null,
        is_event: true,
      };
      await createSchedule([scheduleData]);
    } catch (error) {
      console.error("Error creating/updating schedule:", error);
      toast.error("Error creating/updating schedule");
    }
  };

  const onSubmit = (data: ScheduleFormData) => {
    handleOnSubmit(data);
  };

  return (
    <div>
      <Dialog
        open={isCreateScheduleOpen}
        onOpenChange={setIsCreateScheduleOpen}
      >
        <DialogTrigger asChild>
          {schedule?.schedule_id ? (
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant={event ? "outline" : "default"} className="hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Add an event schedule for {selectedLot.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Name</FormLabel>
                    <FormControl>
                      <Input placeholder="event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Morning Rush..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid w-fit md:grid-cols-2 gap-2 mt-4 mb-4">
                <FormField
                  control={form.control}
                  name="event_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Start</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toLocaleString("sv-SE").slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event End</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toLocaleString("sv-SE").slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateScheduleOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="hover:bg-primary">Create Schedule</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
