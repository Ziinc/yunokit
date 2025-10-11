import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import { buildApiUrl } from "./utils";

type ForumRow = Database["yunocommunity"]["Tables"]["forums"]["Row"];

const base = "proxy/community/forums";

export const listForums = async (workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow[]>(
    buildApiUrl(base, { workspaceId }),
    { method: "GET" }
  );
};

export const getForumById = async (id: number, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { path: id, workspaceId }),
    { method: "GET" }
  );
};

export const createForum = async (forum: Partial<ForumRow>, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { workspaceId }),
    { method: "POST", body: forum }
  );
};

export const updateForum = async (id: number, forum: Partial<ForumRow>, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { path: id, workspaceId }),
    { method: "PUT", body: forum }
  );
};

export const deleteForum = async (id: number, workspaceId?: number) => {
  await supabase.functions.invoke(
    buildApiUrl(base, { path: id, workspaceId }),
    { method: "DELETE" }
  );
};

export const archiveForum = async (id: number, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { path: [id, "archive"], workspaceId }),
    { method: "POST" }
  );
};

export const unarchiveForum = async (id: number, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { path: [id, "unarchive"], workspaceId }),
    { method: "POST" }
  );
};

export const restoreForum = async (id: number, workspaceId?: number) => {
  return await supabase.functions.invoke<ForumRow>(
    buildApiUrl(base, { path: [id, "restore"], workspaceId }),
    { method: "POST" }
  );
};

export const permanentDeleteForum = async (id: number, workspaceId?: number) => {
  await supabase.functions.invoke(
    buildApiUrl(base, { path: [id, "permanent"], workspaceId }),
    { method: "DELETE" }
  );
};
