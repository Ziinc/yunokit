// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../../_shared/database.types.ts";
import { handleResponse } from "../_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listForums = async (client: SupabaseClient) => {
  return await client.from("forums").select().then(handleResponse);
};

export const getForum = async (client: SupabaseClient, id: number) => {
  return await client.from("forums").select().eq("id", id).single().then(handleResponse);
};

export const createForum = async (
  client: SupabaseClient,
  forum: TablesInsert<{ schema: "yunocommunity" }, "forums">
) => {
  return await client.from("forums").insert(forum).select().single().then(handleResponse);
};

export const updateForum = async (
  client: SupabaseClient,
  id: number,
  forum: TablesUpdate<{ schema: "yunocommunity" }, "forums">
) => {
  return await client.from("forums").update(forum).eq("id", id).select().single().then(handleResponse);
};

// Soft delete - sets deleted_at timestamp
export const deleteForum = async (client: SupabaseClient, id: number) => {
  return await client
    .from("forums")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
};

// Permanent delete - actually removes from database
export const permanentDeleteForum = async (client: SupabaseClient, id: number) => {
  return await client.from("forums").delete().eq("id", id).then(handleResponse);
};

// Archive forum - sets archived_at timestamp
export const archiveForum = async (client: SupabaseClient, id: number) => {
  return await client
    .from("forums")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
};

// Unarchive forum - clears archived_at timestamp
export const unarchiveForum = async (client: SupabaseClient, id: number) => {
  return await client
    .from("forums")
    .update({ archived_at: null })
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
};

// Restore forum - clears both deleted_at and archived_at timestamps to make it fully active
export const restoreForum = async (client: SupabaseClient, id: number) => {
  return await client
    .from("forums")
    .update({ deleted_at: null, archived_at: null })
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
}; 