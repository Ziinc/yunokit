export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  email: string;
  name: string;
}

export interface WorkspaceLimit {
  currentCount: number;
  maxWorkspaces: number;
  canCreate: boolean;
} 