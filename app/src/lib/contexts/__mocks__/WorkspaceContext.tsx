import React from 'react';
import { vi } from 'vitest';
import { mockWorkspaces } from '../../mocks/workspaces';

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="workspace-provider">{children}</div>
);

export const useWorkspace = vi.fn().mockReturnValue({
  workspaces: mockWorkspaces,
  currentWorkspace: mockWorkspaces[0],
  isLoading: false,
  setCurrentWorkspace: vi.fn(),
  refreshWorkspaces: vi.fn(),
}); 