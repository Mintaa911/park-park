"use client";

import { ParkingLot } from "@/types";
import { MapPin, Car } from "lucide-react";
import Link from "next/link";

interface SearchResultsProps {
    results: ParkingLot[];
    isLoading: boolean;
    searchQuery: string;
}

export function SearchResults({ results, isLoading, searchQuery }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="mt-4 space-y-4">
                loading...
            </div>
        );
    }

    if (!searchQuery.trim()) {
        return (
            <div className="mt-4 text-center text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Start typing to search for parking lots</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="mt-4 text-center text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No parking lots found for &quot;{searchQuery}&quot;</p>
            </div>
        );
    }

    return (
        <div className="mt-4 max-h-96 overflow-y-auto">
            {results.map((lot) => (
                <Link key={lot.lot_id} href={`/${lot.slug}`} className="flex items-center gap-2 px-4 py-2">
                    <MapPin className="w-4 h-4" />
                    <p className="">{lot.name}</p>
                    <span className="text-xs text-gray-600 truncate">{lot.location}</span>
                </Link>
            ))}
        </div>
    );
} 