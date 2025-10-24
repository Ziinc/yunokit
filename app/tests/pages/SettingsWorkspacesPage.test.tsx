import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../utils/test-utils';
import SettingsWorkspacesPage from '@/pages/Settings/SettingsWorkspacesPage';
import { Tabs } from '@/components/ui/tabs';
import * as WorkspaceContext from '@/lib/contexts/WorkspaceContext';
import * as WorkspaceApi from '@/lib/api/WorkspaceApi';
import * as ToastHook from '@/hooks/use-toast';

const mockWorkspaces = [
  {
    id: 1,
    name: 'Primary Workspace',
    description: 'Main workspace',
    user_id: 'user-1',
    created_at: '2024-01-01',
    project_ref: 'project-1',
    api_key: 'test-api-key-1',
  },
  {
    id: 2,
    name: 'Secondary Workspace',
    description: 'Secondary workspace',
    user_id: 'user-1',
    created_at: '2024-01-02',
    project_ref: 'project-2',
    api_key: 'test-api-key-2',
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
    (WorkspaceContext.useWorkspace as unknown as Mock).mockReturnValue({
      workspaces: mockWorkspaces,
      currentWorkspace: mockWorkspaces[0],
      isLoading: false,
      error: null,
      refreshWorkspaces: mockRefreshWorkspaces,
      setCurrentWorkspace: mockSetCurrentWorkspace,
      mutate: vi.fn(),
    });

    // Mock WorkspaceApi
    (WorkspaceApi.getWorkspaceLimit as unknown as Mock).mockResolvedValue({
      currentCount: 2,
      includedWorkspaces: 2,
      additionalWorkspaces: 0,
      planName: 'Pro',
      isAlphaPhase: true,
    });
    (WorkspaceApi.deleteWorkspace as unknown as Mock).mockImplementation(mockDeleteWorkspace);

    // Mock toast
    vi.spyOn(ToastHook, 'useToast').mockReturnValue({ toast: mockToast, dismiss: vi.fn(), toasts: [] } as any);
  });

  const renderPage = () => render(
    <Tabs value="workspaces">
      <SettingsWorkspacesPage />
    </Tabs>
  );

  it('should render workspaces list', async () => {
    renderPage();

    await screen.findByText('Primary Workspace');
    await screen.findByText('Secondary Workspace');
  });

  it('should show delete button for all workspaces', async () => {
    renderPage();

    // Find all delete buttons - should be one for each workspace
    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete Workspace' });
    expect(deleteButtons.length).toBe(mockWorkspaces.length);
  });

  it('should open confirmation dialog when delete button is clicked', async () => {
    renderPage();

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(deleteButtons[0]);

    await screen.findByText(/This action cannot be undone/);
    await screen.findByRole('dialog');
  });

  it('should delete workspace when confirmed', async () => {
    mockDeleteWorkspace.mockResolvedValueOnce(undefined);
    renderPage();

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(deleteButtons[0]);

    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByPlaceholderText('delete');
    fireEvent.change(input, { target: { value: 'delete' } });

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(confirmButton);

    await screen.findByText('Workspaces');
    expect(mockDeleteWorkspace).toHaveBeenCalledWith(1);
    expect(mockRefreshWorkspaces).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Workspace deleted',
      description: 'The workspace has been deleted successfully',
    });
  });

  it('should handle delete error gracefully', async () => {
    const error = new Error('Delete failed');
    mockDeleteWorkspace.mockRejectedValueOnce(error);
    renderPage();

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(deleteButtons[0]);

    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByPlaceholderText('delete');
    fireEvent.change(input, { target: { value: 'delete' } });

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(confirmButton);

    await screen.findByText('Workspaces');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Failed to delete workspace',
      description: 'Delete failed',
      variant: 'destructive',
    });
  });

  it('should clear current workspace when deleting current workspace', async () => {
    mockDeleteWorkspace.mockResolvedValueOnce(undefined);
    renderPage();

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(deleteButtons[0]);

    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByPlaceholderText('delete');
    fireEvent.change(input, { target: { value: 'delete' } });

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete Workspace' });
    fireEvent.click(confirmButton);

    await screen.findByText('Workspaces');
    expect(mockDeleteWorkspace).toHaveBeenCalledWith(1);
    expect(mockSetCurrentWorkspace).toHaveBeenCalledWith(null);
  });

  it('should show workspace limit information', async () => {
    renderPage();

    await screen.findByText(/You have 2 workspaces on your Pro plan/);
    await screen.findByText(/Alpha - No Cost/);
  });

  it('should show create workspace form', async () => {
    renderPage();

    const openButton = await screen.findByRole('button', { name: 'Create Workspace' });
    fireEvent.click(openButton);

    await screen.findByText('Create New Workspace');
  });
});
