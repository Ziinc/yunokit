// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listWorkflows = async (client: SupabaseClient) => {
  return await client.from("workflows").select().then(handleResponse);
};

export const getWorkflow = async (client: SupabaseClient, id: string) => {
  return await client
    .from("workflows")
    .select()
    .eq("id", id)
    .single()
    .then(handleResponse);
};

export const createWorkflow = async (
  client: SupabaseClient,
  workflow: TablesInsert<{ schema: "yunoflow" }, "workflows">
) => {
  return await client
    .from("workflows")
    .insert(workflow)
    .select()
    .single()
    .then(handleResponse);
};

export const updateWorkflow = async (
  client: SupabaseClient,
  id: string,
  workflow: TablesUpdate<{ schema: "yunoflow" }, "workflows">
) => {
  return await client
    .from("workflows")
    .update(workflow)
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
};

export const deleteWorkflow = async (client: SupabaseClient, id: string) => {
  return await client
    .from("workflows")
    .delete()
    .eq("id", id)
    .then(handleResponse);
};

export const queueWorkflow = async (client: SupabaseClient, id: string) => {
  return await client
    .from("workflow_runs")
    .insert({ workflow_id: id })
    .select()
    .single()
    .then(handleResponse);
};
