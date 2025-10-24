import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import { buildApiUrl } from "./utils";

export type ContentItemRow = Database['yunocontent']['Views']['content_items_vw']['Row'];
type ContentItemInsert = Database['yunocontent']['Tables']['content_items']['Insert'];
type ContentItemUpdate = Database['yunocontent']['Tables']['content_items']['Update'];
type ContentItemVersionRow = Database['yunocontent']['Tables']['content_item_versions']['Row'];

// Content Item Operations
export interface ListContentItemsOptions {
  schemaIds?: number[] | string[] | undefined;
  status?: string;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "updated_at" | "published_at";
  orderDirection?: "asc" | "desc";
}

export const listContentItems = async (
  workspaceId: number,
  options?: ListContentItemsOptions
) => {
  return await supabase.functions.invoke<ContentItemRow[]>(
    buildApiUrl("proxy/content/content_items", {
      workspaceId,
      query: {
        schemaIds: options?.schemaIds,
        status: options?.status,
        limit: options?.limit,
        offset: options?.offset,
        orderBy: options?.orderBy,
        orderDirection: options?.orderDirection,
      },
    }),
    { method: "GET" }
  );
};

export const getContentItemById = async (id: number, workspaceId: number) => {
  return await supabase.functions.invoke<ContentItemRow>(
    buildApiUrl("proxy/content/content_items", { path: id, workspaceId }),
    { method: "GET" }
  );
};

export const listContentItemsBySchema = async (schemaId: number, workspaceId: number) => {
  return await supabase.functions.invoke<ContentItemRow[]>(
    buildApiUrl("proxy/content/content_items", {
      workspaceId,
      query: { schemaId },
    }),
    { method: "GET" }
  );
};

export const createContentItem = async (
  item: ContentItemInsert,
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentItemRow>(
    buildApiUrl("proxy/content/content_items", { workspaceId }),
    { method: "POST", body: item }
  );
};

export const updateContentItem = async (
  itemId: number,
  item: ContentItemUpdate,
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentItemRow>(
    buildApiUrl("proxy/content/content_items", { path: itemId, workspaceId }),
    { method: "PUT", body: item }
  );
};

export const deleteContentItem = async (id: number, workspaceId: number): Promise<void> => {
  await supabase.functions.invoke(
    buildApiUrl("proxy/content/content_items", { path: id, workspaceId }),
    { method: "DELETE" }
  );
};

export const listContentItemVersions = async (
  contentItemId: number,
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentItemVersionRow[]>(
    buildApiUrl("proxy/content/content_items", { path: [contentItemId, "versions"], workspaceId }),
    { method: "GET" }
  );
};

export const getContentItemVersion = async (versionId: number, workspaceId: number) => {
  return await supabase.functions.invoke<ContentItemVersionRow>(
    buildApiUrl("proxy/content/content_item_versions", { path: versionId, workspaceId }),
    { method: "GET" }
  );
};

export const createContentItemVersion = async (
  version: Database['yunocontent']['Tables']['content_item_versions']['Insert'],
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentItemVersionRow>(
    buildApiUrl("proxy/content/content_item_versions", { workspaceId }),
    { method: "POST", body: version }
  );
};

export const updateContentItemVersion = async (
  versionId: number,
  version: Database['yunocontent']['Tables']['content_item_versions']['Update'],
  workspaceId: number
) => {
  return await supabase.functions.invoke<ContentItemVersionRow>(
    buildApiUrl("proxy/content/content_item_versions", { path: versionId, workspaceId }),
    { method: "PUT", body: version }
  );
};

export const deleteContentItemVersion = async (versionId: number, workspaceId: number): Promise<void> => {
  await supabase.functions.invoke(
    buildApiUrl("proxy/content/content_item_versions", { path: versionId, workspaceId }),
    { method: "DELETE" }
  );
};

export const listContentItemVersionsByOptions = async (
  workspaceId: number,
  options?: {
    contentItemId?: number;
    schemaId?: number;
    limit?: number;
    offset?: number;
    orderBy?: "created_at" | "id";
    orderDirection?: "asc" | "desc";
  }
) => {
  return await supabase.functions.invoke<ContentItemVersionRow[]>(
    buildApiUrl("proxy/content/content_item_versions", {
      workspaceId,
      query: {
        contentItemId: options?.contentItemId,
        schemaId: options?.schemaId,
        limit: options?.limit,
        offset: options?.offset,
        orderBy: options?.orderBy,
        orderDirection: options?.orderDirection,
      },
    }),
    { method: "GET" }
  );
};
