"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { ParkingLot, ParkingSchedule } from "@/types";
import { useDeleteMutation, useQuery as useSupabaseQuery, useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getLotSchedules } from "@/lib/supabase/queries/schedule";
import { formatCurrency, formatTime } from "@/lib/utils";
import ScheduleForm from "./schedule-form";
import { getPriceTiers } from "@/lib/supabase/queries/price-tier";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";

interface ScheduleProps {
    selectedLot: ParkingLot;
}

const formSchema = z.object({
    price: z.number().min(0),
    maxHour: z.number().min(0),
})

type FormData = z.infer<typeof formSchema>;

export default function Schedule({ selectedLot }: ScheduleProps) {
    const [selectedSchedule, setSelectedSchedule] = useState<ParkingSchedule | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createClient();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: 0,
            maxHour: 0,
        },
    })

    useEffect(() => {
        if (selectedSchedule && selectedSchedule.schedule_id) {
            form.reset();
        }
    }, [selectedSchedule, form])

    const { data: schedules, isLoading: isLoadingSchedules } = useSupabaseQuery(getLotSchedules(supabase, selectedLot.lot_id))
    const query = useQuery({
        queryKey: ['price-tiers', selectedSchedule?.schedule_id],
        queryFn: () => getPriceTiers(supabase, selectedSchedule?.schedule_id ?? ''),
        enabled: !!selectedSchedule?.schedule_id
    })

    const { mutateAsync: createPriceTier, isPending: isCreatingPriceTier } = useInsertMutation(
        supabase.from('price_tiers'),
        ['price_id'],
        'price_id',
        {
            onSuccess: () => {
                console.log("Price tier created successfully");
            },
            onError: (error) => {
                console.error("Error creating price tier", error);
            }
        }
    )

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

    const handleViewTier = (schedule: ParkingSchedule) => {
        setSelectedSchedule(schedule);
    }

    const handleCreateTier = (data: FormData) => {
        if (selectedSchedule && selectedSchedule.schedule_id) {
            createPriceTier([
                {
                    schedule_id: selectedSchedule.schedule_id,
                    price: data.price,
                    maxHour: data.maxHour,
                }
            ])
        }
        setIsModalOpen(false);
        form.reset();
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
                <ScheduleForm
                    selectedLot={selectedLot}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {
                    !isLoadingSchedules && schedules && schedules.length > 0 ? (
                        <div className="grid gap-4">
                            {schedules.map((schedule) => (
                                <Card key={schedule.schedule_id}
                                    onClick={() => handleViewTier(schedule)}
                                    className={`shadow-none border-b border-gray-200 transition-all duration-200 ${selectedSchedule?.schedule_id === schedule.schedule_id
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
                            <p>No schedules available for this parking lot.</p>
                            <p className="text-sm">Create your first schedule to start accepting bookings.</p>
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
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-8">
                                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="sm">Create Price Tier</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Price Tier</DialogTitle>
                                        </DialogHeader>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleCreateTier)} className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Price</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 100"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="maxHour"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Max Hour</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 24"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                                                    <Button variant="default" type="submit" disabled={isCreatingPriceTier}>{isCreatingPriceTier ? "Creating..." : "Create"}</Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ) : selectedSchedule?.schedule_id ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No price tiers available for this schedule.</p>
                            <p className="text-sm mb-4">Create your first price tier to start accepting bookings.</p>
                            <div className="flex justify-center mt-8">
                                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="sm">Create Price Tier</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Price Tier</DialogTitle>
                                        </DialogHeader>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleCreateTier)} className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Price</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 100"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="maxHour"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Max Hour</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 24"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                                                    <Button variant="default" type="submit" disabled={isCreatingPriceTier}>{isCreatingPriceTier ? "Creating..." : "Create"}</Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
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