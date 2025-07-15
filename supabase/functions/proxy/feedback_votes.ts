// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const createVote = async (
  client: SupabaseClient,
  vote: TablesInsert<{ schema: "yunofeedback" }, "votes">
) => {
  return await client.from("votes").insert(vote).select().single().then(handleResponse);
};

export const deleteVote = async (client: SupabaseClient, id: string) => {
  return await client.from("votes").delete().eq("id", id).then(handleResponse);
};
