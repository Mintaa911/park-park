'use client';

import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLotBySlug } from '@/lib/supabase/queries/lot';
import { getSchedulesByDay } from '@/lib/supabase/queries/schedule';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { formatCurrency, formatTime, getImageUrl } from '@/lib/utils';
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


    return (
        <div className="min-h-screen">
            <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                <div className="flex-1">
                    <h1 className="md:text-3xl font-bold mb-2">{lot.name}</h1>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{lot.location}</span>
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
                        {lot.is_24_hours ? "24 Hours" : `${lot.open} - ${lot.close || '24/7'}`}
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className=" space-y-8 py-8">
                {/* Lot Information Card */}
                <div className="space-y-4">
                    <div className='md:pr-8'>
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
                            <img key={image} src={getImageUrl(`lots/${image}`)} alt={`${lot.name} image ${index + 1}`} className="w-24 h-16 md:w-64 md:h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow" />
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
                        <div className="md:w-[40%]  h-full">
                            {schedules.data?.map((schedule) => (
                                <div key={schedule.schedule_id} className=" space-y-4">
                                    {schedule.price_tiers.map((price_tier) => (
                                        <Card key={price_tier.price_id}
                                            className={`shadow-none border-b border-gray-200 transition-all duration-200`}>
                                            <CardContent className="p-4">
                                                <div
                                                    key={price_tier.price_id}
                                                    className={`space-y-2 text-sm md:text-base`}
                                                    onClick={() => { }}
                                                >
                                                    <div className="flex justify-between w-full">
                                                        <p className="font-semibold flex items-center gap-1">{price_tier.maxHour} hours</p>
                                                        <h4 className="font-semibold text-lg">{formatCurrency(price_tier.price)}</h4>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <p>
                                                            {formatTime(new Date().toISOString())}
                                                        </p>
                                                        <ArrowRight className="w-4 h-4" />
                                                        <p>
                                                            {formatTime(new Date(Date.now() + 1000 * 60 * 60 * price_tier.maxHour).toISOString())}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button className="" onClick={() => {
                                                        window.location.href = `/checkout/${lot.lot_id}?scheduleId=${schedule.schedule_id}&priceTierId=${price_tier.price_id}`;
                                                    }}>Book Now</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                            ))}


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}