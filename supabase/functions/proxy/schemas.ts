// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listSchemas = async (
  client: SupabaseClient,
  options: {
    limit: number;
    offset: number;
    orderBy: "created_at" | "updated_at";
    orderDirection: "asc" | "desc";
  }
) => {
  let query = client.from("schemas");

  // Apply sorting
  query = query.order(options.orderBy, { ascending: options.orderDirection === "asc" });

  // Apply pagination
  query = query.range(options.offset, options.offset + options.limit - 1);

  return await query.select("*");
};

export const getSchema = async (
  client: SupabaseClient,
  schemaId: string
) => {
  return await client
    .from("schemas")
    .select("*")
    .eq("id", schemaId)
    .single();
};

export const createSchema = async (
  client: SupabaseClient,
  schema: TablesInsert<{ schema: "yunocontent" }, "schemas">
) => {
  return await client
    .from("schemas")
    .insert(schema)
    .select()
    .single();
};

export const updateSchema = async (
  client: SupabaseClient,
  schemaId: string,
  schema: TablesUpdate<{ schema: "yunocontent" }, "schemas">
) => {
  return await client
    .from("schemas")
    .update(schema)
    .eq("id", schemaId)
    .select()
    .single();
};

export const deleteSchema = async (
  client: SupabaseClient,
  schemaId: string
) => {
  return await client.from("schemas").delete().eq("id", schemaId);
}; 