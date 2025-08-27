import { DailyBookingDataItem, DashboardDataType, RevenueByLotDataItem, TypedSupabaseClient } from "@/types";
// import { startOfMonth, endOfMonth } from "date-fns";
import { startOfMonth, endOfMonth, formatISO, eachDayOfInterval, endOfToday, subDays } from "date-fns";


export function getOrdersCount(client: TypedSupabaseClient, lot_id?: string) {
  let query = client.from('orders').select('*', { count: 'exact', head: true })
  if (lot_id) {
    query = query.eq('lot_id', lot_id)
  }
  return query
}

export function getLotOrders(client: TypedSupabaseClient, lot_id: string, plate_number?: string, limit = 20, page = 1) {
  let query = client.from('orders').select('*').eq('lot_id', lot_id)
  if (plate_number && plate_number !== "") {
    query = query.ilike('license_plate', `%${plate_number}%`)
  }
  return query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit)
}

export function getOrderByPaymentIntentId(client: TypedSupabaseClient, payment_intent_id: string) {
  return client
    .from('orders')
    .select(`*,
        price_tiers(price_id, price, maxHour),
        schedules(schedule_id, event_start, event_end, start_time, end_time, is_event),
        lots(lot_id, name, location, description)
        `)
    .eq('stripe_payment_intent_id', payment_intent_id)
    .maybeSingle()
}


export async function getDailyBookingsByMonth(
  client: TypedSupabaseClient,
  month: string
): Promise<DailyBookingDataItem[]> {
  const from = startOfMonth(new Date(month)).toISOString();
  const to = endOfToday().toISOString()

  const { data, error } = await client
    .from("orders")
    .select("created_at")
    .gte("created_at", from)
    .lte("created_at", to)

  if (error) throw new Error(error.message);

  // Initialize all days in the month with count 0
  const dayMap: Record<string, number> = {};
  eachDayOfInterval({ start: from, end: to }).forEach((day) => {
    const key = formatISO(day, { representation: "date" });
    dayMap[key] = 0;
  });

  for (const row of data) {
    const key = formatISO(new Date(row.created_at), { representation: "date" });
    if (dayMap[key] !== undefined) {
      dayMap[key]++;
    }
  }

  return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
}

export async function getDashBoardChartData(
  client: TypedSupabaseClient,
  month: string // e.g. "2025-07"
): Promise<DashboardDataType> {

  //   const [year, monthStr] = month.split("-");
  // const selected = new Date(Date.UTC(Number(year), Number(monthStr) - 1, 1));

  const selected = new Date(`${month}-01T00:00:00`); // "2025-07" → 2025-07-01
  const now = new Date();
  const from = startOfMonth(selected).toISOString();

  // if selected month === current month → end = today

  const isCurrentMonth =
    selected.getUTCFullYear() === now.getFullYear() &&
    selected.getUTCMonth() === now.getUTCMonth();


  const to = isCurrentMonth ? endOfToday().toISOString() : endOfMonth(selected).toISOString();
  const query = client
    .from("orders")
    .select(`
        lot_id,total_amount, lots(name),
        schedules(schedule_id,is_event)
        `)
    .gte("created_at", from)
    .lte("created_at", to);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  let eventCount = 0;
  let regularCount = 0;

  let totalBooking = 0;
  let totalRevenue = 0


  for (const row of data) {
    if (row.schedules?.is_event) {
      eventCount += 1;
    } else {
      regularCount += 1;
    }
  }

  const counts: Record<string, { name: string; income: number, booking_count: number }> = {};


  for (const row of data) {
    totalBooking += 1;
    totalRevenue += row.total_amount;
    const lotName = row.lots?.name ?? row.lot_id; // fallback to lot_id if missing
    if (!counts[row.lot_id]) {
      counts[row.lot_id] = { name: lotName, income: row.total_amount, booking_count: 1 };
    } else {
      counts[row.lot_id].income += row.total_amount;
      counts[row.lot_id].booking_count += 1;

    }
  }


  const sortedRevenue = Object.entries(counts)
    .sort((a, b) => b[1].income - a[1].income)
    .slice(0, 5)
    .map(([, value], index) => ({
      lot: value.name,
      revenue: value.income,
      fill: `var(--chart-${index + 1})`,
    }));



  const sortedBooking = Object.entries(counts)
    .sort((a, b) => b[1].booking_count - a[1].booking_count)
    .slice(0, 5)
    .map(([, value], index) => ({
      lot: value.name,
      bookings: value.booking_count,
      fill: `var(--chart-${index + 1})`,
    }));
  const bookingType = { month: "january", Event: eventCount, Regular: regularCount }



  return {
    TopBooking: sortedBooking,
    TopRevenue: sortedRevenue,
    BookingType: [bookingType],
    TotalBooking: totalBooking,
    TotalRevenue: totalRevenue,

  };
}


