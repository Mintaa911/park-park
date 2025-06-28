'use client';

import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLotBySlug } from '@/lib/supabase/queries/lot';
import { getSchedulesByDay } from '@/lib/supabase/queries/schedule';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone } from 'lucide-react';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { formatTime, getImageUrl } from '@/lib/utils';
import { useQuery as useTanstackQuery } from '@tanstack/react-query';



export default function ParkingLotPage() {
    const params = useParams();
    const lotSlug = params.lot as string;
    const supabase = createClient();


    const { data: lot, isLoading: lotLoading, error: lotError } = useQuery(getLotBySlug(supabase, lotSlug));

    const schedules = useTanstackQuery({
        queryKey: ['schedules', lot!.lot_id],
        queryFn: () => getSchedulesByDay(supabase, new Date(), lot!.lot_id),
        enabled: !!lot
    })



    if (lotLoading || schedules.isLoading || schedules.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading parking lot information...</p>
                </div>
            </div>
        );
    }

    if (lotError || !lot) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
                    <p className="text-muted-foreground">
                        {'Parking lot not found'}
                    </p>
                </div>
            </div>
        );
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
        <div className="min-h-screen">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{lot.name}</h1>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{lot.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{lot.phone}</span>
                        </div>
                        <Badge variant={lot.status === 'OPEN' ? 'default' : 'secondary'}>
                            {lot.status}
                        </Badge>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Operating Hours</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                            {lot.open ? `${lot.open} - ${lot.close || '24/7'}` : '24/7'}
                        </span>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className=" space-y-8 py-8">
                {/* Lot Information Card */}
                <div className="space-y-4">
                    <div className='pr-8'>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="">
                            {lot.description || 'No description available'}
                        </p>
                    </div>

                </div>

                {lot.amenities && lot.amenities.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold mb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {lot.amenities.map((amenity: string, index: number) => (
                                <Badge key={index} variant="outline">
                                    {amenity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="font-semibold mb-2">Facility Images</h3>
                    <div className="flex flex-wrap gap-2">
                        {lot.images.map((image: string, index: number) => (
                            <img key={image} src={getImageUrl(`lots/${image}`)} alt={`${lot.name} image ${index + 1}`} className="w-64 h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow" />
                        ))}
                    </div>
                </div>


                {/* Schedules Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Available Schedules</h2>
                    {schedules.data?.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No schedules available for this parking lot.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="md:grid md:grid-cols-2 md:gap-8 h-full">
                            <div className="space-y-4  px-4 py-2 overflow-y-auto">
                                {schedules.data?.map((schedule) => (
                                    <Card key={schedule.schedule_id}
                                        className={`shadow-none border-b border-gray-200 transition-all duration-200`}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className={`font-semibold text-lg`}>{schedule.name}</h4>
                                                    <p className={`flex items-center gap-1`}>{schedule.description}</p>
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
                                                        <p>{schedule.is_event ? formatTime(schedule.event_start) : formatTime(schedule.start_time)}</p>
                                                    </div>
                                                    <div>
                                                        <p>{schedule.is_event ? "Event End" : "Close Time"}</p>
                                                        <p>{schedule.is_event ? formatTime(schedule.event_end) : formatTime(schedule.end_time)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`${schedule.is_event ? "bg-blue-500 text-white" : "bg-gray-500 text-white"}`}>{schedule.is_event ? "Event" : "Regular"}</Badge>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <Button className="w-full" onClick={() => {
                                                    window.location.href = `/checkout/${lotSlug}?scheduleId=${schedule.schedule_id}`;
                                                }}>view details</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}