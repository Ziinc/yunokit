// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

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

export const deleteForum = async (client: SupabaseClient, id: number) => {
  return await client.from("forums").delete().eq("id", id).then(handleResponse);
};
