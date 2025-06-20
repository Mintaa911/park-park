import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Car, Edit, Trash2, Calendar } from "lucide-react";
import { ParkingLot } from "@/types";
import { useInsertMutation, useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotSchedules } from "@/lib/supabase/queries/schedule";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

// Zod schema for schedule validation
const scheduleSchema = z.object({
    timeSlot: z.string().min(1, "Schedule name is required").max(100, "Schedule name must be less than 100 characters"),
    duration: z.number().min(1, "Duration is required"),
    price: z.number().min(0.01, "Price must be greater than 0").max(1000, "Price must be less than $1000"),

}).refine((data) => {
    // Validate that end time is after start time
    return data.duration > 0;
}, {
    message: "Duration must be greater than 0",
    path: ["duration"]
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleProps {
    selectedLot: ParkingLot;
    isCreateScheduleOpen: boolean;
    setIsCreateScheduleOpen: (open: boolean) => void;
}

export default function Schedule({ selectedLot, isCreateScheduleOpen, setIsCreateScheduleOpen }: ScheduleProps) {
    const supabase = createClient();

    const { data: schedules, isLoading: isLoadingSchedules } = useQuery(getLotSchedules(supabase, selectedLot.lot_id))

    const { mutateAsync: createSchedule } = useInsertMutation(
        supabase.from('schedules'),
        ['lot_id'],
        'lot_id',
        {
            onSuccess: () => {
                console.log("Schedule created successfully");
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
            timeSlot: "",
            duration: 0,
            price: 0,
        }
    });

    const handleCreateSchedule = async (data: ScheduleFormData) => {
        try {
            // Create schedule data matching the database structure
            const scheduleData = {
                lot_id: selectedLot.lot_id,
                name: data.timeSlot,
                price: data.price,
                duration: data.duration,
                description: `Schedule for ${data.duration} hours at ${data.price} per hour`
            };

            await createSchedule([scheduleData]);
        } catch (error) {
            console.error("Error creating schedule:", error);
        }
    };



    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Parking Schedules</h3>
                <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Schedule</DialogTitle>
                            <DialogDescription>
                                Add a new parking schedule for {selectedLot.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreateSchedule)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="timeSlot"
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
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                    <Button type="submit">Create Schedule</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {
                !isLoadingSchedules && schedules && schedules.length > 0 ? (
                    <div className="grid gap-4">
                        {schedules.map((schedule) => (
                            <Card key={schedule.schedule_id} className="border-l-4 border-l-purple-500">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-900">{schedule.name}</h4>
                                            <p className="text-gray-600 flex items-center gap-1">{schedule.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                        <p className="text-gray-600 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {schedule.duration} hours
                                            </p> 
                                            <span className="font-medium">{formatCurrency(schedule.price)}</span>
                                           
                                        </div>
                                        
                                        {/* <div>
                                            <Badge variant={schedule.isActive ? "default" : "secondary"}>
                                                {schedule.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div> */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No schedules available for this parking lot.</p>
                        <p className="text-sm">Create your first schedule to start accepting bookings.</p>
                    </div>
                )
            }
        </div>
    )
}