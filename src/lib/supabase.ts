import { createClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          state: string | null
          district: string | null
          city: string | null
          college: string | null
          interests: string[]
          notification_channels: string[]
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          state?: string | null
          district?: string | null
          city?: string | null
          college?: string | null
          interests?: string[]
          notification_channels?: string[]
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          state?: string | null
          district?: string | null
          city?: string | null
          college?: string | null
          interests?: string[]
          notification_channels?: string[]
          onboarding_complete?: boolean
          updated_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          name: string
          url: string
          type: string
          category: string | null
          logo: string | null
          is_active: boolean
          last_checked: string | null
          notice_count: number
          metadata: any
          created_at: string
          updated_at: string
        }
      }
      notices: {
        Row: {
          id: string
          title: string
          description: string | null
          summary: string | null
          category: string
          department: string | null
          last_date: string | null
          amount: string | null
          urgency: "low" | "medium" | "high" | "critical"
          source_id: string | null
          pdf_url: string | null
          external_url: string | null
          hash: string | null
          views: number
          metadata: any
          created_at: string
          updated_at: string
        }
      }
      deadlines: {
        Row: {
          id: string
          notice_id: string
          deadline: string
          urgency_score: number
          reminder_sent: boolean
          created_at: string
        }
      }
      user_saved_notices: {
        Row: {
          id: string
          user_id: string
          notice_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notice_id: string
          created_at?: string
        }
      }
      user_followed_sources: {
        Row: {
          id: string
          user_id: string
          source_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_id: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notice_id: string
          channel: string
          status: string
          sent_at: string | null
          error_message: string | null
          metadata: any
          created_at: string
        }
      }
      scraper_logs: {
        Row: {
          id: string
          source_id: string | null
          status: string
          message: string | null
          notices_found: number
          notices_new: number
          duration_ms: number | null
          error_details: any
          created_at: string
        }
      }
      analytics: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          notice_id: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          notice_id?: string | null
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}

// Type helpers
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]
export type Source = Database["public"]["Tables"]["sources"]["Row"]
export type Notice = Database["public"]["Tables"]["notices"]["Row"]
export type Deadline = Database["public"]["Tables"]["deadlines"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type ScraperLog = Database["public"]["Tables"]["scraper_logs"]["Row"]
