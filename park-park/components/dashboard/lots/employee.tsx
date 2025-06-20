import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Settings, Shield, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getRoleColor } from "@/lib/utils";


interface LotManager {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'manager' | 'supervisor' | 'attendant';
    avatar: string | null;
    assigned_date: string;
    permissions: string[];
    status: 'active' | 'inactive';
  }


export default function Employee() {
      // Sample managers data
  const [lotManagers] = useState<LotManager[]>([
    {
      id: 'mgr_001',
      name: 'Alice Cooper',
      email: 'alice.cooper@company.com',
      phone: '+1 (555) 777-8888',
      role: 'manager',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
      assigned_date: '2024-01-01T00:00:00Z',
      permissions: ['manage_schedules', 'view_reports', 'manage_bookings', 'manage_staff'],
      status: 'active'
    },
    {
      id: 'mgr_002',
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      phone: '+1 (555) 999-0000',
      role: 'supervisor',
      avatar: null,
      assigned_date: '2024-01-05T00:00:00Z',
      permissions: ['manage_schedules', 'view_reports', 'manage_bookings'],
      status: 'active'
    },
    {
      id: 'mgr_003',
      name: 'Carol Martinez',
      email: 'carol.martinez@company.com',
      phone: '+1 (555) 111-3333',
      role: 'attendant',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100',
      assigned_date: '2024-01-10T00:00:00Z',
      permissions: ['view_reports', 'manage_bookings'],
      status: 'active'
    }
  ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Lot Managers</h3>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manager
                </Button>
            </div>

            <div className="grid gap-4">
                {lotManagers.map((manager) => (
                    <Card key={manager.id} className="border-l-4 border-l-indigo-500">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={manager.avatar || undefined} />
                                    <AvatarFallback>
                                        {manager.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-900">{manager.name}</h4>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {manager.email}
                                            </p>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                {manager.phone}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={getRoleColor(manager.role)}>
                                                {manager.role}
                                            </Badge>
                                            <Badge variant={manager.status === 'active' ? 'default' : 'secondary'}>
                                                {manager.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned Since</p>
                                            <p className="font-medium">
                                                {new Date(manager.assigned_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Permissions</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {manager.permissions.slice(0, 2).map((permission, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {permission.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                                {manager.permissions.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{manager.permissions.length - 2} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Settings className="w-4 h-4 mr-1" />
                                            Permissions
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Shield className="w-4 h-4 mr-1" />
                                            Access
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}