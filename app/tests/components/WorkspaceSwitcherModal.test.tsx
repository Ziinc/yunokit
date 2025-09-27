/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach, Mock } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../utils/test-utils";
import { WorkspaceSwitcherModal } from "../../src/components/Workspace/WorkspaceSwitcherModal";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";
import useSWR from "swr";

// Mock data for testing
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
    project_ref: null, // Unlinked workspace
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
  {
    id: "project-2",
    name: "Test Project 2",
    status: "ACTIVE_HEALTHY",
    region: "us-west-2",
  },
];

describe("WorkspaceSwitcherModal", () => {
  const mockOnOpenChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when disconnected from Supabase", () => {
    beforeEach(() => {
      // Configure SWR mock for disconnected state
      (useSWR as Mock).mockImplementation((key: string) => {
        if (key === "sbConnection") {
          return {
            data: { result: false, error: 'Not connected' },
            mutate: vi.fn(),
            isLoading: false,
          };
        }
        return { data: null, mutate: vi.fn(), isLoading: false };
      });

      // Configure automocks for disconnected state
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: null,
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });
    });

    test("should show connection prompt without workspace list", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const connectionText = await screen.findByText(/No Supabase connection found/);
      expect(connectionText).toBeTruthy();
      
      const connectButton = await screen.findByText('Connect Supabase Project');
      expect(connectButton).toBeTruthy();

      // Should not show workspace info text
      const workspaceInfo = screen.queryByText(/A workspace links to a Supabase project/);
      expect(workspaceInfo).toBeNull();
      
      // Should not show any workspace cards
      const workspace1 = screen.queryByText('Test Workspace 1');
      expect(workspace1).toBeNull();
      
      const workspace2 = screen.queryByText('Test Workspace 2');
      expect(workspace2).toBeNull();
    });

    test("should allow modal to open when disconnected", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const connectionText = await screen.findByText(/No Supabase connection found/);
      expect(connectionText).toBeTruthy();

      // Modal should be open and showing disconnected state
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
    });
  });

  describe("when connected to Supabase", () => {
    beforeEach(() => {
      // Configure SWR mock for connected state
      (useSWR as Mock).mockImplementation((key: string) => {
        if (key === "sbConnection") {
          return {
            data: { result: true },
            mutate: vi.fn(),
            isLoading: false,
          };
        }
        if (key === "valid_access_token") {
          return {
            data: false, // token is not expired
            mutate: vi.fn(),
            isLoading: false,
          };
        }
        if (key === "projects") {
          return {
            data: mockProjects,
            mutate: vi.fn(),
            isLoading: false,
          };
        }
        return { data: null, mutate: vi.fn(), isLoading: false };
      });

      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: mockWorkspaces[0],
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });
    });

    test("should show workspace info and workspace list", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const workspaceInfo = await screen.findByText(/A workspace links to a Supabase project/);
      expect(workspaceInfo).toBeTruthy();
      
      const workspace1 = await screen.findByText('Test Workspace 1');
      expect(workspace1).toBeTruthy();
      
      const workspace2 = await screen.findByText('Test Workspace 2');
      expect(workspace2).toBeTruthy();
    });

    test("should show link project option for unlinked workspaces", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const noProjectText = await screen.findByText(/No project linked/);
      expect(noProjectText).toBeTruthy();
      
      const linkButton = await screen.findByText('Link Project');
      expect(linkButton).toBeTruthy();
    });

    test("should prevent closing modal when no current workspace is selected", async () => {
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: null, // No current workspace
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });

      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const workspace1 = await screen.findByText('Test Workspace 1');
      expect(workspace1).toBeTruthy();

      // Try to close by pressing Escape - should be prevented when connected but no workspace selected
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, {
        key: "Escape",
        code: "Escape",
      });

      // Verify modal doesn't close when no workspace is selected and connected
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    test("should show close button when current workspace is selected", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const workspace1 = await screen.findByText('Test Workspace 1');
      expect(workspace1).toBeTruthy();

      // Close button should be visible when current workspace is selected
      // Look for the close button - it's a button with the X icon and "Close" sr-only text
      const closeButton = await screen.findByText('Close');
      expect(closeButton).toBeTruthy();
    });
  });

  describe("loading states", () => {
    test("should show loading spinner when checking connection", async () => {
      // Configure SWR mock for loading state
      (useSWR as Mock).mockImplementation((key: string) => {
        if (key === "sbConnection") {
          return {
            data: undefined,
            mutate: vi.fn(),
            isLoading: true,
          };
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

      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const loadingText = await screen.findByText('Checking connection...');
      expect(loadingText).toBeTruthy();
    });
  });
}); 