//The next code will return each lots revenue and booking count per month


export async function getRevenueByLot(
  client: TypedSupabaseClient,
  month: string // e.g. "2025-07"
): Promise<RevenueByLotDataItem[]> {
  const from = startOfMonth(new Date(month)).toISOString();
  const to = endOfToday().toISOString()

  const query = client
    .from("orders")
    .select("lot_id,total_amount, lots(name)")
    .gte("created_at", from)
    .lte("created_at", to);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const counts: Record<string, { name: string; income: number, booking_count: number }> = {};

  for (const row of data) {
    const lotName = row.lots?.name ?? row.lot_id; // fallback to lot_id if missing
    if (!counts[row.lot_id]) {
      counts[row.lot_id] = { name: lotName, income: row.total_amount, booking_count: 1 };
    } else {
      counts[row.lot_id].income += row.total_amount;
      counts[row.lot_id].booking_count += 1;

    }
  }


  const sorted = Object.entries(counts)
    .sort((a, b) => b[1].income - a[1].income)
    .slice(0, 5)
    .map(([, value]) => ({
      lot_name: value.name,
      month: new Date(month).toISOString().slice(0, 7),
      booking: value.booking_count,
      revenue: value.income,
    }));



  return sorted;
}

export async function getLotTotalRevenue(client: TypedSupabaseClient, lot_id: string) {
  const { data, error } = await client.from('orders').select("total_amount").eq('lot_id', lot_id)

  if (error) throw error
  const total = data?.reduce((acc, row) => acc + row.total_amount, 0);
  return total
}

export async function getLotMonthlyRevenue(client: TypedSupabaseClient, lot_id: string) {

  const { data: serverTime, error: serverTimeError } = await client.rpc("get_server_time");

  if (serverTimeError) throw serverTimeError

  const thirtyDaysAgo = subDays(new Date(serverTime), 30).toISOString();

  const { data, error } = await client
    .from("orders")
    .select("total_amount")
    .eq("lot_id", lot_id)
    .gte("created_at", thirtyDaysAgo);

  if (error) throw error
  const total = data?.reduce((acc, row) => acc + row.total_amount, 0);
  return total
}

export async function getLotOrdersCount(client: TypedSupabaseClient, lot_id: string) {
  const { count, error } = await client
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('lot_id', lot_id)

  if (error) throw error
  return count
}

export async function getLotOrdersCountByType(client: TypedSupabaseClient, lot_id: string) {
  const { data, error } = await client.rpc("get_orders_count_by_schedule_type", {
    lot: lot_id,
  });

  if (error) throw error;

  // returns something like: [{ is_event: true, total: 5 }, { is_event: false, total: 12 }]
  return data;
}

export async function getLotDailyBookingsByMonth(client: TypedSupabaseClient, month: string, lot_id: string): Promise<DailyBookingDataItem[]> {
  const from = startOfMonth(new Date(month)).toISOString();
  const to = endOfToday().toISOString()

  const { data, error } = await client
    .from("orders")
    .select("created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .eq('lot_id', lot_id)

  if (error) throw new Error(error.message);

  // Initialize all days in the month with count 0
  const dayMap: Record<string, number> = {};
  eachDayOfInterval({ start: from, end: to }).forEach((day) => {
    const key = formatISO(day, { representation: "date" });
    dayMap[key] = 0;
  });

  for (const row of data) {
    const key = formatISO(new Date(row.created_at), { representation: "date" });
    if (dayMap[key] !== undefined) {
      dayMap[key]++;
    }
  }

  return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
}
