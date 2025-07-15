// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listBoards = async (client: SupabaseClient) => {
  return await client.from("boards").select().then(handleResponse);
};

export const getBoard = async (client: SupabaseClient, id: string) => {
  return await client.from("boards").select().eq("id", id).single().then(handleResponse);
};

export const createBoard = async (
  client: SupabaseClient,
  board: TablesInsert<{ schema: "yunofeedback" }, "boards">
) => {
  return await client.from("boards").insert(board).select().single().then(handleResponse);
};

export const updateBoard = async (
  client: SupabaseClient,
  id: string,
  board: TablesUpdate<{ schema: "yunofeedback" }, "boards">
) => {
  return await client.from("boards").update(board).eq("id", id).select().single().then(handleResponse);
};

export const deleteBoard = async (client: SupabaseClient, id: string) => {
  return await client.from("boards").delete().eq("id", id).then(handleResponse);
};
