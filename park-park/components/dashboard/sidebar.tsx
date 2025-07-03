'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Car,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProfileSettingsCard from './ProfileSettingsCard';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';


interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Parking Lots',
    href: '/dashboard/lots',
    icon: Car,
  },
  // {
  //   title: 'Bookings',
  //   href: '/dashboard/bookings',
  //   icon: Calendar,
  //   badge: '12',
  //   children: [
  //     { title: 'All Bookings', href: '/dashboard/bookings', icon: Calendar },
  //     { title: 'Pending', href: '/dashboard/bookings/pending', icon: Clock },
  //     { title: 'Confirmed', href: '/dashboard/bookings/confirmed', icon: Shield },
  //   ],
  // },
  // {
  //   title: 'Customers',
  //   href: '/dashboard/customers',
  //   icon: Users,
  // },
  // {
  //   title: 'Payments',
  //   href: '/dashboard/payments',
  //   icon: CreditCard,
  //   children: [
  //     { title: 'All Payments', href: '/dashboard/payments', icon: CreditCard },
  //     { title: 'Pending', href: '/dashboard/payments/pending', icon: Clock },
  //     { title: 'Refunds', href: '/dashboard/payments/refunds', icon: DollarSign },
  //   ],
  // },
  // {
  //   title: 'Analytics',
  //   href: '/dashboard/analytics',
  //   icon: BarChart3,
  // },
  // {
  //   title: 'Reports',
  //   href: '/dashboard/reports',
  //   icon: FileText,
  // },
];

const bottomSidebarItems: SidebarItem[] = [
  // {
  //   title: 'Settings',
  //   href: '/dashboard',
  //   icon: Settings,
  // },
  // {
  //   title: 'Help & Support',
  //   href: '/dashboard',
  //   icon: HelpCircle,
  // },
];

export default function SidebarContent() {
  const [, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };


  return (
    <div className="flex flex-col h-full w-72">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ParkEase</h1>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.title}>
            <div className="relative">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.title);
                  }
                  setSidebarOpen(false);
                }}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive(item.href) ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                )} />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                    {item.badge}
                  </Badge>
                )}
                {item.children && (
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    expandedItems.includes(item.title) ? "rotate-180" : ""
                  )} />
                )}
              </Link>
            </div>

            {/* Submenu */}
            {item.children && expandedItems.includes(item.title) && (
              <div className="ml-6 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.title}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                      isActive(child.href)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <child.icon className="w-4 h-4" />
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>



      {/* Bottom Navigation */}
      <div className="px-4 py-4 space-y-2">
        {bottomSidebarItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-200">
        <ProfileSettingsCard user={user} signOut={signOut}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Avatar className="w-8 h-8 rounded-full bg-gray-200" >
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="flex items-center justify-center w-full h-full text-lg font-semibold">
                {user?.user_metadata?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.user_metadata.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </ProfileSettingsCard>
      </div>
    </div>
  );
}