'use client'

import { useState } from "react";

import { Button } from "../ui/button";
import { Search, Bell, Zap, Menu } from "lucide-react";
import SidebarContent from "./sidebar";


export default function Header() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <>
            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
                        <div className="flex flex-col flex-grow bg-white shadow-xl">
                            <SidebarContent />
                        </div>
                    </div>
                </div>
            )}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5 text-red-500" />
                        </Button>

                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-48"
                            />
                        </div>

                        {/* Notifications */}
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">3</span>
                            </span>
                        </Button>

                        {/* Quick Actions */}
                        <Button variant="ghost" size="sm">
                            <Zap className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>
        </>

    )
}