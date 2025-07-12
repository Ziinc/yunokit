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

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete Workspace' })).toBeTruthy();
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

    expect(screen.queryByRole('dialog')).toBeNull();
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

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should require typing "delete" to enable delete button', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete Workspace' });
    const input = screen.getByPlaceholderText('delete');

    // Delete button should be disabled initially
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    // Type incorrect text
    fireEvent.change(input, { target: { value: 'wrong' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    // Type correct confirmation text
    fireEvent.change(input, { target: { value: 'delete' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(false);
  });

  it('should call onConfirm when delete button is clicked with correct confirmation', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete Workspace' });
    const input = screen.getByPlaceholderText('delete');

    // Type correct confirmation text
    fireEvent.change(input, { target: { value: 'delete' } });
    
    // Click delete button
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledOnce();
  });

  it('should not call onConfirm when delete button is clicked with incorrect confirmation', async () => {
    render(
      <WorkspaceDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspace={mockWorkspace}
        onConfirm={mockOnConfirm}
      />
    );

    const input = screen.getByPlaceholderText('delete');

    // Type incorrect confirmation text
    fireEvent.change(input, { target: { value: 'wrong' } });
    
    // Delete button should be disabled, so clicking won't work
    const deleteButton = screen.getByRole('button', { name: 'Delete Workspace' });
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
    const input = screen.getByPlaceholderText('delete');
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

    const input = screen.getByPlaceholderText('delete') as HTMLInputElement;
    
    // Type some text
    fireEvent.change(input, { target: { value: 'delete' } });
    expect(input.value).toBe('delete');

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
    const newInput = screen.getByPlaceholderText('delete') as HTMLInputElement;
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
    expect(screen.getByLabelText(/Type delete to confirm deletion/)).toBeTruthy();
  });
}); 