'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { cn, formatCurrency, formatTime, getImageUrl } from '@/lib/utils';
import { ParkingLot, ParkingScheduleFull } from '@/types';
import { useEffect, useState } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';



export default function ParkingLotPage() {
  const params = useParams();
  const lotSlug = params.slug as string;
  const [priceId, setPriceId] = useState('')
  const [scheduleId, setScheduleId] = useState('')


  const { data: lot, isLoading: lotLoading, error: lotError } = useQuery({
    queryKey: ['lot', lotSlug],
    queryFn: async (): Promise<ParkingLot> => {
      const res = await fetch(`/api/lots?slug=${lotSlug}`)
      if (!res.ok) throw new Error('Error fetching lot by slug')
      return res.json()
    }
  });

  const { data: timeData } = useQuery({
    queryKey: ['time'],
    queryFn: async (): Promise<string> => {
      const res = await fetch(`/api/time`)
      if (!res.ok) throw new Error('Error fetching time')
      return res.json()
    }
  });

  const schedules = useQuery({
    queryKey: ['schedules', lotSlug],
    queryFn: async (): Promise<ParkingScheduleFull[]> => {
      const res = await fetch(`/api/schedules?data=${lotSlug}&lot_id=${lot!.lot_id}`)
      if (!res.ok) throw new Error('Error fetching schedules')
      return res.json()
    },
    enabled: !!lot?.lot_id
  })

  useEffect(() => {
    let first
    if (schedules.data && schedules.data.length > 0) {
      first = schedules.data[0].price_tiers?.[0]?.price_id
      setScheduleId(schedules.data[0].schedule_id)
    }

    if (first && !priceId) {
      setPriceId(first);
    }
  }, [schedules]);



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
          <div className="flex items-center gap-4 text-sm">
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
          {schedules.data?.length === 0 || (schedules.data && (!schedules.data[0].price_tiers.length)) ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No schedules available for this parking lot.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="md:w-[40%]  h-full">
              <div className=" space-y-4 ">
                <ToggleGroup.Root
                  type="single"
                  value={priceId}
                  onValueChange={(val) => {
                    if (val) {
                      setPriceId(val)
                    }
                  }}
                  aria-label="Text alignment"
                  className=" w-full h-full"
                >
                  {schedules.data && schedules.data[0].price_tiers.map((price_tier) => (
                    <ToggleGroup.Item
                      key={price_tier.price_id}
                      value={price_tier.price_id}
                      className={cn(
                        "w-full my-2  shadow-md flex-1 p-3 text-base rounded-lg transition-colors border border-transparent data-[state=on]:border-primary",
                        priceId === price_tier.price_id && "border-muted"
                      )}
                    >
                      <div className={`space-y-2`} onClick={() => { }}>
                        <div className="flex justify-between w-full">
                          <p className="font-semibold flex items-center gap-1">
                            {price_tier.maxHour} hours
                          </p>
                          <h4 className="font-semibold text-lg">
                            {formatCurrency(price_tier.price)}
                          </h4>
                        </div>
                        <div className="flex gap-2 items-center justify-between text-sm md:text-base">
                          <p>{timeData ? formatTime(new Date(timeData).toISOString()) : ''}</p>
                          <ArrowRight className="w-4 h-4" />
                          <p>
                            {timeData ?
                              formatTime(
                                new Date(
                                  Date.now() +
                                  1000 * 60 * 60 * price_tier.maxHour
                                ).toISOString()
                              ) : ''}
                          </p>
                        </div>
                      </div>
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>

                <Button
                  className="mt-2  float-right "
                  onClick={() => {
                    window.location.href = `/checkout/${lot.lot_id}?scheduleId=${scheduleId}&priceTierId=${priceId}`;
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}