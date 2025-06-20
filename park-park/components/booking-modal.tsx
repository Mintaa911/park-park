'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/lib/supabase/database.types';
import { Calendar, Clock, DollarSign, Car } from 'lucide-react';

type Schedule = Tables<'schedules'>;
type Lot = Tables<'lots'>;

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: Schedule | null;
    lot: Lot | null;
    onBookingSubmit: (bookingData: BookingFormData) => void;
}

interface BookingFormData {
    email: string;
    phone: string;
    licensePlate: string;
    licenseState: string;
    vehicleType: 'STANDARD' | 'OVERSIZE';
    startTime: string;
}

export function BookingModal({ isOpen, onClose, schedule, lot, onBookingSubmit }: BookingModalProps) {
    const [formData, setFormData] = useState<BookingFormData>({
        email: '',
        phone: '',
        licensePlate: '',
        licenseState: '',
        vehicleType: 'STANDARD',
        startTime: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await onBookingSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Booking failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
            return `${remainingMinutes} min`;
        } else if (remainingMinutes === 0) {
            return `${hours} hr`;
        } else {
            return `${hours} hr ${remainingMinutes} min`;
        }
    };

    if (!schedule || !lot) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Book Parking Spot
                    </DialogTitle>
                    <DialogDescription>
                        Complete your booking for {schedule.name} at {lot.name}
                    </DialogDescription>
                </DialogHeader>

                {/* Schedule Summary */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{schedule.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(schedule.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold text-primary">
                                {formatPrice(schedule.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Location:</span>
                            <span>{lot.location}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="licensePlate">License Plate</Label>
                            <Input
                                id="licensePlate"
                                required
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                placeholder="ABC123"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licenseState">State</Label>
                            <Input
                                id="licenseState"
                                required
                                value={formData.licenseState}
                                onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                                placeholder="CA"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Select
                            value={formData.vehicleType}
                            onValueChange={(value: 'STANDARD' | 'OVERSIZE') => 
                                setFormData({ ...formData, vehicleType: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STANDARD">Standard Vehicle</SelectItem>
                                <SelectItem value="OVERSIZE">Oversize Vehicle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="datetime-local"
                            required
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Booking...' : `Book for ${formatPrice(schedule.price)}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 