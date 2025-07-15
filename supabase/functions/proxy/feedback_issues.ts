// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listIssues = async (client: SupabaseClient, boardId?: string) => {
  let query = client.from("issues").select();
  if (boardId) {
    query = query.eq("board_id", boardId);
  }
  return await query.then(handleResponse);
};

export const createIssue = async (
  client: SupabaseClient,
  issue: TablesInsert<{ schema: "yunofeedback" }, "issues">
) => {
  return await client.from("issues").insert(issue).select().single().then(handleResponse);
};

export const updateIssue = async (
  client: SupabaseClient,
  id: string,
  issue: TablesUpdate<{ schema: "yunofeedback" }, "issues">
) => {
  return await client.from("issues").update(issue).eq("id", id).select().single().then(handleResponse);
};

export const deleteIssue = async (client: SupabaseClient, id: string) => {
  return await client.from("issues").delete().eq("id", id).then(handleResponse);
};
