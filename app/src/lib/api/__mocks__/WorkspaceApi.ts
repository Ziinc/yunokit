import { vi } from 'vitest';
import { mockWorkspaces } from '../../mocks/workspaces';

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
