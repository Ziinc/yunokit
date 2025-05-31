import { supabase } from "../supabase";
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from "../../../database.types";
import { getUser } from "./auth";

type DbClient = SupabaseClient<Database>;
export type WorkspaceRow = Omit<Database['public']['Tables']['workspaces']['Row'], 'members'>;
type WorkspaceInsert = Omit<Database['public']['Tables']['workspaces']['Insert'], 'members'>;
type WorkspaceUpdate = Omit<Database['public']['Tables']['workspaces']['Update'], 'members'>;

const WORKSPACE_LIMITS = {
  free: 1,
  pro: 2, // Pro plan includes 2 workspaces
  enterprise: 10
};

export const getWorkspaces = async (): Promise<WorkspaceRow[]> => {
  const { data, error } = await (supabase as DbClient)
    .from('workspaces')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getWorkspaceById = async (id: number): Promise<WorkspaceRow | null> => {
  const { data, error } = await (supabase as DbClient)
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getCurrentUserPlan = async (): Promise<'free' | 'pro' | 'enterprise'> => {
  // During alpha phase, everyone gets Pro plan at no cost
  return 'pro';
};

export const getWorkspaceLimit = async (): Promise<{ 
  currentCount: number; 
  includedWorkspaces: number; 
  additionalWorkspaces: number;
  planName: string;
  isAlphaPhase: boolean;
}> => {
  const workspaces = await getWorkspaces();
  const currentPlan = await getCurrentUserPlan();
  const includedWorkspaces = WORKSPACE_LIMITS[currentPlan];
  const currentCount = workspaces.length;
  const additionalWorkspaces = Math.max(0, currentCount - includedWorkspaces);
  
  return {
    currentCount,
    includedWorkspaces,
    additionalWorkspaces,
    planName: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
    isAlphaPhase: true // During alpha phase
  };
};

export const createWorkspace = async (workspace: Omit<WorkspaceInsert, 'id' | 'created_at' | 'user_id'>): Promise<WorkspaceRow> => {
  const user = await getUser();
  const newWorkspace: WorkspaceInsert = {
    name: workspace.name || 'Untitled Workspace',
    // created_at: new Date().toISOString(),
    user_id: user.data.user?.id,
    description: workspace.description || null,
    project_ref: workspace.project_ref
  };

  const { data, error } = await (supabase as DbClient)
    .from('workspaces')
    .insert(newWorkspace)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWorkspace = async (id: number, workspace: Partial<WorkspaceUpdate>): Promise<WorkspaceRow> => {
  const { data, error } = await (supabase as DbClient)
    .from('workspaces')
    .update(workspace)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWorkspace = async (id: number): Promise<void> => {
  const { error } = await (supabase as DbClient)
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
}; 