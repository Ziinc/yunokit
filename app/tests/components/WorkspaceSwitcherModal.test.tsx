/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach, Mock } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "../utils/test-utils";
import { WorkspaceSwitcherModal } from "../../src/components/Workspace/WorkspaceSwitcherModal";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";
import useSWR from "swr";

const mockWorkspaces = [
  {
    id: 1,
    name: "Test Workspace 1",
    description: "First test workspace",
    project_ref: "project-1",
    created_at: "2024-01-01T00:00:00Z",
    user_id: "user-1",
    api_key: "test-api-key-1",
  },
  {
    id: 2,
    name: "Test Workspace 2", 
    description: "Second test workspace",
    project_ref: null,
    created_at: "2024-01-01T00:00:00Z",
    user_id: "user-1",
    api_key: "test-api-key-2",
  },
];

const mockProjects = [
  {
    id: "project-1",
    name: "Test Project 1",
    status: "ACTIVE_HEALTHY",
    region: "us-east-1",
  },
];

const setupMocks = (connected: boolean, currentWorkspace = mockWorkspaces[0] as any) => {
  (useSWR as Mock).mockImplementation((key: string) => {
    if (key === "sbConnection") {
      return {
        data: connected ? { result: true } : { result: false, error: 'Not connected' },
        mutate: vi.fn(),
        isLoading: false,
      };
    }
    if (key === "valid_access_token") {
      return { data: false, mutate: vi.fn(), isLoading: false };
    }
    if (key === "projects") {
      return { data: mockProjects, mutate: vi.fn(), isLoading: false };
    }
    return { data: null, mutate: vi.fn(), isLoading: false };
  });

  (useWorkspace as Mock).mockReturnValue({
    workspaces: mockWorkspaces,
    currentWorkspace,
    setCurrentWorkspace: vi.fn(),
    isLoading: false,
    refreshWorkspaces: vi.fn(),
  });
};

describe("WorkspaceSwitcherModal", () => {
  const mockOnOpenChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows connection prompt when disconnected", async () => {
    setupMocks(false, null);

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(await screen.findByText(/No Supabase connection found/)).toBeTruthy();
    expect(await screen.findByText('Connect Supabase Project')).toBeTruthy();
    expect(screen.queryByText(/A workspace links to a Supabase project/)).toBeNull();
    expect(screen.queryByText('Test Workspace 1')).toBeNull();
  });

  test("shows workspace list when connected", async () => {
    setupMocks(true);

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(await screen.findByText(/A workspace links to a Supabase project/)).toBeTruthy();
    expect(await screen.findByText('Test Workspace 1')).toBeTruthy();
    expect(await screen.findByText('Test Workspace 2')).toBeTruthy();
  });

  test("shows link option for unlinked workspaces", async () => {
    setupMocks(true);

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(await screen.findByText(/No project linked/)).toBeTruthy();
    expect(await screen.findByText('Link Project')).toBeTruthy();
  });

  test("prevents closing when no workspace selected", async () => {
    setupMocks(true, null);

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  test("shows close button when workspace selected", async () => {
    setupMocks(true);

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(await screen.findByText('Close')).toBeTruthy();
  });

  test("shows loading state", async () => {
    (useSWR as Mock).mockImplementation((key: string) => {
      if (key === "sbConnection") {
        return { data: undefined, mutate: vi.fn(), isLoading: true };
      }
      return { data: null, mutate: vi.fn(), isLoading: false };
    });

    (useWorkspace as Mock).mockReturnValue({
      workspaces: [],
      currentWorkspace: null,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
      refreshWorkspaces: vi.fn(),
    });

    render(<WorkspaceSwitcherModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(await screen.findByText('Checking connection...')).toBeTruthy();
  });
}); 