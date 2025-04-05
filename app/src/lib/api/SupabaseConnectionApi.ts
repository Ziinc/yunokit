import { simulateNetworkDelay } from "@/lib/utils";

export interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  isConnected: boolean;
  connectionUrl?: string;
  connectionKey?: string;
}

const STORAGE_KEY = 'supacontent-supabase-connection';

export class SupabaseConnectionApi {
  static async initializeStorage(): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      await this.saveConnection(null);
    }
  }

  static async getCurrentConnection(): Promise<SupabaseProject | null> {
    await simulateNetworkDelay(200, 600);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  }

  static async saveConnection(project: SupabaseProject | null): Promise<void> {
    await simulateNetworkDelay();
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  static async disconnectProject(): Promise<void> {
    await simulateNetworkDelay();
    localStorage.removeItem(STORAGE_KEY);
  }

  // Mock OAuth2 flow
  static async initiateOAuth(): Promise<{ url: string; state: string }> {
    await simulateNetworkDelay(200, 400);
    const state = Math.random().toString(36).substring(7);
    const mockUrl = `https://supabase.com/oauth/authorize?state=${state}&client_id=mock&redirect_uri=http://localhost:3000/settings`;
    return { url: mockUrl, state };
  }

  static async handleOAuthCallback(params: URLSearchParams): Promise<SupabaseProject> {
    await simulateNetworkDelay(800, 1200);
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
    await simulateNetworkDelay(300, 800);
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