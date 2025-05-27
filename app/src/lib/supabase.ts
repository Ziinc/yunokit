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

export const checkTokenNeedsRefresh = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_token_needs_refresh");
    
    console.log("data", data);
    if (error) {
      console.error("Error checking token refresh needs:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Token check error:", error);
    return false;
  }
};

export const checkSupabaseConnection = async (): Promise<{
  result: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.rpc("check_supabase_connection");
    
    if (error) {
      console.error("Error checking connection:", error);
      return { result: false, error: error.message };
    }
    
    return {
      result: (data as unknown as { result: boolean }).result,
      error: (data as unknown as { error?: string }).error
    };
  } catch (error) {
    console.error("Connection check error:", error);
    return { 
      result: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

export const refreshAccessToken = async (): Promise<{
  success: boolean;
  error?: string;
  expires_at?: number;
}> => {
  try {
    const response = await supabase.functions.invoke("connect/refresh", {
      method: "POST"
    });
    
    if (response.error) {
      console.error("Error refreshing access token:", response.error);
      return { 
        success: false, 
        error: response.error.message || "Failed to refresh token" 
      };
    }
    
    return { 
      success: true,
      expires_at: response.data.expires_at
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export type SupabaseProject = {
  id: string;
  organization_id: string;
  name: string;
  region: string;
  status: "ACTIVE_HEALTHY" | string
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

export const disconnectSupabaseAccount = async (): Promise<void> => {
  // Delete the supabase_connection record for the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from("supabase_connections")
    .delete()
    .eq("user_id", user.id);
    
  if (error) {
    throw new Error(`Failed to disconnect Supabase account: ${error.message}`);
  }
  
  // Remove the connection status from localStorage
  localStorage.removeItem("supabase_connected");
};

export const removeProjectReference = async (workspaceId: number): Promise<void> => {
  // Nullify the project_ref field for the specified workspace
  const { error } = await supabase
    .from("workspaces")
    .update({ project_ref: null })
    .eq("id", workspaceId);
    
  if (error) {
    throw new Error(`Failed to remove project reference: ${error.message}`);
  }
};