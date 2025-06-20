'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Phone,
  Clock,
  Car,
  Plus,
  Filter,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Image as ImageIcon,
  Star,
  TrendingUp,
  TrendingDown,
  CreditCard,
  UserCheck,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Mail,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LotStatus, ParkingLot, UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getLotsBySupervisor } from '@/lib/supabase/queries/lot';
import { createClient } from '@/lib/supabase/client';
import CreateLotForm from '@/components/dashboard/lots/create-lot-form';
import Overview from '@/components/dashboard/lots/overview';
import Schedule from '@/components/dashboard/lots/schedule';
import Booking from '@/components/dashboard/lots/booking';
import Accounting from '@/components/dashboard/lots/accounting';
import Employee from '@/components/dashboard/lots/employee';


export default function ParkingLotsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isCreateLotOpen, setIsCreateLotOpen] = useState(false);
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');


  const { user, userLoading } = useAuth();

  const supabase = createClient();

  const query = useQuery({
    queryKey: ['lots', user?.id],
    queryFn: () => getLotsBySupervisor(supabase, user?.id ?? ''),
    enabled: !!user?.id
  })

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setSelectedLot(query.data[0]);
      setLots(query.data || []);
    }
  }, [query.data]);

  const getStatusColor = (status: LotStatus) => {
    switch (status) {
      case LotStatus.OPEN:
        return 'bg-green-100 text-green-800 border-green-200';
      case LotStatus.CLOSED:
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: LotStatus) => {
    switch (status) {
      case LotStatus.OPEN:
        return <CheckCircle className="w-4 h-4" />;
      case LotStatus.CLOSED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Parking Lots Management</h1>
          <p className="text-gray-600">Comprehensive management of your parking facilities</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="px-6 py-4">
            <div className="flex justify-between sm:flex-row items-center">
              <div className="flex-1">
                <Label htmlFor="lot-select">Choose Parking Lot</Label>
                <Select value={selectedLot?.lot_id} onValueChange={(value) => setSelectedLot(lots.find(lot => lot.lot_id === value) ?? null)}>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Choose a parking lot to view details" />
                  </SelectTrigger>
                  <SelectContent>
                    {lots.map((lot) => (
                      <SelectItem key={lot.lot_id} value={lot.lot_id}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(lot.status as LotStatus)}
                          <span>{lot.name}</span>
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(lot.status as LotStatus)}`}>
                            {lot.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!userLoading && user?.role === UserRole.ADMIN && (
                <CreateLotForm userId={user.id} isCreateLotOpen={isCreateLotOpen} setIsCreateLotOpen={setIsCreateLotOpen} />
              )}
            </div>
          </CardContent>
        </Card>

        {selectedLot && (
          <Card className="shadow-lg border-0">
            <CardHeader className="rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{selectedLot.name}</CardTitle>
                  <p className=" flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedLot.location}
                  </p>
                </div>
                <Badge className={`${getStatusColor(selectedLot.status as LotStatus)} border`}>
                  {getStatusIcon(selectedLot.status as LotStatus)}
                  <span className="ml-1 capitalize">{selectedLot.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-50 rounded-none">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="schedules" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedules
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger value="accounting" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Accounting
                  </TabsTrigger>
                  <TabsTrigger value="managers" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Managers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6 space-y-6">
                  <Overview selectedLot={selectedLot} />
                </TabsContent>

                <TabsContent value="schedules" className="p-6">
                  <Schedule selectedLot={selectedLot} isCreateScheduleOpen={isCreateScheduleOpen} setIsCreateScheduleOpen={setIsCreateScheduleOpen} />
                </TabsContent>

                <TabsContent value="bookings" className="p-6">
                  <Booking selectedLot={selectedLot} />
                </TabsContent>

                <TabsContent value="accounting" className="p-6">
                  <Accounting />
                </TabsContent>

                <TabsContent value="managers" className="p-6">
                  <Employee />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}