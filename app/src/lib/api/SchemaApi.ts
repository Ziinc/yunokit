import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import { buildApiUrl } from "./utils";

type SchemaRow = Database["yunocontent"]["Tables"]["schemas"]["Row"];
export interface ContentSchemaRow extends Omit<SchemaRow, "fields"> {
  fields: SchemaField[] | [];
}

export enum SchemaFieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  ENUM = "enum",
  RELATION = "relation",
  IMAGE = "image",
  MARKDOWN = "markdown",
  JSON = "json",
}
export interface SchemaField {
  id: string;
  label: string;
  description: string | null;
  type: SchemaFieldType;
  required: boolean;
  default_value: string | boolean | number | null | Record<string, string>;
  options: string[];
  relation_schema_id: string | null;
}

// Additional types that aren't in database but are used throughout the app
export type ContentItemStatus = 'draft' | 'pending_review' | 'published';

export interface ContentItem {
  id: string;
  title: string;
  schemaId: string;
  status: ContentItemStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  icon?: string;
  data: Record<string, unknown>;
}


export const listSchemas = async (workspaceId: number) => {
  return await supabase.functions.invoke<ContentSchemaRow[]>(
    buildApiUrl("proxy/content/schemas", { workspaceId }),
    { method: "GET" }
  );
};

export const getSchema = async (id: number, workspaceId: number) => {
  return await supabase.functions.invoke<ContentSchemaRow>(
    buildApiUrl("proxy/content/schemas", { path: id, workspaceId }),
    { method: "GET" }
  );
};

export const createSchema = async (
  schema: Partial<ContentSchemaRow>,
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentSchemaRow>(
    buildApiUrl("proxy/content/schemas", { workspaceId }),
    { method: "POST", body: schema }
  );
};

export const updateSchema = async (
  schemaId: number,
  schema: Partial<
    Omit<
      ContentSchemaRow,
      "id" | "created_at" | "updated_at" | "deleted_at"
    >
  >,
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentSchemaRow>(
    buildApiUrl("proxy/content/schemas", { path: schemaId, workspaceId }),
    { method: "PUT", body: schema }
  );
};

export const deleteSchema = async (
  id: number,
  workspaceId: number
): Promise<void> => {
  await supabase.functions.invoke(
    buildApiUrl("proxy/content/schemas", { path: id, workspaceId }),
    { method: "DELETE" }
  );
};
