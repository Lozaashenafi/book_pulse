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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          pdf_url: string | null
          title: string
          total_pages: number | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pdf_url?: string | null
          title: string
          total_pages?: number | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pdf_url?: string | null
          title?: string
          total_pages?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          club_id: string
          end_page: number
          id: string
          start_page: number
          title: string | null
        }
        Insert: {
          chapter_number: number
          club_id: string
          end_page: number
          id?: string
          start_page: number
          title?: string | null
        }
        Update: {
          chapter_number?: number
          club_id?: string
          end_page?: number
          id?: string
          start_page?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          chapter_id: string | null
          club_id: string
          created_at: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["chat_room_type"]
        }
        Insert: {
          chapter_id?: string | null
          club_id: string
          created_at?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["chat_room_type"]
        }
        Update: {
          chapter_id?: string | null
          club_id?: string
          created_at?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["chat_room_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_invites: {
        Row: {
          club_id: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          token: string
          uses: number | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          token: string
          uses?: number | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          token?: string
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "club_invites_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          is_suspended: boolean | null
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"] | null
          suspended_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          is_suspended?: boolean | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"] | null
          suspended_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          is_suspended?: boolean | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"] | null
          suspended_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_reports: {
        Row: {
          club_id: string
          created_at: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "club_reports_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          book_id: string
          created_at: string | null
          default_end_date: string
          default_start_date: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          name: string
          owner_id: string
          start_date: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["club_visibility"] | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          default_end_date: string
          default_start_date: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name: string
          owner_id: string
          start_date: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["club_visibility"] | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          default_end_date?: string
          default_start_date?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name?: string
          owner_id?: string
          start_date?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["club_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          announcement_email: boolean | null
          club_invite_email: boolean | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          new_member_email: boolean | null
          new_post_email: boolean | null
          reading_reminder_email: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_email?: boolean | null
          club_invite_email?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          new_member_email?: boolean | null
          new_post_email?: boolean | null
          reading_reminder_email?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_email?: boolean | null
          club_invite_email?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          new_member_email?: boolean | null
          new_post_email?: boolean | null
          reading_reminder_email?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          club_id: string | null
          content: string
          created_at: string | null
          id: string
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          post_type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          image: string | null
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          image?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          image?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          chapter_id: string | null
          club_id: string
          current_page: number | null
          id: string
          status: Database["public"]["Enums"]["reading_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          club_id: string
          current_page?: number | null
          id?: string
          status?: Database["public"]["Enums"]["reading_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          club_id?: string
          current_page?: number | null
          id?: string
          status?: Database["public"]["Enums"]["reading_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_timelines: {
        Row: {
          club_id: string
          end_date: string
          id: string
          start_date: string
          user_id: string
        }
        Insert: {
          club_id: string
          end_date: string
          id?: string
          start_date: string
          user_id: string
        }
        Update: {
          club_id?: string
          end_date?: string
          id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_timelines_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_timelines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      chat_room_type: "GENERAL" | "SPOILER" | "CHAPTER"
      club_role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER"
      club_visibility: "PUBLIC" | "PRIVATE"
      notification_type:
        | "NEW_MEMBER"
        | "NEW_POST"
        | "READING_REMINDER"
        | "CLUB_INVITE"
        | "ANNOUNCEMENT"
      post_type:
        | "CLUB_ANNOUNCEMENT"
        | "MEMBER_POST"
        | "CHAPTER_UPDATE"
        | "GENERAL"
      reading_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
      report_status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED"
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
      chat_room_type: ["GENERAL", "SPOILER", "CHAPTER"],
      club_role: ["OWNER", "ADMIN", "MODERATOR", "MEMBER"],
      club_visibility: ["PUBLIC", "PRIVATE"],
      notification_type: [
        "NEW_MEMBER",
        "NEW_POST",
        "READING_REMINDER",
        "CLUB_INVITE",
        "ANNOUNCEMENT",
      ],
      post_type: [
        "CLUB_ANNOUNCEMENT",
        "MEMBER_POST",
        "CHAPTER_UPDATE",
        "GENERAL",
      ],
      reading_status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      report_status: ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"],
    },
  },
} as const
