import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trash2 } from "lucide-react";
import { ParkingLot } from "@/types";
import { useDeleteMutation, useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotSchedules } from "@/lib/supabase/queries/schedule";
import { formatCurrency, formatTime } from "@/lib/utils";
import ScheduleForm from "./schedule-form";

interface ScheduleProps {
    selectedLot: ParkingLot;
}

export default function Schedule({ selectedLot }: ScheduleProps) {
    const supabase = createClient();

    const { data: schedules, isLoading: isLoadingSchedules } = useQuery(getLotSchedules(supabase, selectedLot.lot_id))

    const { mutateAsync: deleteSchedule } = useDeleteMutation(
        supabase.from('schedules'),
        ['schedule_id'],
        'schedule_id',
        {
            onSuccess: () => {
                console.log("Schedule deleted successfully");
            },
            onError: (error) => {
                console.error("Error deleting schedule", error);
            }
        }
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Parking Schedules</h3>
                <ScheduleForm
                    selectedLot={selectedLot}
                />
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
                                            <ScheduleForm
                                                selectedLot={selectedLot}
                                                schedule={schedule}
                                            />
                                            <Button variant="outline" size="sm" onClick={() => deleteSchedule({ schedule_id: schedule.schedule_id })}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {schedule.arrive_after && schedule.exit_before && (
                                        <div className="flex flex-col gap-2 mb-3">
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Arrive After: {formatTime(schedule.arrive_after)}
                                            </p>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Exit Before: {formatTime(schedule.exit_before)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between sm:grid-cols-4 gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            {schedule.duration && (
                                                <p className="text-gray-600 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {schedule.duration} hours
                                                </p>
                                            )}

                                        </div>

                                        <p className="flex items-center text-xl font-semibold">
                                            {formatCurrency(schedule.price)}
                                        </p>
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