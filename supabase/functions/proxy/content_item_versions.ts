// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

import { handleResponse } from "./_utils.ts";
type SupabaseClient = ReturnType<typeof createClient>;

export const listContentItemVersions = async (
  client: SupabaseClient,
  options?: {
    // filter by content item id
    contentItemId?: number;
    // filter by schema id
    schemaId?: number;
    // pagination
    limit?: number;
    offset?: number;
    // sorting
    orderBy?: "created_at" | "id";
    orderDirection?: "asc" | "desc";
  }
) => {
  let query = client.from("content_item_versions").select();

  // Apply content item filter
  if (options?.contentItemId) {
    query = query.eq("content_item_id", options.contentItemId);
  }

  // Apply schema filter
  if (options?.schemaId) {
    query = query.eq("schema_id", options.schemaId);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === "asc" });
  } else {
    // Default ordering by created_at desc (newest first)
    query = query.order("created_at", { ascending: false });
  }

  if (options?.offset && options?.limit) {
    // Apply pagination
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  return await query.then(handleResponse);
};

export const getContentItemVersion = async (
  client: SupabaseClient,
  versionId: string
) => {
  return await client
    .from("content_item_versions")
    .select("*")
    .eq("id", versionId)
    .single()
    .then(handleResponse);
};

export const createContentItemVersion = async (
  client: SupabaseClient,
  version: TablesInsert<{ schema: "yunocontent" }, "content_item_versions">
) => {
  return await client
    .from("content_item_versions")
    .insert(version)
    .select()
    .single()
    .then(handleResponse);
};

export const updateContentItemVersion = async (
  client: SupabaseClient,
  versionId: string,
  version: TablesUpdate<{ schema: "yunocontent" }, "content_item_versions">
) => {
  return await client
    .from("content_item_versions")
    .update(version)
    .eq("id", versionId)
    .select()
    .single()
    .then(handleResponse);
};

export const deleteContentItemVersion = async (
  client: SupabaseClient,
  versionId: string
) => {
  return await client
    .from("content_item_versions")
    .delete()
    .eq("id", versionId)
    .then(handleResponse);
};

// Additional utility function to get all versions for a specific content item
export const getContentItemVersionHistory = async (
  client: SupabaseClient,
  contentItemId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) => {
  let query = client
    .from("content_item_versions")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: false });

  if (options?.offset && options?.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  return await query.then(handleResponse);
}; 