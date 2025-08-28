"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormLabel,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useUpsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type FormValues = {
  venues: string[];
};

export type LotVenue = {
  id?: string | null;
  lot_id: string;
  venue_id: string;
  name?: string | null;
  created_at?: string | null
};

export function VenueForm({ lotId }: { lotId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedVenues, setSelectedVenues] = useState<LotVenue[]>([]);

  const supabase = createClient()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    defaultValues: { venues: [] },
  });

  // query Ticketmaster venues
  const { data, isFetching } = useQuery({
    queryKey: ["ticketMasterVenue", search],
    queryFn: async () => {
      if (!search) return [];

      const res = await fetch(`/api/events?keyword=${search}`);
      if (!res.ok) throw new Error("Error fetching venue");

      const json = await res.json();

      return json ?? [];
    },
    enabled: search.length > 2, // only fire when >2 chars
  });

  const { mutateAsync: insertVenue } = useUpsertMutation(
    supabase.from('lot_venues'),
    ["lot_id", "venue_id"],
    'lot_id,venue_id',
    {
      onSuccess: () => {
        toast.success('Venue created successfully')
        queryClient.invalidateQueries({ queryKey: ["lotVenues"]})
        queryClient.invalidateQueries({ queryKey: ["upcomingEvents"]})
        setIsDialogOpen(false);
      },
      onError: () => {
        toast.error("Error creating venue")

        setIsDialogOpen(false);
      }
    }
  )

  const handleClose = () => {
    // reset form + state
    form.reset();
    setSelectedVenues([]);
    setSearch("");
    setIsDialogOpen(false);
  };

  const onSubmit = () => {
    const venues = selectedVenues.map((venue) => {
      return { venue_id: venue.id, lot_id: lotId, name: venue.name }
    })

    insertVenue(venues)
    handleClose()
  };

  const toggleVenue = (venue: LotVenue) => {
    if (selectedVenues.some((v) => v.id === venue.id)) {
      setSelectedVenues((prev) => prev.filter((v) => v.id !== venue.id));
    } else {
      setSelectedVenues((prev) => [...prev, venue]);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) {
        form.reset();
        setSelectedVenues([]);
        setSearch("");
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          <Plus className="w-4 h-4" />
          Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Create Venue</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-h-96 ">

            <div className="space-y-4 min-h-72">
              <FormLabel>Search Venue</FormLabel>
              <Command className="h-64 border rounded-md p-2">
                <CommandInput
                  placeholder="Search venues..."
                  value={search}
                  onValueChange={setSearch}
                  className=" "
                />
                <CommandEmpty>
                  {isFetching ? "Searching..." : "No venues found"}
                </CommandEmpty>
                <CommandGroup className="overflow-y-auto">
                  {data?.map((venue: LotVenue) => (
                    <CommandItem
                      key={venue.id}
                      onSelect={() => toggleVenue(venue)}
                      className="cursor-pointer"
                    >
                      {venue.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>


              <div className="flex flex-wrap gap-2 mt-2">
                {selectedVenues.map((venue) => (
                  <Badge
                    key={venue.id}
                    variant="secondary"
                    onClick={() => toggleVenue(venue)}
                    className="cursor-pointer"
                  >
                    {venue.name} ✕
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="hover:bg-primary">Save Venue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
