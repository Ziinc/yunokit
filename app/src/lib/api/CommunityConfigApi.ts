import { supabase } from "../supabase";
import type { Database } from "../../database.types";

type ConfigRow = Database["yunocommunity"]["Tables"]["config"]["Row"];

export const getConfig = async () => {
  return await supabase.functions.invoke<ConfigRow[]>("proxy/community/config", { method: "GET" });
};

export const updateConfig = async (config: Partial<ConfigRow>) => {
  return await supabase.functions.invoke<ConfigRow>("proxy/community/config", { method: "PUT", body: config });
};
