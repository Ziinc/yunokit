import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

type ForumRow = Database["yunocommunity"]["Tables"]["forums"]["Row"];

const base = "proxy/community/forums";

export const listForums = async (workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  return await supabase.functions.invoke<ForumRow[]>(`${base}?${qp.toString()}`, { method: "GET" });
};

export const getForumById = async (id: number, workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}?${qp.toString()}`, { method: "GET" });
};

export const createForum = async (forum: Partial<ForumRow>, workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  return await supabase.functions.invoke<ForumRow>(`${base}?${qp.toString()}`, { method: "POST", body: forum });
};

export const updateForum = async (id: number, forum: Partial<ForumRow>, workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}?${qp.toString()}`, { method: "PUT", body: forum });
};

export const deleteForum = async (id: number, workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  await supabase.functions.invoke(`${base}/${id}?${qp.toString()}`, { method: "DELETE" });
};

export const archiveForum = async (id: number, workspaceId: number) => {
  const qp = new URLSearchParams();
  qp.set("workspaceId", String(workspaceId));
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}/archive?${qp.toString()}`, { method: "POST" });
};
