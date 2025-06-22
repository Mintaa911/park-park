'use client';

import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLotBySlug } from '@/lib/supabase/queries/lot';
import { getLotSchedules } from '@/lib/supabase/queries/schedule';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Car, Calendar } from 'lucide-react';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';



export default function ParkingLotPage() {
    const params = useParams();
    const lotSlug = params.lot as string;

    const supabase = createClient();


    const { data: lot, isLoading: lotLoading, error: lotError } = useQuery(getLotBySlug(supabase, lotSlug));
    const { data: schedules, isLoading: schedulesLoading } = useQuery(getLotSchedules(supabase, lot!.lot_id));


    if (lotLoading || schedulesLoading) {
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

    return (
        <div className="min-h-screen bg-background">
            <div className="">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
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
                            <div className="text-right">
                                <div className="text-2xl font-bold">{lot.space_count}</div>
                                <div className="text-sm opacity-90">Available Spaces</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Lot Information Card */}
                    <Card className="mb-8">

                        <CardContent className='p-4'>
                            <div className="space-y-4">
                                <div className='pr-8'>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="">
                                        {lot.description || 'No description available'}
                                    </p>
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
                                {lot.amenities && lot.amenities.length > 0 && (
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold mb-2">Amenities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {lot.amenities.map((amenity, index) => (
                                                <Badge key={index} variant="outline">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedules Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">Available Schedules</h2>
                        {schedules?.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground">No schedules available for this parking lot.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className=" gap-6">
                                {schedules?.map((schedule) => (
                                    <Card
                                        key={schedule.schedule_id}
                                        className={`transition-all hover:shadow-lg`}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between gap-2">
                                                <div className='flex items-center gap-2'>
                                                    <Calendar className="h-5 w-5" />
                                                    {schedule.name}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-lg text-primary">
                                                        ${schedule.price}
                                                    </span>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    {schedule.arrive_after && schedule.exit_before && (
                                                        <div className='flex items-center gap-2'>
                                                            <span className="text-sm text-muted-foreground">Start Time:</span>
                                                            <span className="font-medium">
                                                                {schedule.arrive_after}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">Exit Time:</span>
                                                            <span className="font-medium">
                                                                {schedule.exit_before}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {schedule.duration && (
                                                        <div className='flex items-center gap-2'>
                                                            <span className="text-sm text-muted-foreground">Duration:</span>
                                                            <span className="font-medium">
                                                                {schedule.duration} hours
                                                            </span>
                                                        </div>
                                                    )}



                                                </div>

                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className=""
                                                onClick={() => {
                                                    window.location.href = `/${lotSlug}/checkout?scheduleId=${schedule.schedule_id}`;
                                                }}
                                                disabled={lot.status !== 'OPEN'}
                                            >
                                                <Car className="h-4 w-4 mr-1" />
                                                Book Now
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}