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

export interface PickerFile extends File {
    preview: string;
    url?: string;
  }
