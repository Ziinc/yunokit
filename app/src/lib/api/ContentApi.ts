import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

export type ContentItemRow = Database['yunocontent']['Views']['content_items_vw']['Row'];
export type ContentItemInsert = Database['yunocontent']['Tables']['content_items']['Insert'];
export type ContentItemUpdate = Database['yunocontent']['Tables']['content_items']['Update'];
export type ContentItemVersionRow = Database['yunocontent']['Tables']['content_item_versions']['Row'];

// Content Item Operations
export const listContentItems = async (workspaceId?: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId?.toString() || '',
  });

  return await supabase.functions.invoke<ContentItemRow[]>(
    `proxy/content_items?${qp.toString()}`,
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
    `proxy/content_items/${id}?${qp.toString()}`,
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
    `proxy/content_items?${qp.toString()}`,
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
    `proxy/content_items?${qp.toString()}`,
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
    `proxy/content_items/${itemId}?${qp.toString()}`,
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

  await supabase.functions.invoke(`proxy/content_items/${id}?${qp.toString()}`, {
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
    `proxy/content_items/${contentItemId}/versions?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};
