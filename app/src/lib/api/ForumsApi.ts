import { supabase } from "../supabase";
import type { Database } from "../../database.types";

type ForumRow = Database["yunocommunity"]["Tables"]["forums"]["Row"];

const base = "proxy/community/forums";

export const listForums = async () => {
  return await supabase.functions.invoke<ForumRow[]>(base, { method: "GET" });
};

export const getForumById = async (id: number) => {
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}`, { method: "GET" });
};

export const createForum = async (forum: Partial<ForumRow>) => {
  return await supabase.functions.invoke<ForumRow>(base, { method: "POST", body: forum });
};

export const updateForum = async (id: number, forum: Partial<ForumRow>) => {
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}`, { method: "PUT", body: forum });
};

export const deleteForum = async (id: number) => {
  await supabase.functions.invoke(`${base}/${id}`, { method: "DELETE" });
};

export const archiveForum = async (id: number) => {
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}/archive`, { method: "POST" });
};
