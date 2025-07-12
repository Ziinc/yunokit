// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

import { handleResponse } from "./_utils.ts";
type SupabaseClient = ReturnType<typeof createClient>;

export const listSchemas = async (
  client: SupabaseClient,
) => {
  let query = client.from("schemas").select("*");

  return await query.then(handleResponse);
};

export const getSchema = async (client: SupabaseClient, schemaId: number) => {
  return await client
    .from("schemas")
    .select("*")
    .eq("id", schemaId)
    .single()
    .then(handleResponse);
};

export const createSchema = async (
  client: SupabaseClient,
  schema: TablesInsert<{ schema: "yunocontent" }, "schemas">
) => {
  return await client
    .from("schemas")
    .insert(schema)
    .select()
    .single()
    .then(handleResponse);
};

export const updateSchema = async (
  client: SupabaseClient,
  schemaId: number,
  schema: TablesUpdate<{ schema: "yunocontent" }, "schemas">
) => {
  console.log("schema", schemaId, schema);
  return await client
    .from("schemas")
    .update(schema)
    .eq("id", schemaId)
    .select()
    .single()
    .then(handleResponse);
};

export const deleteSchema = async (
  client: SupabaseClient,
  schemaId: number
) => {
  return await client
    .from("schemas")
    .delete()
    .eq("id", schemaId)
    .then(handleResponse);
};
