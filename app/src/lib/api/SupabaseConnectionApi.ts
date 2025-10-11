interface SupabaseProject {
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

  // OAuth2 flow - implement actual OAuth when needed
  static async initiateOAuth(): Promise<{ url: string; state: string }> {
    throw new Error('OAuth flow not implemented - connect directly with project credentials');
  }

  static async handleOAuthCallback(): Promise<SupabaseProject> {
    throw new Error('OAuth callback not implemented - connect directly with project credentials');
  }

  // Available projects - implement actual API call when needed
  static async getAvailableProjects(): Promise<SupabaseProject[]> {
    throw new Error('Project listing not implemented - connect directly with project credentials');
  }
} 
