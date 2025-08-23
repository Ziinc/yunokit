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
      supabase_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: number | null
          id: number
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          id?: number
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          id?: number
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          code_verifier: string | null
          created_at: string
          default_workspace_id: number | null
          id: number
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string
          default_workspace_id?: number | null
          id?: number
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          default_workspace_id?: number | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_default_workspace_id_fkey"
            columns: ["default_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          created_at: string
          id: number
          user_id: string
          workspace_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
          workspace_id: number
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
          workspace_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          api_key: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          project_ref: string | null
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          project_ref?: string | null
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          project_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_supabase_connection: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_token_needs_refresh: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      delete_supabase_connection: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sb_mgmt_api: {
        Args: {
          endpoint: string
          method?: string
          body?: Json
          base_url?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  yunocommunity: {
    Tables: {
      comments: {
        Row: {
          content_data: Json | null
          content_item_id: number | null
          id: number
          parent_comment_id: number | null
          user_author_id: string | null
        }
        Insert: {
          content_data?: Json | null
          content_item_id?: number | null
          id?: number
          parent_comment_id?: number | null
          user_author_id?: string | null
        }
        Update: {
          content_data?: Json | null
          content_item_id?: number | null
          id?: number
          parent_comment_id?: number | null
          user_author_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          archived_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content_data: Json | null
          content_item_id: number | null
          forum_id: number | null
          id: number
          multi_thread: boolean
          user_author_id: string | null
        }
        Insert: {
          content_data?: Json | null
          content_item_id?: number | null
          forum_id?: number | null
          id?: number
          multi_thread?: boolean
          user_author_id?: string | null
        }
        Update: {
          content_data?: Json | null
          content_item_id?: number | null
          forum_id?: number | null
          id?: number
          multi_thread?: boolean
          user_author_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  yunocontent: {
    Tables: {
      content_item_versions: {
        Row: {
          content_item_id: number
          created_at: string
          data: Json | null
          id: number
          schema_id: number
        }
        Insert: {
          content_item_id: number
          created_at?: string
          data?: Json | null
          id?: number
          schema_id: number
        }
        Update: {
          content_item_id?: number
          created_at?: string
          data?: Json | null
          id?: number
          schema_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_item_versions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_versions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items_vw"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_versions_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          archived_at: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: number
          published_at: string | null
          schema_id: number | null
          title: string | null
          uid: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: number
          published_at?: string | null
          schema_id?: number | null
          title?: string | null
          uid?: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: number
          published_at?: string | null
          schema_id?: number | null
          title?: string | null
          uid?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items_authors: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      schemas: {
        Row: {
          archived_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          fields: Json | null
          id: number
          name: string
          strict: boolean
          type: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: number
          name: string
          strict?: boolean
          type?: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: number
          name?: string
          strict?: boolean
          type?: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      content_items_vw: {
        Row: {
          archived_at: string | null
          created_at: string | null
          data: Json | null
          deleted_at: string | null
          id: number | null
          published_at: string | null
          schema_id: number | null
          status: string | null
          title: string | null
          uid: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: number | null
          published_at?: string | null
          schema_id?: number | null
          status?: never
          title?: string | null
          uid?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: number | null
          published_at?: string | null
          schema_id?: number | null
          status?: never
          title?: string | null
          uid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "schemas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      schema_type: "single" | "collection"
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
  yunocommunity: {
    Enums: {},
  },
  yunocontent: {
    Enums: {
      schema_type: ["single", "collection"],
    },
  },
} as const

