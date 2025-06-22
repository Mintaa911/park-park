import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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


const scheduleSchema = z.object({
    name: z.string().min(1, "Schedule name is required").max(100, "Schedule name must be less than 100 characters"),
    duration: z.number().min(1, "Duration is required"),
    arrive_after: z.date(),
    exit_before: z.date(),
    is_event: z.boolean(),
    price: z.number().min(0.01, "Price must be greater than 0").max(1000, "Price must be less than $1000"),

}).refine((data) => {
    // For event schedules, exit_before must be after arrive_after
    if (data.is_event) {
        return data.exit_before && data.arrive_after && data.exit_before > data.arrive_after;
    }
    return true;
}, {
    message: "Exit time must be after arrival time",
    path: ["exit_before"]
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
    selectedLot: ParkingLot;
    schedule?: Schedule;
}

export default function ScheduleForm({ selectedLot, schedule }: ScheduleFormProps) {
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);

    const supabase = createClient();

    const { mutateAsync: updateSchedule } = useUpdateMutation(
        supabase.from('schedules'),
        ['schedule_id'],
        'schedule_id',
        {
            onSuccess: () => {
                setIsCreateScheduleOpen(false);
                form.reset();
            },
            onError: (error) => {
                console.error("Error updating schedule", error);
            }
        }
    )

    const { mutateAsync: createSchedule } = useInsertMutation(
        supabase.from('schedules'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                setIsCreateScheduleOpen(false);
                form.reset();
            },
            onError: (error) => {
                console.error("Error creating schedule", error);
            }
        }
    )

    const form = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            name: schedule?.name || "",
            price: schedule?.price || 0,
            duration: schedule?.duration || 1,
            is_event: schedule?.is_event || false,
            arrive_after: schedule?.arrive_after ? new Date(schedule.arrive_after) : new Date(),
            exit_before: schedule?.exit_before ? new Date(schedule.exit_before) : new Date(),
        },
    });

    // Reset form when dialog opens/closes or when schedule changes
    useEffect(() => {
        if (isCreateScheduleOpen) {
            form.reset({
                name: schedule?.name || "",
                price: schedule?.price || 0,
                duration: schedule?.duration || 1,
                is_event: schedule?.is_event || false,
                arrive_after: schedule?.arrive_after ? new Date(schedule.arrive_after) : new Date(),
                exit_before: schedule?.exit_before ? new Date(schedule.exit_before) : new Date(),
            });
        }
    }, [isCreateScheduleOpen, schedule, form]);

    const handleOnSubmit = async (data: ScheduleFormData) => {
        try {
            // Create schedule data matching the database structure
            const scheduleData = {
                lot_id: selectedLot.lot_id,
                name: data.name,
                price: data.price,
                duration: !data.is_event ? data.duration : null,
                arrive_after: data.is_event ? data.arrive_after : null,
                exit_before: data.is_event ? data.exit_before : null,
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
                            <Trash2 className="w-4 h-4 mr-2" />
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="float"
                                                    step="0.01"
                                                    placeholder="e.g., 10.00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {!form.watch("is_event") && (
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 2"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            {form.watch("is_event") && (
                                <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                                    <FormField
                                        control={form.control}
                                        name="arrive_after"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Arrive After</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="exit_before"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exit Before</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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