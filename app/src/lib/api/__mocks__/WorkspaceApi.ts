import { vi } from 'vitest';

// Mock workspace data for tests
const mockWorkspaces = [
  {
    id: 1,
    name: "Primary Workspace",
    description: "Main workspace for your content",
    created_at: "2024-01-01T00:00:00Z",
    user_id: "user-1",
    project_ref: "project-1",
    api_key: "test-api-key-1"
  }
];

export const getWorkspaces = vi.fn().mockResolvedValue(mockWorkspaces);
export const getWorkspaceById = vi.fn().mockResolvedValue(mockWorkspaces[0]);
export const getCurrentUserPlan = vi.fn().mockResolvedValue('pro');
export const getWorkspaceLimit = vi.fn().mockResolvedValue({ 
  currentCount: 1, 
  includedWorkspaces: 2, 
  additionalWorkspaces: 0,
  planName: 'Pro',
  isAlphaPhase: true 
});
export const createWorkspace = vi.fn().mockResolvedValue(mockWorkspaces[0]);
export const updateWorkspace = vi.fn().mockResolvedValue(mockWorkspaces[0]);
export const deleteWorkspace = vi.fn().mockResolvedValue(undefined); 