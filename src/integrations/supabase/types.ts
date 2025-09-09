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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bids: {
        Row: {
          abandoned_at: string | null
          amount: number
          buyer_id: string
          confirmation_deadline: string | null
          confirmed_at: string | null
          created_at: string | null
          id: string
          product_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          abandoned_at?: string | null
          amount: number
          buyer_id: string
          confirmation_deadline?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          abandoned_at?: string | null
          amount?: number
          buyer_id?: string
          confirmation_deadline?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_room_id: string
          id: string
          joined_at: string
          left_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          chat_room_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_group: boolean | null
          max_participants: number | null
          name: string | null
          product_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          max_participants?: number | null
          name?: string | null
          product_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          max_participants?: number | null
          name?: string | null
          product_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          product_id: string | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          product_id?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          product_id?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          is_active: boolean | null
          keys: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          keys: Json
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          keys?: Json
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bidding_deadline: string
          bidding_start_time: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          location: string
          price: number
          quantity: number
          seller_id: string
          title: string
          unit: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          bidding_deadline?: string
          bidding_start_time?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          price: number
          quantity: number
          seller_id: string
          title: string
          unit: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          bidding_deadline?: string
          bidding_start_time?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          price?: number
          quantity?: number
          seller_id?: string
          title?: string
          unit?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bid_abandonment_count: number | null
          bid_suspension_until: string | null
          created_at: string | null
          email: string
          id: string
          last_abandonment_at: string | null
          name: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bid_abandonment_count?: number | null
          bid_suspension_until?: string | null
          created_at?: string | null
          email: string
          id: string
          last_abandonment_at?: string | null
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bid_abandonment_count?: number | null
          bid_suspension_until?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_abandonment_at?: string | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          from_user_id: string
          id: string
          rating: number
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          from_user_id: string
          id?: string
          rating: number
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          from_user_id?: string
          id?: string
          rating?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      safe_public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          name: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      abandon_expired_bids: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      can_user_bid: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_expired_products: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
