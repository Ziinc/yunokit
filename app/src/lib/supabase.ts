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

export type SupabaseProject = {
  id: string;
  organization_id: string;
  name: string;
  region: string;
  status: string;
  database: {
    host: string;
    version: string;
    postgres_engine: string;
    release_channel: string;
  };
  created_at: string;
};

export const listProjects = async (): Promise<SupabaseProject[]> => {
  const response = await supabase.rpc("sb_mgmt_api", {
    endpoint: "projects",
  });
  console.log("response", response);
  if (response.error) {
    throw new Error(response.error.message);
  } else if (response.data?.error) {
    throw new Error(response.data.error as string);
  }
  return response.data.result as SupabaseProject[];
};

export const getProjectDetails = async (): Promise<void> => {
  throw new Error("not implemented ");
};