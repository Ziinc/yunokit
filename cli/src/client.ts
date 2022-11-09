import { GenericSchema } from "@supabase/postgrest-js/dist/module/types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { API_URL, SERVICE_ROLE_KEY } from "./constants";
import { Database } from "./database.types";
export const createClient = () =>
  createSupabaseClient<Database, "supacontent">(API_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "supacontent" },
  });
