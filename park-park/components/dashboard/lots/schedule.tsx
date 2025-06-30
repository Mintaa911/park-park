"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { ParkingLot, ParkingSchedule } from "@/types";
import { useDeleteMutation, useQuery as useSupabaseQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotSchedules } from "@/lib/supabase/queries/schedule";
import { formatCurrency, formatTime } from "@/lib/utils";
import ScheduleForm from "./schedule-form";
import { getPriceTiers } from "@/lib/supabase/queries/price-tier";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PriceTierForm from "./price-tier-form";
import { toast } from "sonner";

interface ScheduleProps {
    selectedLot: ParkingLot;
}


type FilterType = 'all' | 'regular' | 'event';

export default function Schedule({ selectedLot }: ScheduleProps) {
    const [selectedSchedule, setSelectedSchedule] = useState<ParkingSchedule | null>(null);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const supabase = createClient();
    const queryClient = useQueryClient();

    const { data: schedules, isLoading: isLoadingSchedules } = useSupabaseQuery(getLotSchedules(supabase, selectedLot.lot_id))

    // Filter schedules based on selected filter type
    const filteredSchedules = schedules?.filter((schedule) => {
        if (filterType === 'all') return true;
        if (filterType === 'regular') return !schedule.is_event;
        if (filterType === 'event') return schedule.is_event;
        return true;
    }) || [];

    // Clear selected schedule if it's filtered out
    useEffect(() => {
        if (selectedSchedule && !filteredSchedules.find(s => s.schedule_id === selectedSchedule.schedule_id)) {
            setSelectedSchedule(null);
        }
    }, [filteredSchedules, selectedSchedule])

    const query = useQuery({
        queryKey: ['price-tiers', selectedSchedule?.schedule_id],
        queryFn: () => getPriceTiers(supabase, selectedSchedule?.schedule_id ?? ''),
        enabled: !!selectedSchedule?.schedule_id
    })

    const { mutateAsync: deleteSchedule } = useDeleteMutation(
        supabase.from('schedules'),
        ['schedule_id'],
        'schedule_id',
        {
            onSuccess: () => {
                toast.success("Schedule deleted successfully");
                queryClient.invalidateQueries({ queryKey: ['schedules', selectedLot.lot_id] })
            },
            onError: (error) => {
                console.error("Error deleting schedule", error);
                toast.error("Error deleting schedule");
            }
        }
    )

    const handleViewTier = (schedule: ParkingSchedule) => {
        setSelectedSchedule(schedule);
    }

    const getWeekDay = (day: number) => {
        switch (day) {
            case 1:
                return "Mon"
            case 2:
                return "Tue"
            case 3:
                return "Wed"
            case 4:
                return "Thu"
            case 5:
                return "Fri"
            case 6:
                return "Sat"
            case 7:
                return "Sun"
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Parking Schedules</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Filter:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                    {filterType === 'all' ? 'All Schedules' :
                                        filterType === 'regular' ? 'Regular Schedules' : 'Event Schedules'}
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setFilterType('all')}>
                                    All Schedules
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('regular')}>
                                    Regular Schedules
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterType('event')}>
                                    Event Schedules
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <span className="text-xs text-gray-500 ml-2">
                            {filteredSchedules.length} of {schedules?.length || 0} schedules
                        </span>
                    </div>
                    <ScheduleForm
                        selectedLot={selectedLot}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {
                    !isLoadingSchedules && filteredSchedules && filteredSchedules.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredSchedules.map((schedule) => (
                                <Card key={schedule.schedule_id}
                                    onClick={() => handleViewTier(schedule)}
                                    className={`shadow-none border-b border-gray-200 transition-all duration-200 h-fit ${selectedSchedule?.schedule_id === schedule.schedule_id
                                        ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                                        : 'hover:bg-gray-50'
                                        }`}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className={`font-semibold text-lg`}>{schedule.name}</h4>
                                                <p className={`flex items-center gap-1`}>{schedule.description}</p>
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
                                        {!schedule.is_event && (
                                            <div className="flex gap-2 py-2">
                                                <span>Working Days</span>
                                                {schedule.days.map((day: number) => {
                                                    return <Badge key={day} variant="outline" className="bg-blue-500 text-white">{getWeekDay(day)}</Badge>

                                                })}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 justify-between">
                                            <div className="flex flex-1 gap-12">
                                                <div>
                                                    <p>{schedule.is_event ? "Event Start" : "Open Time"}</p>
                                                    <p>{schedule.is_event ? formatTime(schedule.event_start) : schedule.start_time}</p>
                                                </div>
                                                <div>
                                                    <p>{schedule.is_event ? "Event End" : "Close Time"}</p>
                                                    <p>{schedule.is_event ? formatTime(schedule.event_end) : schedule.end_time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`${schedule.is_event ? "bg-blue-500 text-white" : "bg-gray-500 text-white"}`}>{schedule.is_event ? "Event" : "Regular"}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>
                                {filterType === 'all'
                                    ? "No schedules available for this parking lot."
                                    : `No ${filterType} schedules available.`
                                }
                            </p>
                            <p className="text-sm">
                                {filterType === 'all'
                                    ? "Create your first schedule to start accepting bookings."
                                    : `Create a ${filterType} schedule or switch to a different filter.`
                                }
                            </p>
                        </div>
                    )
                }
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-semibold">Price Tiers</h3>
                    {query.data && query.data.length > 0 ? (
                        <div>
                            <div className="flex flex-col gap-4">
                                {query.data.map((tier) => (
                                    <div key={tier.price_id} className="space-y-2 border border-gray-200 p-4 rounded-lg">
                                        <div className="flex justify-between w-full">
                                            <p className="font-semibold flex items-center gap-1">{tier.maxHour} hours</p>
                                            <h4 className="font-semibold text-lg">{formatCurrency(tier.price)}</h4>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center">
                                                <p>
                                                    {
                                                        selectedSchedule?.is_event && (formatTime(selectedSchedule.event_start))
                                                    }
                                                    {!selectedSchedule?.is_event && selectedSchedule?.start_time && (formatTime(selectedSchedule?.start_time))}
                                                </p>
                                                <ArrowRight className="w-4 h-4" />
                                                <p>
                                                    {
                                                        selectedSchedule?.is_event && (formatTime(selectedSchedule.event_end))
                                                    }
                                                    {!selectedSchedule?.is_event && selectedSchedule?.end_time && (formatTime(selectedSchedule?.end_time))}
                                                </p>
                                            </div>
                                            <PriceTierForm
                                                sechuledId={selectedSchedule?.schedule_id ?? ''}
                                                priceTier={tier}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-8">
                                {selectedSchedule?.schedule_id && (
                                    <PriceTierForm
                                        sechuledId={selectedSchedule.schedule_id}
                                    />
                                )}
                            </div>
                        </div>
                    ) : selectedSchedule?.schedule_id ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No price tiers available for this schedule.</p>
                            <p className="text-sm mb-4">Create your first price tier to start accepting bookings.</p>
                            <div className="flex justify-center mt-8">
                                <PriceTierForm
                                    sechuledId={selectedSchedule.schedule_id}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No schedule selected.</p>
                            <p className="text-sm mb-4">Select a schedule to create a price tier.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}