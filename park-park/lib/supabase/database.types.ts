export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      lots: {
        Row: {
          amenities: string[]
          close: string | null
          created_at: string | null
          description: string | null
          description_tag: string | null
          employees: string[]
          images: string[]
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
            foreignKeyName: "orders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["schedule_id"]
          }
        ]
      }
      schedules: {
        Row: {
          arrive_after: string | null
          created_at: string
          description: string | null
          duration: number | null
          exit_before: string | null
          is_event: boolean | null
          lot_id: string
          name: string
          price: number
          schedule_id: string
          slug: string
        }
        Insert: {
          arrive_after?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          exit_before?: string | null
          is_event?: boolean | null
          lot_id: string
          name: string
          price: number
          schedule_id?: string
          slug?: string
        }
        Update: {
          arrive_after?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          exit_before?: string | null
          is_event?: boolean | null
          lot_id?: string
          name?: string
          price?: number
          schedule_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["lot_id"]
          }
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
          }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never 