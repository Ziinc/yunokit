import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

type ForumRow = Database["yunocommunity"]["Tables"]["forums"]["Row"];

const base = "proxy/community/forums";

export const listForums = async (workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow[]>(`${base}?${qp.toString()}`, { method: "GET" });
  }
  return await supabase.functions.invoke<ForumRow[]>(`${base}`, { method: "GET" });
};

export const getForumById = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}/${id}?${qp.toString()}`, { method: "GET" });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}`, { method: "GET" });
};

export const createForum = async (forum: Partial<ForumRow>, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}?${qp.toString()}`, { method: "POST", body: forum });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}`, { method: "POST", body: forum });
};

export const updateForum = async (id: number, forum: Partial<ForumRow>, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}/${id}?${qp.toString()}`, { method: "PUT", body: forum });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}`, { method: "PUT", body: forum });
};

export const deleteForum = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    await supabase.functions.invoke(`${base}/${id}?${qp.toString()}`, { method: "DELETE" });
    return;
  }
  await supabase.functions.invoke(`${base}/${id}`, { method: "DELETE" });
};

export const archiveForum = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}/${id}/archive?${qp.toString()}`, { method: "POST" });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}/archive`, { method: "POST" });
};

export const unarchiveForum = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}/${id}/unarchive?${qp.toString()}`, { method: "POST" });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}/unarchive`, { method: "POST" });
};

export const restoreForum = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    return await supabase.functions.invoke<ForumRow>(`${base}/${id}/restore?${qp.toString()}`, { method: "POST" });
  }
  return await supabase.functions.invoke<ForumRow>(`${base}/${id}/restore`, { method: "POST" });
};

export const permanentDeleteForum = async (id: number, workspaceId?: number) => {
  if (typeof workspaceId === "number") {
    const qp = new URLSearchParams();
    qp.set("workspaceId", String(workspaceId));
    await supabase.functions.invoke(`${base}/${id}/permanent?${qp.toString()}`, { method: "DELETE" });
    return;
  }
  await supabase.functions.invoke(`${base}/${id}/permanent`, { method: "DELETE" });
};
