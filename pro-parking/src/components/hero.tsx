"use client";

import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchResults } from "@/components/search-results";
import { useQuery } from "@tanstack/react-query";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["lots", debouncedSearchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/lots?search_query=${debouncedSearchQuery}`)
      if (!res.ok) throw new Error("Failed to fetch lots");
      return res.json();
    }
  })


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
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-2 mt-4">
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
                  {searchResults && searchResults.length > 0 ? (
                    <SearchResults
                      results={searchResults}
                      isLoading={isSearchLoading}
                      searchQuery={debouncedSearchQuery}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
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
