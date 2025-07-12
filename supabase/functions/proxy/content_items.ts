// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

import { handleResponse } from "./_utils.ts";
type SupabaseClient = ReturnType<typeof createClient>;

export const listContentItems = async (
  client: SupabaseClient,
  options?: {
    // filter by schema id
    schemaId?: string;
    // pagination
    limit: number;
    offset: number;
    // sorting
    orderBy: "created_at" | "updated_at";
    orderDirection: "asc" | "desc";
  }
) => {
  let query = client.from("content_items").select("*");

  // Apply schema filter
  if (options?.schemaId) {
    query = query.eq("schema_id", options.schemaId);
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
    .from("content_items")
    .select("*")
    .eq("id", contentItemId)
    .single()
    .then(handleResponse);
};

export const createContentItem = async (
  client: SupabaseClient,
  contentItem: TablesInsert<{ schema: "yunocontent" }, "content_items">
) => {
  return await client
    .from("content_items")
    .insert(contentItem)
    .select()
    .single()
    .then(handleResponse);
};

export const updateContentItem = async (
  client: SupabaseClient,
  contentItemId: string,
  contentItem: TablesUpdate<{ schema: "yunocontent" }, "content_items">
) => {
  return await client
    .from("content_items")
    .update(contentItem)
    .eq("id", contentItemId)
    .select()
    .single()
    .then(handleResponse);
};

export const deleteContentItem = async (
  client: SupabaseClient,
  contentItemId: string
) => {
  return await client.from("content_items").delete().eq("id", contentItemId).then(handleResponse);
};
