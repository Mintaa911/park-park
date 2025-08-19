import { Database, Tables } from "./lib/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseClient = SupabaseClient<Database>;


export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    ATTENDANT = 'ATTENDANT'
}

export enum LotStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}

export type ParkingLot = Tables<'lots'>;
export type ParkingSchedule = Tables<'schedules'>;
export type Order = Tables<'orders'>;
export type PriceTier = Tables<'price_tiers'>


export interface PickerFile extends File {
    preview: string;
    url?: string;
}

export interface emailBody {
    email: string;
    stripe_payment_id: string;
    lot_name: string;
    location: string;
    start_time: string;
    end_time: string;
    session_id: string;
    amount_paid: number;
}



export type TopBookingLotsDataItem = {
    lot: string;       // Lot name or ID (used as label in the chart)
    bookings: number;  // Number of bookings (used as value in the chart)
    fill: string;      // Optional color fill for the pie slice
  };
  export type TopRevenueLotsDataItem = {
    lot: string;       // Lot name or ID (used as label in the chart)
    revenue: number;  // Number of bookings (used as value in the chart)
    fill: string;      // Optional color fill for the pie slice
  };
  export type MonthlyRevenue = {
    lot_name: string
    month: string // e.g., "2025-07"
    revenue: number
  }
  export type OrderTypeDataItem = {
    month: string; // "Event" or "Regular"
    Event: number;
    Regular: number;
  };


export type DailyBookingDataItem = {
  date: string; // e.g., "2025-07-01"
  count: number;
};
export type RevenueByLotDataItem={
  lot_name: string;
  month: string;
  booking: number;
  revenue: number;

}

export type DashboardDataType = {
    TopBooking : TopBookingLotsDataItem[],
    TopRevenue : TopRevenueLotsDataItem[],
    BookingType : OrderTypeDataItem[]
    TotalBooking : number,
    TotalRevenue : number,

  
  }

export type  TicketEvent = {
    id: string;
    name: string;
    dates: {
        start: any
    }
}