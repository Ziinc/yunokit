import React from 'react';
import { vi } from 'vitest';

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="workspace-provider">{children}</div>
);


export const useWorkspace = vi.fn().mockReturnValue({
  currentWorkspace: { id: 1, name: 'Test Workspace' },
  workspaces: [{ id: 1, name: 'Test Workspace' }],
  isLoading: false,
  setCurrentWorkspace: vi.fn(),
  refreshWorkspaces: vi.fn()
});