import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceDeleteDialog } from '../../src/components/Workspace/WorkspaceDeleteDialog';

const mockWorkspace = {
  id: 1,
  name: 'Test Workspace',
  description: 'A test workspace',
  user_id: 'user-1',
  created_at: '2024-01-01',
  project_ref: 'project-1',
};

describe('WorkspaceDeleteDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog when open', () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Delete Workspace')).toBeTruthy();
    expect(screen.getByText(/This action cannot be undone/)).toBeTruthy();
    expect(screen.getByText(/Test Workspace/)).toBeTruthy();
  });

  it('should not render when closed', () => {
    render(
      <WorkspaceDeleteDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('Delete Workspace')).toBeNull();
  });

  it('should not render when workspace is null', () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={null}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('Delete Workspace')).toBeNull();
  });

  it('should require typing workspace name to enable delete button', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByText('Delete Workspace');
    const input = screen.getByPlaceholderText('Test Workspace');

    // Delete button should be disabled initially
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    // Type incorrect text
    fireEvent.change(input, { target: { value: 'Wrong Name' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    // Type correct workspace name
    fireEvent.change(input, { target: { value: 'Test Workspace' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(false);
  });

  it('should call onConfirm when delete button is clicked with correct name', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByText('Delete Workspace');
    const input = screen.getByPlaceholderText('Test Workspace');

    // Type correct workspace name
    fireEvent.change(input, { target: { value: 'Test Workspace' } });
    
    // Click delete button
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledOnce();
  });

  it('should not call onConfirm when delete button is clicked with incorrect name', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const input = screen.getByPlaceholderText('Test Workspace');

    // Type incorrect workspace name
    fireEvent.change(input, { target: { value: 'Wrong Name' } });
    
    // Delete button should be disabled, so clicking won't work
    const deleteButton = screen.getByText('Delete Workspace');
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should show loading state when isDeleting is true', () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    expect(screen.getByText('Deleting...')).toBeTruthy();
    
    // Input and buttons should be disabled during deletion
    const input = screen.getByPlaceholderText('Test Workspace');
    const cancelButton = screen.getByText('Cancel');
    
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(cancelButton.hasAttribute('disabled')).toBe(true);
  });

  it('should call onOpenChange when cancel button is clicked', () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should clear input text when dialog is closed and reopened', async () => {
    const { rerender } = render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const input = screen.getByPlaceholderText('Test Workspace') as HTMLInputElement;
    
    // Type some text
    fireEvent.change(input, { target: { value: 'Test Workspace' } });
    expect(input.value).toBe('Test Workspace');

    // Close dialog
    rerender(
      <WorkspaceDeleteDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    // Reopen dialog
    rerender(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    // Input should be cleared
    const newInput = screen.getByPlaceholderText('Test Workspace') as HTMLInputElement;
    expect(newInput.value).toBe('');
  });

  it('should display warning messages', () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/All content, settings, and data associated with this workspace will be lost/)).toBeTruthy();
    expect(screen.getByText(/Type.*Test Workspace.*to confirm deletion/)).toBeTruthy();
  });
}); 