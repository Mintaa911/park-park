import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchEventsByVenues } from "@/lib/ticketmaster";

export async function GET(req: Request) {
const { searchParams } = new URL(req.url);
const lotId = searchParams.get("lotId");
  if (!lotId) {
    return NextResponse.json({ error: "lotId is required" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: lotVenues, error: lvError } = await supabase
    .from("lot_venues")
    .select("venue_id")
    .eq("lot_id", lotId);
  if (lvError) return NextResponse.json({ error: lvError.message }, { status: 500 });
  if (!lotVenues?.length) return NextResponse.json([]);
  const venueIds = lotVenues.map((lv) => lv.venue_id);

  //  Get events from Ticketmaster
  const events: { id: string }[] = await fetchEventsByVenues(venueIds);


  //  Get priced events for the lot
  const { data: priced, error: epError } = await supabase
    .from("schedules")
    .select("tm_event_id")
    .eq("lot_id", lotId);

  if (epError) return NextResponse.json({ error: epError.message }, { status: 500 });

  const pricedIds = priced?.map((p) => p.tm_event_id) || [];

  // 4. Filter out priced events
  const available = events.filter((ev) => !pricedIds.includes(ev.id));

  

  return NextResponse.json(available);
}
