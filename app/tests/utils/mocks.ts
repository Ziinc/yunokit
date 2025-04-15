import { mockWorkspaces } from '../../src/lib/mocks/workspaces';
import { vi } from 'vitest';

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