import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ParkingLot, ParkingSchedule as Schedule } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useInsertMutation, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";


const scheduleSchema = z.object({
    name: z.string().min(1, "Schedule name is required").max(100, "Schedule name must be less than 100 characters"),
    description: z.string().optional(),
    is_event: z.boolean(),
    days: z.array(z.number()),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    event_start: z.date().optional(),
    event_end: z.date().optional(),

}).refine((data) => {
    if (data.event_end && data.event_start) {
        return data.event_end > data.event_start;
    } 
    return true;
}, {
    message: "Event start time must be before event end time",
    path: ["event_end"]
}).refine((data) => {
    if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
    } 
    return true;
}, {
    message: "Start time must be before end time",
    path: ["end_time"]
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
    selectedLot: ParkingLot;
    schedule?: Schedule;
}

export default function ScheduleForm({ selectedLot, schedule }: ScheduleFormProps) {
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
    const supabase = createClient();
    const queryClient = useQueryClient();

    const form = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            name: schedule?.name || "",
            description: schedule?.description || "",
            is_event: schedule?.is_event || false,
            days: schedule?.days || [],
            start_time: schedule?.start_time || "",
            end_time: schedule?.end_time || "",
            event_start: schedule?.event_start ? new Date(schedule.event_start) : undefined,
            event_end: schedule?.event_end ? new Date(schedule.event_end) : undefined,
        },
    });


    const { mutateAsync: updateSchedule } = useUpdateMutation(
        supabase.from('schedules'),
        ['schedule_id'],
        'schedule_id',
        {
            onSuccess: () => {
                toast.success("Schedule updated successfully");
                setIsCreateScheduleOpen(false);
                form.reset();
                queryClient.invalidateQueries({ queryKey: ['schedules', selectedLot.lot_id] })
            },
            onError: (error) => {
                console.error("Error updating schedule", error);
                toast.error("Error updating schedule");
            }
        }
    )

    const { mutateAsync: createSchedule } = useInsertMutation(
        supabase.from('schedules'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                toast.success("Schedule created successfully");
                setIsCreateScheduleOpen(false);
                form.reset();
                queryClient.invalidateQueries({ queryKey: ['schedules', selectedLot.lot_id] })
            },
            onError: (error) => {
                console.error("Error creating schedule", error);
                toast.error("Error creating schedule");
            }
        }
    )

    // Reset form when dialog opens/closes or when schedule changes
    useEffect(() => {
        if (isCreateScheduleOpen) {
            form.reset({
                name: schedule?.name || "",
                description: schedule?.description || "",
                is_event: schedule?.is_event || false,
                days: schedule?.days || [],
                start_time: schedule?.start_time || "",
                end_time: schedule?.end_time || "",
                event_start: schedule?.event_start ? new Date(schedule.event_start) : undefined,
                event_end: schedule?.event_end ? new Date(schedule.event_end) : undefined,
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
                days: data.is_event ? [] : data.days,
                event_start: data.is_event ? data.event_start?.toLocaleString('sv-SE') : null,
                event_end: data.is_event ? data.event_end?.toLocaleString('sv-SE') : null,
                start_time: data.is_event ? null : data.start_time,
                end_time: data.is_event ? null : data.end_time,
                is_event: data.is_event,
            };

            if (schedule?.schedule_id) {
                const updateData = { ...scheduleData, schedule_id: schedule.schedule_id };
                await updateSchedule(updateData);
            } else {
                await createSchedule([scheduleData]);
            }
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
            <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                <DialogTrigger asChild>
                    {schedule?.schedule_id ? (
                        <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Schedule
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Schedule</DialogTitle>
                        <DialogDescription>
                            {schedule?.schedule_id ? "Update" : "Add"} a parking schedule for {selectedLot.name}.
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
                                            <Input placeholder="e.g., Morning Rush" {...field} />
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
                                            <Textarea placeholder="e.g., Morning Rush..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("is_event") && (
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
                                                        value={field.value instanceof Date ? field.value.toLocaleString('sv-SE').slice(0, 16) : ''}
                                                        onChange={(e) => field.onChange(new Date(e.target.value))}
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
                                                        value={field.value instanceof Date ? field.value.toLocaleString('sv-SE').slice(0, 16) : ''}
                                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {!form.watch("is_event") && (
                                <div className="flex flex-wrap gap-4 mt-4 mb-4">
                                    <FormField
                                        control={form.control}
                                        name="start_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                        value={field.value || ''}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {!form.watch("is_event") && (
                                <FormField
                                    control={form.control}
                                    name="days"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Days of the Week</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { value: 1, label: "Monday" },
                                                        { value: 2, label: "Tuesday" },
                                                        { value: 3, label: "Wednesday" },
                                                        { value: 4, label: "Thursday" },
                                                        { value: 5, label: "Friday" },
                                                        { value: 6, label: "Saturday" },
                                                        { value: 7, label: "Sunday" }
                                                    ].map((day) => (
                                                        <div key={day.value} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`day-${day.value}`}
                                                                checked={field.value?.includes(day.value)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        field.onChange([...field.value, day.value]);
                                                                    } else {
                                                                        field.onChange(field.value?.filter((d: number) => d !== day.value) || []);
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`day-${day.value}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {day.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <div className="w-fit">
                                <FormField
                                    control={form.control}
                                    name="is_event"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Is Event</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                                <Button type="submit">{schedule?.schedule_id ? "Update Schedule" : "Create Schedule"}</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}