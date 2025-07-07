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
  yunocontent: {
    Tables: {
      authors: {
        Row: {
          description: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          pseudonym: string | null
          sc_user_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          description?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          pseudonym?: string | null
          sc_user_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          pseudonym?: string | null
          sc_user_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_authors: {
        Row: {
          author_id: string
          content_id: string
          id: number
        }
        Insert: {
          author_id: string
          content_id: string
          id?: number
        }
        Update: {
          author_id?: string
          content_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
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
      schemas: {
        Row: {
          archived_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          fields: Json | null
          id: number
          name: string | null
          type: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: never
          name?: string | null
          type?: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: never
          name?: string | null
          type?: Database["yunocontent"]["Enums"]["schema_type"] | null
          updated_at?: string
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
      schema_type: "single" | "collection"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
  yunocontent: {
    Enums: {
      schema_type: ["single", "collection"],
    },
  },
} as const

