type TicketmasterEvent = {
  id: string;
  name: string;
  dates?: {
    start?: {
      dateTime?: string;
    };
  };
  _embedded?: {
    venues?: {
      name?: string;
    }[];
  };
};

export async function fetchEventsByVenues(venueIds: string[]) {
    if (!venueIds.length) return [];
  
    const apiKey = process.env.TICKET_MASTER_API_KEY;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&venueId=${venueIds.join(",")}`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch events");
  
    const data = await res.json();
    
  
    return (
      (data._embedded?.events as TicketmasterEvent[] | undefined)?.map((ev) => ({
        id: ev.id,
        name: ev.name,
        start_time: ev.dates?.start?.dateTime,
        venue: ev._embedded?.venues?.[0]?.name,
      })) || []
    );
  }
  