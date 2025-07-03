import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog';
import { LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

interface ProfileSettingsCardProps {
    user: User | null;
    signOut: () => void;
    children: React.ReactNode;
}

export default function ProfileSettingsCard({ user, signOut, children }: ProfileSettingsCardProps) {
    const [selectedMenu, setSelectedMenu] = useState<'Profile' | 'Notifications' | 'Personalization' | 'Help'>('Profile');
    const menuItems = [
        'Profile',
        'Notifications',
        'Personalization',
        'Help',
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="p-0 w-[480px] h-[420px] mb-2 ml-2 rounded-sm shadow-2xl border-none left-4 bottom-4 fixed translate-x-0 translate-y-0 flex"
                style={{ left: 0, bottom: 0, top: 'auto', right: 'auto', borderRadius: 16 }}
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Profile settings</DialogTitle>
                <div className="flex h-full w-full">
                    {/* Left menu */}
                    <nav className="w-40 flex flex-col py-4 px-2 rounded-l-xl border-r">
                        {menuItems.map((item) => (
                            <button
                                key={item}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-colors ${selectedMenu === item ? '  font-semibold' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                                onClick={() => setSelectedMenu(item as typeof selectedMenu)}
                                type="button"
                            >
                                {/* Optionally add icons here */}
                                {item}
                            </button>
                        ))}
                        <div className="flex-1" />
                        <button
                            onClick={signOut}
                            className="flex  items-center gap-6 px-6 py-2 rounded-md text-sm bg-gradient-to-br from-blue-600 to-blue-700 mt-2 font-medium text-white"
                            type="button"
                        >
                            <span className="text-white">Log out</span>
                            <LogOut className="w-4 h-4 text-white" />
                        </button>
                    </nav>
                    {/* Right content */}
                    <div className="flex-1 bg-white rounded-r-xl p-6 flex flex-col">
                        {selectedMenu === 'Profile' && (
                            <>
                                <div className="flex flex-col items-center mb-4">
                                    <Avatar className="w-16 h-16 rounded-full bg-gray-200" >
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="flex items-center justify-center w-full h-full text-xl font-semibold">
                                            {user?.user_metadata?.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate w-full text-center">
                                        {user?.user_metadata?.full_name || 'User'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mb-2 text-center w-full truncate">
                                        {user?.role || 'Role'}
                                    </p>
                                </div>
                                <div className="mb-2">
                                    <div className="text-xs text-gray-400">Phone number</div>
                                    <div className="text-sm text-gray-700">{user?.user_metadata?.phone || '-'}</div>
                                </div>
                            </>
                        )}
                        {/* Add more sections for other menu items if needed */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 