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
