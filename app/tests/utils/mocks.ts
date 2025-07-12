import { vi } from 'vitest';

// Mock workspace data for tests
const mockWorkspaces = [
  {
    id: "primary",
    name: "Primary Workspace",
    description: "Main workspace for your content",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    userId: "user-1",
    members: [
      {
        id: "member-1",
        userId: "user-1",
        role: "owner",
        email: "owner@example.com",
        name: "John Owner"
      }
    ]
  }
];

export const mockWorkspaceApi = {
  getWorkspaces: vi.fn().mockResolvedValue(mockWorkspaces),
  getWorkspaceById: vi.fn().mockResolvedValue(mockWorkspaces[0]),
  getCurrentUserPlan: vi.fn().mockResolvedValue('pro'),
  getWorkspaceLimit: vi.fn().mockResolvedValue({ limit: 3, current: 1 }),
  createWorkspace: vi.fn().mockResolvedValue(mockWorkspaces[0]),
  updateWorkspace: vi.fn().mockResolvedValue(mockWorkspaces[0]),
  deleteWorkspace: vi.fn().mockResolvedValue(undefined),
  initializeStorage: vi.fn().mockResolvedValue(undefined),
};

export const mockWorkspaceContext = {
  workspaces: mockWorkspaces,
  currentWorkspace: mockWorkspaces[0],
  isLoading: false,
  setCurrentWorkspace: vi.fn(),
  refreshWorkspaces: vi.fn(),
}; 