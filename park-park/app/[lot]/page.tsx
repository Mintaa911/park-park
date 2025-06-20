'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLotBySlug } from '@/lib/supabase/queries/lot';
import { getLotSchedules } from '@/lib/supabase/queries/schedule';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Car, Calendar, Info } from 'lucide-react';
import { BookingModal } from '@/components/booking-modal';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { ParkingSchedule } from '@/types';

interface BookingFormData {
    email: string;
    phone: string;
    licensePlate: string;
    licenseState: string;
    vehicleType: 'STANDARD' | 'OVERSIZE';
    startTime: string;
}

export default function ParkingLotPage() {
    const params = useParams();
    const lotSlug = params.lot as string;

    const supabase = createClient();
    
    // Modal states
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<ParkingSchedule | null>(null);


    const { data: lot, isLoading: lotLoading, error: lotError } = useQuery(getLotBySlug(supabase, lotSlug));
    const { data: schedules, isLoading: schedulesLoading } = useQuery(getLotSchedules(supabase, lot!.lot_id));


    const handleBookSchedule = (schedule: ParkingSchedule) => {
        setCurrentSchedule(schedule);
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = async (bookingData: BookingFormData) => {
        try {
            const client = createClient();
            
            // Create the order in the database
            const { data, error } = await client.from('orders').insert({
                lot_id: lot!.lot_id,
                schedule_id: currentSchedule!.schedule_id,
                email: bookingData.email,
                phone: bookingData.phone,
                license_plate: bookingData.licensePlate,
                license_state: bookingData.licenseState,
                vehicle_type: bookingData.vehicleType,
                start_time: bookingData.startTime,
                total_amount: currentSchedule!.price,
                payment_status: 'PENDING'
            }).select().single();

            if (error) {
                throw error;
            }

            // Show success message or redirect to payment
            alert(`Booking successful! Order ID: ${data.order_id}`);
            
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Booking failed. Please try again.');
            throw err;
        }
    };


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
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Lot Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {schedules?.map((schedule) => (
                                    <Card 
                                        key={schedule.schedule_id} 
                                        className={`transition-all hover:shadow-lg`}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                {schedule.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {schedule.description || 'No description available'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Duration:</span>
                                                    <span className="font-medium">
                                                        {schedule.duration}hrs
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Price:</span>
                                                    <span className="font-bold text-lg text-primary">
                                                        ${schedule.price}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => handleBookSchedule(schedule)}
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

            {/* Modals */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                schedule={currentSchedule}
                lot={lot}
                onBookingSubmit={handleBookingSubmit}
            />
        </div>
    );
}