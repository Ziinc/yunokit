import { Workspace, WorkspaceLimit, WorkspaceMember } from "../workspaceSchema";
import { mockWorkspaces } from "../mocks/workspaces";
import { supabase } from "../supabase";
import type { Database } from "../supabase";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
type WorkspaceRow = Database['public']['Tables']['workspaces']['Row'];

// Storage keys
const WORKSPACE_STORAGE_KEY = 'supacontent-workspaces';
const WORKSPACE_LIMITS = {
  free: 1,
  pro: 3,
  enterprise: 10
};

// Helper to simulate network delay
const simulateNetworkDelay = async (minMs: number = 300, maxMs: number = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper to convert Supabase workspace to our Workspace type
const convertSupabaseWorkspace = (workspace: WorkspaceRow): Workspace => ({
  id: workspace.id,
  name: workspace.name,
  description: workspace.description,
  createdAt: workspace.created_at,
  updatedAt: workspace.updated_at,
  userId: workspace.user_id,
  members: workspace.members.map(m => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    email: m.email,
    name: m.name
  }))
});

// Helper to convert our workspace member to Supabase format
const convertWorkspaceMembers = (members: WorkspaceMember[]): WorkspaceRow['members'] => 
  members.map(m => ({
    id: m.id,
    user_id: m.userId,
    role: m.role,
    email: m.email,
    name: m.name
  }));

/**
 * WorkspaceApi - Provides methods for managing workspaces
 * Uses Supabase when available, falls back to localStorage
 */
export class WorkspaceApi {
  private static isSupabaseEnabled(): boolean {
    return !!(supabase.auth && supabase?.auth?.getSession && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  }

  // Initialize storage with example workspaces if empty
  static async initializeStorage(): Promise<void> {
    if (this.isSupabaseEnabled()) {
      try {
        const { data, error } = await (supabase as DbClient)
          .from('workspaces')
          .select('*');
        
        if (error) throw error;
        
        if (!data?.length) {
          await (supabase as DbClient).from('workspaces').insert(
            mockWorkspaces.map(w => ({
              id: w.id,
              name: w.name,
              description: w.description,
              created_at: w.createdAt,
              updated_at: w.updatedAt,
              owner_id: w.ownerId,
              members: convertWorkspaceMembers(w.members)
            }))
          );
        }
      } catch (error) {
        console.warn('Failed to initialize Supabase storage, falling back to localStorage:', error);
        await this.initializeLocalStorage();
      }
    } else {
      await this.initializeLocalStorage();
    }
  }

  private static async initializeLocalStorage(): Promise<void> {
    const storedWorkspaces = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!storedWorkspaces) {
      await this.saveWorkspaces(mockWorkspaces);
    }
  }

  static async getWorkspaces(): Promise<Workspace[]> {
    if (this.isSupabaseEnabled()) {
      try {
        const { data, error } = await (supabase as DbClient)
          .from('workspaces')
          .select('*');
        
        if (error) throw error;
        return (data || []).map(convertSupabaseWorkspace);
      } catch (error) {
        console.warn('Failed to fetch from Supabase, falling back to localStorage:', error);
        return this.getLocalWorkspaces();
      }
    }

    return this.getLocalWorkspaces();
  }

  private static async getLocalWorkspaces(): Promise<Workspace[]> {
    const storedWorkspaces = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!storedWorkspaces) return [];
    return JSON.parse(storedWorkspaces);
  }

  static async getWorkspaceById(id: string): Promise<Workspace | null> {
    const workspaces = await this.getWorkspaces();
    return workspaces.find(workspace => workspace.id === id) || null;
  }

  static async getCurrentUserPlan(): Promise<'free' | 'pro' | 'enterprise'> {
    // TODO: Replace with actual API call to get user's plan
    return 'pro';
  }

  static async getWorkspaceLimit(): Promise<WorkspaceLimit> {
    const workspaces = await this.getWorkspaces();
    const currentPlan = await this.getCurrentUserPlan();
    const maxWorkspaces = WORKSPACE_LIMITS[currentPlan];
    
    return {
      currentCount: workspaces.length,
      maxWorkspaces,
      canCreate: workspaces.length < maxWorkspaces
    };
  }

  static async createWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    const limit = await this.getWorkspaceLimit();
    if (!limit.canCreate) {
      throw new Error(`Workspace limit reached. Maximum allowed: ${limit.maxWorkspaces}`);
    }

    const newWorkspace: Workspace = {
      ...workspace,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const workspaces = await this.getWorkspaces();
    workspaces.push(newWorkspace);
    await this.saveWorkspaces(workspaces);

    return newWorkspace;
  }

  static async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    const index = workspaces.findIndex(w => w.id === workspace.id);
    
    if (index === -1) {
      throw new Error('Workspace not found');
    }

    const updatedWorkspace = {
      ...workspace,
      updatedAt: new Date().toISOString()
    };

    workspaces[index] = updatedWorkspace;
    await this.saveWorkspaces(workspaces);

    return updatedWorkspace;
  }

  static async deleteWorkspace(id: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    const filteredWorkspaces = workspaces.filter(w => w.id !== id);
    await this.saveWorkspaces(filteredWorkspaces);
  }

  private static async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaces));
  }
} 