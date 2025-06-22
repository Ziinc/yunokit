import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import type { Database } from "../_shared/database.types.ts";

export const dataSbClient = (url: string, apiKey: string) =>
  createClient<Database>(url, apiKey, {
    db: {
      schema: "yunocontent",
    },
  });
