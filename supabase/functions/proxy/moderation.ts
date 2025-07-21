// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listBans = async (client: SupabaseClient) => {
  return await client.from("user_bans").select().then(handleResponse);
};

export const banUser = async (
  client: SupabaseClient,
  ban: TablesInsert<{ schema: "yunocommunity" }, "user_bans">
) => {
  return await client.from("user_bans").insert(ban).select().single().then(handleResponse);
};

export const updateBan = async (
  client: SupabaseClient,
  id: number,
  ban: TablesUpdate<{ schema: "yunocommunity" }, "user_bans">
) => {
  return await client.from("user_bans").update(ban).eq("id", id).select().single().then(handleResponse);
};

export const unbanUser = async (client: SupabaseClient, id: number) => {
  return await client.from("user_bans").delete().eq("id", id).then(handleResponse);
}; 