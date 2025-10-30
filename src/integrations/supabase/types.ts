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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advisor_reviews: {
        Row: {
          advisor_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_reviews_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          bio: string | null
          certifications: Json | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          rating: number | null
          specialization: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          certifications?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          certifications?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          room_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_members: number | null
          name: string
          room_type: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_members?: number | null
          name: string
          room_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_members?: number | null
          name?: string
          room_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          event_id: string
          id: string
          payment_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          payment_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          payment_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          end_time: string
          event_type: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          organizer_id: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_id: string
          start_time: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      finfluencers: {
        Row: {
          bio: string | null
          channel_name: string
          commission_rate: number | null
          content_categories: string[] | null
          created_at: string | null
          followers_count: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          platform: string | null
          profile_id: string | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          channel_name: string
          commission_rate?: number | null
          content_categories?: string[] | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          platform?: string | null
          profile_id?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          channel_name?: string
          commission_rate?: number | null
          content_categories?: string[] | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          platform?: string | null
          profile_id?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finfluencers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          metadata: Json | null
          payment_type: string | null
          reference_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pledge_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          payload_json: Json | null
          success: boolean | null
          target_pledge_id: string | null
          target_session_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          payload_json?: Json | null
          success?: boolean | null
          target_pledge_id?: string | null
          target_session_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          payload_json?: Json | null
          success?: boolean | null
          target_pledge_id?: string | null
          target_session_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pledge_audit_log_target_pledge_id_fkey"
            columns: ["target_pledge_id"]
            isOneToOne: false
            referencedRelation: "pledges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledge_audit_log_target_session_id_fkey"
            columns: ["target_session_id"]
            isOneToOne: false
            referencedRelation: "pledge_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pledge_execution_records: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          demat_account_id: string | null
          executed_at: string | null
          executed_price: number
          executed_qty: number
          id: string
          platform_commission: number | null
          pledge_id: string
          pledged_qty: number
          session_id: string
          side: string | null
          status: string | null
          stock_symbol: string
          total_execution_value: number
          user_id: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          demat_account_id?: string | null
          executed_at?: string | null
          executed_price: number
          executed_qty: number
          id?: string
          platform_commission?: number | null
          pledge_id: string
          pledged_qty: number
          session_id: string
          side?: string | null
          status?: string | null
          stock_symbol: string
          total_execution_value: number
          user_id: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          demat_account_id?: string | null
          executed_at?: string | null
          executed_price?: number
          executed_qty?: number
          id?: string
          platform_commission?: number | null
          pledge_id?: string
          pledged_qty?: number
          session_id?: string
          side?: string | null
          status?: string | null
          stock_symbol?: string
          total_execution_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledge_execution_records_pledge_id_fkey"
            columns: ["pledge_id"]
            isOneToOne: false
            referencedRelation: "pledges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledge_execution_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pledge_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pledge_sessions: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          execution_rule: string | null
          id: string
          last_executed_at: string | null
          session_end: string
          session_start: string
          status: string | null
          stock_symbol: string
          target_price: number | null
          title: string
          total_participants: number | null
          total_pledged: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          execution_rule?: string | null
          id?: string
          last_executed_at?: string | null
          session_end: string
          session_start: string
          status?: string | null
          stock_symbol: string
          target_price?: number | null
          title: string
          total_participants?: number | null
          total_pledged?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          execution_rule?: string | null
          id?: string
          last_executed_at?: string | null
          session_end?: string
          session_start?: string
          status?: string | null
          stock_symbol?: string
          target_price?: number | null
          title?: string
          total_participants?: number | null
          total_pledged?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pledges: {
        Row: {
          consent_signed: boolean | null
          created_at: string | null
          demat_account_id: string | null
          id: string
          payment_id: string | null
          platform_fee: number | null
          price_target: number
          qty: number
          risk_acknowledged: boolean | null
          session_id: string
          side: string | null
          status: Database["public"]["Enums"]["pledge_status"] | null
          stock_symbol: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consent_signed?: boolean | null
          created_at?: string | null
          demat_account_id?: string | null
          id?: string
          payment_id?: string | null
          platform_fee?: number | null
          price_target: number
          qty: number
          risk_acknowledged?: boolean | null
          session_id: string
          side?: string | null
          status?: Database["public"]["Enums"]["pledge_status"] | null
          stock_symbol: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consent_signed?: boolean | null
          created_at?: string | null
          demat_account_id?: string | null
          id?: string
          payment_id?: string | null
          platform_fee?: number | null
          price_target?: number
          qty?: number
          risk_acknowledged?: boolean | null
          session_id?: string
          side?: string | null
          status?: Database["public"]["Enums"]["pledge_status"] | null
          stock_symbol?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledges_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pledge_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at: string | null
        }
        Insert: {
          id?: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at?: string | null
        }
        Update: {
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          is_featured: boolean | null
          options: Json
          poll_type: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["poll_status"] | null
          stock_symbol: string | null
          title: string
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_featured?: boolean | null
          options?: Json
          poll_type?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["poll_status"] | null
          stock_symbol?: string | null
          title: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_featured?: boolean | null
          options?: Json
          poll_type?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["poll_status"] | null
          stock_symbol?: string | null
          title?: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          avg_price: number
          created_at: string | null
          current_price: number | null
          id: string
          last_updated: string | null
          qty: number
          stock_symbol: string
          user_id: string
        }
        Insert: {
          avg_price: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          last_updated?: string | null
          qty: number
          stock_symbol: string
          user_id: string
        }
        Update: {
          avg_price?: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          last_updated?: string | null
          qty?: number
          stock_symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          plan_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          added_at: string | null
          id: string
          notes: string | null
          stock_symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          notes?: string | null
          stock_symbol: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          notes?: string | null
          stock_symbol?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "fund_manager"
        | "investor"
        | "advisor"
        | "finfluencer"
        | "organizer"
        | "vendor"
        | "user"
      event_status: "draft" | "published" | "cancelled" | "completed"
      notification_type:
        | "system"
        | "payment"
        | "event"
        | "pledge"
        | "poll"
        | "message"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      pledge_status: "pending" | "paid" | "executed" | "cancelled"
      poll_status: "active" | "closed" | "draft"
      subscription_tier: "free" | "basic" | "premium" | "enterprise"
      transaction_type: "deposit" | "withdrawal" | "profit" | "fee" | "refund"
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
      app_role: [
        "super_admin",
        "admin",
        "fund_manager",
        "investor",
        "advisor",
        "finfluencer",
        "organizer",
        "vendor",
        "user",
      ],
      event_status: ["draft", "published", "cancelled", "completed"],
      notification_type: [
        "system",
        "payment",
        "event",
        "pledge",
        "poll",
        "message",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      pledge_status: ["pending", "paid", "executed", "cancelled"],
      poll_status: ["active", "closed", "draft"],
      subscription_tier: ["free", "basic", "premium", "enterprise"],
      transaction_type: ["deposit", "withdrawal", "profit", "fee", "refund"],
    },
  },
} as const
