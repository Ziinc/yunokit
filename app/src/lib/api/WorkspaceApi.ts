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
  pro: 3,
  enterprise: 10
};

export class WorkspaceApi {
  static async getWorkspaces(): Promise<WorkspaceRow[]> {
    const { data, error } = await (supabase as DbClient)
      .from('workspaces')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getWorkspaceById(id: number): Promise<WorkspaceRow | null> {
    const { data, error } = await (supabase as DbClient)
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCurrentUserPlan(): Promise<'free' | 'pro'> {
    // TODO: Replace with actual API call to get user's plan
    return 'pro';
  }

  static async getWorkspaceLimit(): Promise<{ currentCount: number; maxWorkspaces: number; canCreate: boolean }> {
    const workspaces = await this.getWorkspaces();
    const currentPlan = await this.getCurrentUserPlan();
    const maxWorkspaces = WORKSPACE_LIMITS[currentPlan];
    
    return {
      currentCount: workspaces.length,
      maxWorkspaces,
      canCreate: workspaces.length < maxWorkspaces
    };
  }

  static async createWorkspace(workspace: Omit<WorkspaceInsert, 'id' | 'created_at'>): Promise<WorkspaceRow> {
    // const limit = await this.getWorkspaceLimit();
    // if (!limit.canCreate) {
    //   throw new Error(`Workspace limit reached. Maximum allowed: ${limit.maxWorkspaces}`);
    // }

    const user = await getUser();
    console.log('user', user);
    const newWorkspace: WorkspaceInsert = {
      name: workspace.name || 'Untitled Workspace',
      created_at: new Date().toISOString(),
      user_id: user?.id,
      description: workspace.description || null
    };

    const { data, error } = await (supabase as DbClient)
      .from('workspaces')
      .insert(newWorkspace)
      .select()
      .single();

    console.log('data', data);
    if (error) throw error;
    return data;
  }

  static async updateWorkspace(id: number, workspace: Partial<WorkspaceUpdate>): Promise<WorkspaceRow> {
    const { data, error } = await (supabase as DbClient)
      .from('workspaces')
      .update(workspace)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteWorkspace(id: number): Promise<void> {
    const { error } = await (supabase as DbClient)
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 