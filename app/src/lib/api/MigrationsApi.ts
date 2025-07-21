import { migrations } from "@/data";
import { supabase } from "@/lib/supabase";

export interface Migration {
  version: string;
  name: string;
  description?: string;
  sql: string;
  filename: string;
  status: "applied" | "pending" | "failed";
  applied_at?: string;
}

export interface MigrationResult {
  version: string;
  success: boolean;
  error?: string;
}


export const listMigrations = async (workspaceId: number, schema: "yunocontent" | "yunocommunity") => {
  const { data } = await supabase.functions.invoke<{ versions: string[] }>("migrations/" + schema + "?workspaceId=" + workspaceId, {
    method: "GET",
  })
  const pendingVersions = data?.versions || [];
  const allMigrations = migrations.map(m => ({
    ...m,
    status: pendingVersions.includes(m.version) ? "pending" : "applied"
  }))
  return allMigrations as Migration[];
};

export async function runAllMigrations(workspaceId: number) {
  return await supabase.functions.invoke<{result: "success"}>("migrations?workspaceId=" + workspaceId, {
    method: "POST",
  })
}