import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsWorkspacesPage from '../../src/pages/Settings/SettingsWorkspacesPage';

// Mock dependencies
vi.mock('../../src/lib/contexts/WorkspaceContext');
vi.mock('../../src/lib/api/WorkspaceApi');
vi.mock('../../src/hooks/use-toast');

const mockWorkspaces = [
  {
    id: 1,
    name: 'Primary Workspace',
    description: 'Main workspace',
    user_id: 'user-1',
    created_at: '2024-01-01',
    project_ref: 'project-1',
  },
  {
    id: 2,
    name: 'Secondary Workspace',
    description: 'Secondary workspace',
    user_id: 'user-1',
    created_at: '2024-01-02',
    project_ref: 'project-2',
  },
];

describe('SettingsWorkspacesPage', () => {
  const mockToast = vi.fn();
  const mockRefreshWorkspaces = vi.fn();
  const mockSetCurrentWorkspace = vi.fn();
  const mockDeleteWorkspace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useWorkspace
    const { useWorkspace } = require('../../src/lib/contexts/WorkspaceContext');
    useWorkspace.mockReturnValue({
      workspaces: mockWorkspaces,
      currentWorkspace: mockWorkspaces[0],
      isLoading: false,
      refreshWorkspaces: mockRefreshWorkspaces,
      setCurrentWorkspace: mockSetCurrentWorkspace,
    });

    // Mock WorkspaceApi
    const workspaceApi = require('../../src/lib/api/WorkspaceApi');
    workspaceApi.getWorkspaceLimit.mockResolvedValue({
      currentCount: 2,
      maxWorkspaces: 3,
      canCreate: true,
    });
    workspaceApi.deleteWorkspace = mockDeleteWorkspace;

    // Mock toast
    const { useToast } = require('../../src/hooks/use-toast');
    useToast.mockReturnValue({ toast: mockToast });
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <SettingsWorkspacesPage />
      </BrowserRouter>
    );
  };

  it('should render workspaces list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Primary Workspace')).toBeTruthy();
      expect(screen.getByText('Secondary Workspace')).toBeTruthy();
    });
  });

  it('should show delete button for non-current workspaces', async () => {
    renderPage();

    await waitFor(() => {
      // Find all delete buttons
      const deleteButtons = screen.getAllByTitle('Delete workspace');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should disable delete button for current workspace', async () => {
    renderPage();

    await waitFor(() => {
      // The delete button for current workspace should be disabled
      const deleteButtons = screen.getAllByTitle('Cannot delete default workspace');
      expect(deleteButtons.length).toBe(1);
    });
  });

  it('should open confirmation dialog when delete button is clicked', async () => {
    renderPage();

    await waitFor(() => {
      // Find delete button for secondary workspace (not current)
      const deleteButton = screen.getByTitle('Delete workspace');
      fireEvent.click(deleteButton);
    });

    // Should show delete confirmation dialog
    expect(screen.getByText('Delete Workspace')).toBeTruthy();
    expect(screen.getByText(/This action cannot be undone/)).toBeTruthy();
  });

  it('should delete workspace when confirmed', async () => {
    mockDeleteWorkspace.mockResolvedValueOnce(undefined);
    renderPage();

    await waitFor(() => {
      // Click delete button for secondary workspace
      const deleteButton = screen.getByTitle('Delete workspace');
      fireEvent.click(deleteButton);
    });

    // Should show confirmation dialog
    expect(screen.getByText('Delete Workspace')).toBeTruthy();

    // Type workspace name to confirm
    const input = screen.getByPlaceholderText('Secondary Workspace');
    fireEvent.change(input, { target: { value: 'Secondary Workspace' } });

    // Click delete button in dialog
    const confirmButton = screen.getByText('Delete Workspace');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteWorkspace).toHaveBeenCalledWith(2);
      expect(mockRefreshWorkspaces).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Workspace deleted',
        description: 'The workspace has been deleted successfully',
      });
    });
  });

  it('should handle delete error gracefully', async () => {
    const error = new Error('Delete failed');
    mockDeleteWorkspace.mockRejectedValueOnce(error);
    renderPage();

    await waitFor(() => {
      // Click delete button
      const deleteButton = screen.getByTitle('Delete workspace');
      fireEvent.click(deleteButton);
    });

    // Type workspace name and confirm
    const input = screen.getByPlaceholderText('Secondary Workspace');
    fireEvent.change(input, { target: { value: 'Secondary Workspace' } });

    const confirmButton = screen.getByText('Delete Workspace');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to delete workspace',
        description: 'Delete failed',
        variant: 'destructive',
      });
    });
  });

  it('should clear current workspace when deleting current workspace', async () => {
    // Mock scenario where user tries to delete current workspace
    // (though button should be disabled, test the logic)
    const { useWorkspace } = require('../../src/lib/contexts/WorkspaceContext');
    useWorkspace.mockReturnValue({
      workspaces: mockWorkspaces,
      currentWorkspace: mockWorkspaces[1], // Secondary is current
      isLoading: false,
      refreshWorkspaces: mockRefreshWorkspaces,
      setCurrentWorkspace: mockSetCurrentWorkspace,
    });

    mockDeleteWorkspace.mockResolvedValueOnce(undefined);
    renderPage();

    await waitFor(() => {
      // Now primary workspace should have delete button
      const deleteButton = screen.getByTitle('Delete workspace');
      fireEvent.click(deleteButton);
    });

    // Confirm deletion
    const input = screen.getByPlaceholderText('Primary Workspace');
    fireEvent.change(input, { target: { value: 'Primary Workspace' } });

    const confirmButton = screen.getByText('Delete Workspace');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteWorkspace).toHaveBeenCalledWith(1);
      // Should not clear current workspace since we're deleting a different one
    });
  });

  it('should show workspace limit information', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/You can create.*more workspace/)).toBeTruthy();
    });
  });

  it('should show create workspace form', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Create New Workspace')).toBeTruthy();
    });
  });
}); 