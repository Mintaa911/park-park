"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useState, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { searchParkingLots } from "@/lib/supabase/queries/lot";
import { SearchResults } from "@/components/search-results";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const { data: searchResults, isLoading: isSearchLoading } = useQuery(
    searchParkingLots(supabase, debouncedSearchQuery),
    {
      enabled: debouncedSearchQuery.length > 0 || isSearchFocused,
    }
  );

  const handleSearch = () => {
    // Handle search button click if needed
    console.log("Searching for:", searchQuery);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Check if the related target is within the search results
    if (searchResultsRef.current?.contains(e.relatedTarget as Node)) {
      return; // Don't hide results if clicking within them
    }
    
    // Delay hiding results to allow clicking on them
    setTimeout(() => setIsSearchFocused(false), 300);
  };

  return (
    <div className="w-full">
      <div className="container mx-auto max-w-5xl text-center py-24 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Parking Just Got a Lot Simpler
        </h1>
        <p className="text-xl mt-4 ">
          Book the best spaces & save up to 50%
        </p>
        <Tabs defaultValue="hourly" className="w-full max-w-2xl mx-auto mt-10">
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="hourly" className="">
              Hourly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="">
              Monthly
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hourly">
            <div className="relative">
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search parking lots"
                    className="flex-1 placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={handleInputBlur}
                  />
                  {isSearchFocused && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg mt-1" ref={searchResultsRef}>
                      <SearchResults
                        results={searchResults || []}
                        isLoading={isSearchLoading}
                        searchQuery={debouncedSearchQuery}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" /> Find Parking
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="relative">
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search Address, Place or Event"
                    className="flex-1 placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={handleInputBlur}
                  />
                  {isSearchFocused && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1" ref={searchResultsRef}>
                      <SearchResults
                        results={searchResults || []}
                        isLoading={isSearchLoading}
                        searchQuery={debouncedSearchQuery}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" /> Find Parking
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-center gap-4 mt-8">
          <a
            href="#"
            className="inline-block  rounded-lg px-6 py-3 bg-gray-800 text-white"
          >
            App Store
          </a>
          <a
            href="#"
            className="inline-block  rounded-lg px-6 py-3 bg-gray-800 text-white"
          >
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
}
