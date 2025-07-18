// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

import { handleResponse } from "./_utils.ts";
type SupabaseClient = ReturnType<typeof createClient>;

export const listContentItems = async (
  client: SupabaseClient,
  options?: {
    schemaIds?: number[];
    authorIds?: number[];
    status?: string;
    limit?: number;
    offset?: number;
    orderBy?: "created_at" | "updated_at" | "published_at";
    orderDirection?: "asc" | "desc";
  }
) => {
  let query = client.from("content_items_vw").select();

  // Apply schema filter
  if (options?.schemaIds) {
    query = query.in("schema_id", options.schemaIds);
  }

  // Apply author filter
  if (options?.authorIds) {
    query = query.in("author_id", options.authorIds);
  }

  // Apply status filter
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === "asc" });
  }

  if (options?.offset && options?.limit) {
    // Apply pagination
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  return await query.then(handleResponse);
};

export const getContentItem = async (
  client: SupabaseClient,
  contentItemId: string
) => {
  return await client
    .from("content_items_vw")
    .select("*")
    .eq("id", contentItemId)
    .single()
    .then(handleResponse);
};

export const createContentItem = async (
  client: SupabaseClient,
  contentItem: TablesInsert<{ schema: "yunocontent" }, "content_items">
) => {
  const result = await client
    .from("content_items")
    .insert(contentItem)
    .select("id")
    .single()
    .then(handleResponse);

  if (result.error) {
    return result;
  }

  return await client
    .from("content_items_vw")
    .select()
    .eq("id", result.data.id)
    .single()
    .then(handleResponse);
};

export const updateContentItem = async (
  client: SupabaseClient,
  contentItemId: string,
  contentItem: TablesUpdate<{ schema: "yunocontent" }, "content_items">
) => {
  await client
    .from("content_items")
    .update(contentItem)
    .eq("id", contentItemId);

  return await client
    .from("content_items_vw")
    .select()
    .eq("id", contentItemId)
    .single()
    .then(handleResponse);
};

export const deleteContentItem = async (
  client: SupabaseClient,
  contentItemId: string
) => {
  return await client.from("content_items").delete().eq("id", contentItemId).then(handleResponse);
};
