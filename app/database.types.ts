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
          created_at: string
          description: string | null
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
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
      sb_mgmt_api:
        | {
            Args: {
              endpoint: string
              method?: string
              body?: Json
            }
            Returns: Json
          }
        | {
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
  supacontent: {
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
          {
            foreignKeyName: "content_authors_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          schema_id: string | null
          updated_at: string
          title: string
          status: 'published' | 'draft'
          data: Json
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          schema_id?: string | null
          updated_at?: string
          title: string
          status: 'published' | 'draft'
          data: Json
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          schema_id?: string | null
          updated_at?: string
          title?: string
          status?: 'published' | 'draft'
          data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "contents_schema_id_fkey"
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
          fields: Json
          id: string
          name: string
          type: 'single' | 'collection'
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          fields: Json
          id?: string
          name: string
          type: 'single' | 'collection'
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          fields?: Json
          id?: string
          name?: string
          type?: 'single' | 'collection'
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
      "supacontent.schema_type": "single" | "double"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

