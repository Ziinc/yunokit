// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listPosts = async (client: SupabaseClient) => {
  return await client.from("posts").select().then(handleResponse);
};

export const getPost = async (client: SupabaseClient, id: number) => {
  return await client.from("posts").select().eq("id", id).single().then(handleResponse);
};

export const createPost = async (
  client: SupabaseClient,
  post: TablesInsert<{ schema: "yunocommunity" }, "posts">
) => {
  return await client.from("posts").insert(post).select().single().then(handleResponse);
};

export const updatePost = async (
  client: SupabaseClient,
  id: number,
  post: TablesUpdate<{ schema: "yunocommunity" }, "posts">
) => {
  return await client.from("posts").update(post).eq("id", id).select().single().then(handleResponse);
};

export const deletePost = async (client: SupabaseClient, id: number) => {
  return await client.from("posts").delete().eq("id", id).then(handleResponse);
}; 