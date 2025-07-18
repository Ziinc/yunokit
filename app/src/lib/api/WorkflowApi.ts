import { supabase } from "../supabase";
import type { Database } from "../../database.types";

export type WorkflowRow = Database['yunoflow']['Tables']['workflows']['Row'];
export type WorkflowInsert = Database['yunoflow']['Tables']['workflows']['Insert'];
export type WorkflowUpdate = Database['yunoflow']['Tables']['workflows']['Update'];

export const listWorkflows = async (workspaceId?: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId?.toString() || '',
  });

  return await supabase.functions.invoke<WorkflowRow[]>(
    `proxy/workflows?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getWorkflow = async (id: string, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<WorkflowRow>(
    `proxy/workflows/${id}?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const createWorkflow = async (
  workflow: WorkflowInsert,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<WorkflowRow>(
    `proxy/workflows?${qp.toString()}`,
    {
      method: "POST",
      body: workflow,
    }
  );
};

export const updateWorkflow = async (
  id: string,
  workflow: WorkflowUpdate,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<WorkflowRow>(
    `proxy/workflows/${id}?${qp.toString()}`,
    {
      method: "PUT",
      body: workflow,
    }
  );
};

export const deleteWorkflow = async (
  id: string,
  workspaceId: number
): Promise<void> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  await supabase.functions.invoke(
    `proxy/workflows/${id}?${qp.toString()}`,
    {
      method: "DELETE",
    }
  );
};

export const queueWorkflow = async (
  id: string,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke(
    `proxy/workflows/${id}/queue?${qp.toString()}`,
    {
      method: "POST",
    }
  );
};
