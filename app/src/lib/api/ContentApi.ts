import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

export type ContentItemRow = Database['yunocontent']['Views']['content_items_vw']['Row'];
export type ContentItemInsert = Database['yunocontent']['Tables']['content_items']['Insert'];
export type ContentItemUpdate = Database['yunocontent']['Tables']['content_items']['Update'];
export type ContentItemVersionRow = Database['yunocontent']['Tables']['content_item_versions']['Row'];

// Content Item Operations
export interface ListContentItemsOptions {
  schemaIds?: number[];
  authorIds?: number[];
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
  const qp = new URLSearchParams();
  qp.set("workspaceId", workspaceId.toString());
  if (options?.schemaIds) qp.set("schemaIds", options.schemaIds.join(","));
  if (options?.authorIds) qp.set("authorIds", options.authorIds.join(","));
  if (options?.status) qp.set("status", options.status);
  if (options?.limit !== undefined) qp.set("limit", options.limit.toString());
  if (options?.offset !== undefined) qp.set("offset", options.offset.toString());
  if (options?.orderBy) qp.set("orderBy", options.orderBy);
  if (options?.orderDirection)
    qp.set("orderDirection", options.orderDirection);

  return await supabase.functions.invoke<ContentItemRow[]>(
    `proxy/content/content_items?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getContentItemById = async (id: number, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemRow>(
    `proxy/content/content_items/${id}?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const listContentItemsBySchema = async (schemaId: number, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schemaId: schemaId.toString(),
  });

  return await supabase.functions.invoke<ContentItemRow[]>(
    `proxy/content/content_items?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const createContentItem = async (
  item: ContentItemInsert,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemRow>(
    `proxy/content/content_items?${qp.toString()}`,
    {
      method: "POST",
      body: item,
    }
  );
};

export const updateContentItem = async (
  itemId: number,
  item: ContentItemUpdate,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemRow>(
    `proxy/content/content_items/${itemId}?${qp.toString()}`,
    {
      method: "PUT",
      body: item,
    }
  );
};

export const deleteContentItem = async (id: number, workspaceId: number): Promise<void> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  await supabase.functions.invoke(`proxy/content/content_items/${id}?${qp.toString()}`, {
    method: "DELETE",
  });
};

export const listContentItemVersions = async (
  contentItemId: number,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemVersionRow[]>(
    `proxy/content/content_items/${contentItemId}/versions?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getContentItemVersion = async (versionId: number, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemVersionRow>(
    `proxy/content/content_item_versions/${versionId}?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const createContentItemVersion = async (
  version: Database['yunocontent']['Tables']['content_item_versions']['Insert'],
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemVersionRow>(
    `proxy/content/content_item_versions?${qp.toString()}`,
    {
      method: "POST",
      body: version,
    }
  );
};

export const updateContentItemVersion = async (
  versionId: number,
  version: Database['yunocontent']['Tables']['content_item_versions']['Update'],
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentItemVersionRow>(
    `proxy/content/content_item_versions/${versionId}?${qp.toString()}`,
    {
      method: "PUT",
      body: version,
    }
  );
};

export const deleteContentItemVersion = async (versionId: number, workspaceId: number): Promise<void> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  await supabase.functions.invoke(`proxy/content/content_item_versions/${versionId}?${qp.toString()}`, {
    method: "DELETE",
  });
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
  const qp = new URLSearchParams();
  qp.set("workspaceId", workspaceId.toString());
  if (options?.contentItemId) qp.set("contentItemId", options.contentItemId.toString());
  if (options?.schemaId) qp.set("schemaId", options.schemaId.toString());
  if (options?.limit !== undefined) qp.set("limit", options.limit.toString());
  if (options?.offset !== undefined) qp.set("offset", options.offset.toString());
  if (options?.orderBy) qp.set("orderBy", options.orderBy);
  if (options?.orderDirection) qp.set("orderDirection", options.orderDirection);

  return await supabase.functions.invoke<ContentItemVersionRow[]>(
    `proxy/content/content_item_versions?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};
