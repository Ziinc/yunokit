import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create a dummy client if credentials are missing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// OAuth utilities
export const initiateOAuthFlow = async (path = "") => {
  const response = await supabase.functions.invoke("connect/oauth2", {
    method: "GET",
    headers: {
      "sc-redirect-uri": window.location.origin + path,
    },
  });
  window.open(response.data.uri, "_blank").focus();
};

export const exchangeCodeForToken = async (
  code: string,
  state: string
): Promise<void> => {
  await supabase.functions.invoke("connect/oauth2/callback", {
    method: "POST",
    headers: {
      "sc-redirect-uri": window.location.origin,
    },
    body: {
      code,
      state,
    },
  });
};

export const checkSupabaseConnection = async (): Promise<boolean> => {
  const response = await supabase.rpc("check_supabase_connection");
  return response.data["result"] as boolean;
};



export const listProjects = async (): Promise<any> => {
  const response = await supabase.rpc("sb_mgmt_api", {
    endpoint: "projects",
  });
  return response.data;
};

export const getProjectDetails = async (): Promise<void> => {
  throw new Error("not implemented ");
};