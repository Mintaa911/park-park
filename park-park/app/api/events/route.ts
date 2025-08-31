import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get params from client
  const keyword = searchParams.get("keyword");


  if (!process.env.TICKET_MASTER_BASE_URL || !process.env.TICKET_MASTER_API_KEY) {
    return NextResponse.json({ error: "Ticketmaster API key or base url not set" }, { status: 5000 })
  }


  const ticketMasterUrl = `${process.env.TICKET_MASTER_BASE_URL}/venues.json?size=10&apikey=${process.env.TICKET_MASTER_API_KEY}&keyword=${encodeURIComponent(keyword || '')}`

  try {
    const res = await fetch(ticketMasterUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Ticketmaster API error" }, { status: res.status })
    }
    const data = await res.json();

    if(data.page.totalElements > 0) return NextResponse.json(data._embedded.venues)

    return NextResponse.json([])
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

}