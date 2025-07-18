import { supabase } from "../supabase";
import type { Database } from "../../database.types";

type ForumRow = Database["yunocommunity"]["Tables"]["forums"]["Row"];

export const listForums = async () => {
  return await supabase.functions.invoke<ForumRow[]>("community/forums", { method: "GET" });
};

export const getForumById = async (id: number) => {
  return await supabase.functions.invoke<ForumRow>(`community/forums/${id}`, { method: "GET" });
};

export const createForum = async (forum: Partial<ForumRow>) => {
  return await supabase.functions.invoke<ForumRow>("community/forums", { method: "POST", body: forum });
};

export const updateForum = async (id: number, forum: Partial<ForumRow>) => {
  return await supabase.functions.invoke<ForumRow>(`community/forums/${id}`, { method: "PUT", body: forum });
};

export const deleteForum = async (id: number) => {
  await supabase.functions.invoke(`community/forums/${id}`, { method: "DELETE" });
};
