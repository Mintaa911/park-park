export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      lot_venues: {
        Row: {
          created_at: string
          id: number
          lot_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          lot_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: number
          lot_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_venues_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["lot_id"]
          },
        ]
      }
      lots: {
        Row: {
          amenities: string[]
          close: string | null
          created_at: string | null
          description: string | null
          description_tag: string | null
          employees: string[]
          images: string[]
          is_24_hours: boolean | null
          latitude: string | null
          location: string
          longitude: string | null
          lot_id: string
          name: string
          open: string | null
          phone: string
          qr_image: string
          slug: string
          space_count: number
          status: Database["public"]["Enums"]["lot_status"]
          supervisors: string[]
        }
        Insert: {
          amenities: string[]
          close?: string | null
          created_at?: string | null
          description?: string | null
          description_tag?: string | null
          employees: string[]
          images: string[]
          is_24_hours?: boolean | null
          latitude?: string | null
          location: string
          longitude?: string | null
          lot_id?: string
          name: string
          open?: string | null
          phone: string
          qr_image?: string
          slug?: string
          space_count: number
          status?: Database["public"]["Enums"]["lot_status"]
          supervisors: string[]
        }
        Update: {
          amenities?: string[]
          close?: string | null
          created_at?: string | null
          description?: string | null
          description_tag?: string | null
          employees?: string[]
          images?: string[]
          is_24_hours?: boolean | null
          latitude?: string | null
          location?: string
          longitude?: string | null
          lot_id?: string
          name?: string
          open?: string | null
          phone?: string
          qr_image?: string
          slug?: string
          space_count?: number
          status?: Database["public"]["Enums"]["lot_status"]
          supervisors?: string[]
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          email: string
          license_plate: string
          license_state: string
          lot_id: string
          order_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          price_tier: string | null
          schedule_id: string
          start_time: string
          stripe_payment_intent_id: string
          total_amount: number
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string
          email: string
          license_plate: string
          license_state: string
          lot_id: string
          order_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          price_tier?: string | null
          schedule_id: string
          start_time: string
          stripe_payment_intent_id: string
          total_amount: number
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string
          email?: string
          license_plate?: string
          license_state?: string
          lot_id?: string
          order_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          price_tier?: string | null
          schedule_id?: string
          start_time?: string
          stripe_payment_intent_id?: string
          total_amount?: number
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "orders_price_tier_fkey"
            columns: ["price_tier"]
            isOneToOne: false
            referencedRelation: "price_tiers"
            referencedColumns: ["price_id"]
          },
          {
            foreignKeyName: "orders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["schedule_id"]
          },
        ]
      }
      price_tiers: {
        Row: {
          created_at: string
          maxHour: number
          price: number
          price_id: string
          schedule_id: string
        }
        Insert: {
          created_at?: string
          maxHour: number
          price: number
          price_id?: string
          schedule_id?: string
        }
        Update: {
          created_at?: string
          maxHour?: number
          price?: number
          price_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_tiers_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["schedule_id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          days: number[]
          deleted_at: string | null
          description: string | null
          end_time: string | null
          event_end: string | null
          event_start: string | null
          is_event: boolean | null
          lot_id: string
          name: string
          schedule_id: string
          slug: string
          start_time: string | null
          tm_event_id: string | null
        }
        Insert: {
          created_at?: string
          days: number[]
          deleted_at?: string | null
          description?: string | null
          end_time?: string | null
          event_end?: string | null
          event_start?: string | null
          is_event?: boolean | null
          lot_id: string
          name: string
          schedule_id?: string
          slug?: string
          start_time?: string | null
          tm_event_id?: string | null
        }
        Update: {
          created_at?: string
          days?: number[]
          deleted_at?: string | null
          description?: string | null
          end_time?: string | null
          event_end?: string | null
          event_start?: string | null
          is_event?: boolean | null
          lot_id?: string
          name?: string
          schedule_id?: string
          slug?: string
          start_time?: string | null
          tm_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["lot_id"]
          },
        ]
      }
      transaction: {
        Row: {
          created_at: string
          email: string
          order_id: string | null
          status: string | null
          transaction_id: string
        }
        Insert: {
          created_at?: string
          email: string
          order_id?: string | null
          status?: string | null
          transaction_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          order_id?: string | null
          status?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["Roles"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["Roles"]
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["Roles"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lot_status: "OPEN" | "CLOSED"
      payment_status: "PENDING" | "PAID"
      Roles: "ADMIN" | "OWNER" | "CUSTOMER" | "SUPERVISOR"
      vehicle_type: "STANDARD" | "OVERSIZE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lot_status: ["OPEN", "CLOSED"],
      payment_status: ["PENDING", "PAID"],
      Roles: ["ADMIN", "OWNER", "CUSTOMER", "SUPERVISOR"],
      vehicle_type: ["STANDARD", "OVERSIZE"],
    },
  },
} as const
