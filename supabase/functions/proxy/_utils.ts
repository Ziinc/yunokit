import { createClient, PostgrestResponse } from "npm:@supabase/supabase-js@2.39.3";
import type { Database } from "../_shared/database.types.ts";

export const dataSbClient = (url: string, apiKey: string) =>
  createClient<Database>(url, apiKey, {
    db: {
      schema: "yunocontent",
    },
  });

export const handleResponse =  (res : PostgrestResponse<unknown>) => {
  if (res.error){
    console.error(`${res.error.code}: ${res.error.message} - ${res.error.details} - ${res.error.hint}`);
    throw `${res.error.code}: ${res.error.message}`;
  }
  return res.data;
};