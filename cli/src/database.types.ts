export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  supacontent: {
    Tables: {
      projects: {
        Row: {
          id: number;
          user_id: string;
          name: string | null;
          inserted_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name?: string | null;
          inserted_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string | null;
          inserted_at?: string;
        };
      };
      content_types: {
        Row: {
          id: number;
          project_id: number;
          type: string | null;
          name: string | null;
          fields: Json;
          inserted_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          type?: string | null;
          name?: string | null;
          fields: Json;
          inserted_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          type?: string | null;
          name?: string | null;
          fields?: Json;
          inserted_at?: string;
        };
      };
      content: {
        Row: {
          id: number;
          content_type_id: number;
          data: Json;
          inserted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          content_type_id: number;
          data: Json;
          inserted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          content_type_id?: number;
          data?: Json;
          inserted_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {};
  };
  public: {
    Tables: {
      schema_migrations: {
        Row: {
          version: string;
        };
        Insert: {
          version: string;
        };
        Update: {
          version?: string;
        };
      };
    };
    Functions: {};
  };
}

