import { simulateNetworkDelay } from "@/lib/utils";

export interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  isConnected: boolean;
  connectionUrl?: string;
  connectionKey?: string;
}

// In-memory storage
let currentProject: SupabaseProject | null = null;

export class SupabaseConnectionApi {
  static async initializeStorage(): Promise<void> {
    if (!currentProject) {
      await this.saveConnection(null);
    }
  }

  static async getCurrentConnection(): Promise<SupabaseProject | null> {
    return currentProject;
  }

  static async saveConnection(project: SupabaseProject | null): Promise<void> {
    currentProject = project;
  }

  static async disconnectProject(): Promise<void> {
    currentProject = null;
  }

  // Mock OAuth2 flow
  static async initiateOAuth(): Promise<{ url: string; state: string }> {
    const state = Math.random().toString(36).substring(7);
    const mockUrl = `https://supabase.com/oauth/authorize?state=${state}&client_id=mock&redirect_uri=http://localhost:3000/settings`;
    return { url: mockUrl, state };
  }

  static async handleOAuthCallback(params: URLSearchParams): Promise<SupabaseProject> {
    const state = params.get('state');
    const code = params.get('code');

    if (!state || !code) {
      throw new Error('Invalid OAuth callback parameters');
    }

    // Mock successful connection
    const project: SupabaseProject = {
      id: crypto.randomUUID(),
      name: "My Supabase Project",
      region: "us-east-1",
      isConnected: true,
      connectionUrl: "https://xxxxx.supabase.co",
      connectionKey: "mock-key-xxxxx"
    };

    await this.saveConnection(project);
    return project;
  }

  // Mock available projects (only used in OAuth flow)
  static async getAvailableProjects(): Promise<SupabaseProject[]> {
    return [
      {
        id: crypto.randomUUID(),
        name: "My Project",
        region: "us-east-1",
        isConnected: false
      },
      {
        id: crypto.randomUUID(),
        name: "Team Project",
        region: "eu-west-1",
        isConnected: false
      },
      {
        id: crypto.randomUUID(),
        name: "Development",
        region: "ap-southeast-1",
        isConnected: false
      }
    ];
  }
} 