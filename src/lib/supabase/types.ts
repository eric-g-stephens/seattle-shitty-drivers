export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      report_flags: {
        Row: {
          created_at: string
          flagger_hash: string
          id: string
          reason: string | null
          report_id: string
        }
        Insert: {
          created_at?: string
          flagger_hash: string
          id?: string
          reason?: string | null
          report_id: string
        }
        Update: {
          created_at?: string
          flagger_hash?: string
          id?: string
          reason?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_flags_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          behaviors: string[]
          created_at: string
          flag_count: number
          hidden: boolean
          id: string
          lat: number | null
          lng: number | null
          location_text: string | null
          notes: string | null
          reporter_hash: string
          vehicle_id: string
        }
        Insert: {
          behaviors: string[]
          created_at?: string
          flag_count?: number
          hidden?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          location_text?: string | null
          notes?: string | null
          reporter_hash: string
          vehicle_id: string
        }
        Update: {
          behaviors?: string[]
          created_at?: string
          flag_count?: number
          hidden?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          location_text?: string | null
          notes?: string | null
          reporter_hash?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          first_reported_at: string
          id: string
          last_reported_at: string
          make: string | null
          model: string | null
          plate: string
          state: string
        }
        Insert: {
          color?: string | null
          first_reported_at?: string
          id?: string
          last_reported_at?: string
          make?: string | null
          model?: string | null
          plate: string
          state?: string
        }
        Update: {
          color?: string | null
          first_reported_at?: string
          id?: string
          last_reported_at?: string
          make?: string | null
          model?: string | null
          plate?: string
          state?: string
        }
        Relationships: []
      }
    }
    Views: {
      vehicle_leaderboard: {
        Row: {
          color: string | null
          id: string | null
          last_report_at: string | null
          make: string | null
          model: string | null
          plate: string | null
          report_count: number | null
          state: string | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
