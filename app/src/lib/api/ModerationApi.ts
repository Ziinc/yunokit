import { supabase } from "../supabase";
import type { Database } from "../../database.types";

type BanRow = Database["yunocommunity"]["Tables"]["user_bans"]["Row"];

export const listBans = async () => {
  return await supabase.functions.invoke<BanRow[]>("community/bans", { method: "GET" });
};

export const banUser = async (ban: Partial<BanRow>) => {
  return await supabase.functions.invoke<BanRow>("community/bans", { method: "POST", body: ban });
};

export const updateBan = async (id: number, ban: Partial<BanRow>) => {
  return await supabase.functions.invoke<BanRow>(`community/bans/${id}`, { method: "PUT", body: ban });
};

export const unbanUser = async (id: number) => {
  await supabase.functions.invoke(`community/bans/${id}`, { method: "DELETE" });
};
