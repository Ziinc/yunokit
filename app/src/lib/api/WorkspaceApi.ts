import { Workspace, WorkspaceLimit } from "../workspaceSchema";
import { mockWorkspaces } from "../mocks/workspaces";

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

/**
 * WorkspaceApi - Provides methods for managing workspaces
 * Currently uses localStorage for persistence, but can be extended to use real APIs
 */
export class WorkspaceApi {
  // Initialize storage with example workspaces if empty
  static async initializeStorage(): Promise<void> {
    const storedWorkspaces = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!storedWorkspaces) {
      await this.saveWorkspaces(mockWorkspaces);
    }
  }

  static async getWorkspaces(): Promise<Workspace[]> {
    await simulateNetworkDelay(200, 600);
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
    await simulateNetworkDelay(100, 300);
    
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
    await simulateNetworkDelay();
    
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
    await simulateNetworkDelay();
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
    await simulateNetworkDelay();
    const workspaces = await this.getWorkspaces();
    const filteredWorkspaces = workspaces.filter(w => w.id !== id);
    await this.saveWorkspaces(filteredWorkspaces);
  }

  private static async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaces));
  }
} 