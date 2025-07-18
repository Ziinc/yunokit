// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listComments = async (client: SupabaseClient) => {
  return await client.from("comments").select().then(handleResponse);
};

export const getComment = async (client: SupabaseClient, id: number) => {
  return await client.from("comments").select().eq("id", id).single().then(handleResponse);
};

export const createComment = async (
  client: SupabaseClient,
  comment: TablesInsert<{ schema: "yunocommunity" }, "comments">
) => {
  return await client.from("comments").insert(comment).select().single().then(handleResponse);
};

export const updateComment = async (
  client: SupabaseClient,
  id: number,
  comment: TablesUpdate<{ schema: "yunocommunity" }, "comments">
) => {
  return await client.from("comments").update(comment).eq("id", id).select().single().then(handleResponse);
};

export const deleteComment = async (client: SupabaseClient, id: number) => {
  return await client.from("comments").delete().eq("id", id).then(handleResponse);
};
