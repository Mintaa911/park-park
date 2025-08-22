import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get params from client
  const lat = searchParams.get("lat");       // e.g. 40.7128
  const lng = searchParams.get("lng");       // e.g. -74.0060
  const radius = "1"; // default 25 miles
  const startDate = '2025-08-20T00:00:00Z';
  const endDate = '2025-08-30T23:59:59Z';

  if (!lat || !lng) {

    return NextResponse.json([])
  }
  if (!process.env.TICKET_MASTER_BASE_URL || !process.env.TICKET_MASTER_API_KEY) {
    return NextResponse.json({ error: "Ticketmaster API key or base url not set" }, { status: 5000 })
  }

  const ticketMasterUrl = `${process.env.TICKET_MASTER_BASE_URL}/events.json?size=10&apikey=${process.env.TICKET_MASTER_API_KEY}&geoPoint=${lat},${lng}&radius=${radius}&unit=miles&startDateTime=${startDate}&endDateTime=${endDate}&sort=date,asc`

  try {
    const res = await fetch(ticketMasterUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Ticketmaster API error" }, { status: res.status })
    }
    const data = await res.json();
    return NextResponse.json(data._embedded.events)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

}