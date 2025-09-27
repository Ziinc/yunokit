import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

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

export interface ContentItemComment {
  id: string;
  contentItemId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  fieldId?: string; // Optional - if comment is about a specific field
  resolved?: boolean;
}

export const listSchemas = async (workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow[]>(
    `proxy/content/schemas?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getSchema = async (id: number, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/content/schemas/${id}?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const createSchema = async (
  schema: Partial<ContentSchemaRow>,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/content/schemas?${qp.toString()}`,
    {
      method: "POST",
      body: schema,
    }
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
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/content/schemas/${schemaId}?${qp.toString()}`,
    {
      method: "PUT",
      body: schema,
    }
  );
};

export const deleteSchema = async (
  id: number,
  workspaceId: number
): Promise<void> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  await supabase.functions.invoke(`proxy/content/schemas/${id}?${qp.toString()}`, {
    method: "DELETE",
  });
};
