/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach, Mock } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../utils/test-utils";
import { WorkspaceSwitcherModal } from "../../src/components/Workspace/WorkspaceSwitcherModal";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";

// Mock the useWorkspace hook
vi.mock("../../src/lib/contexts/WorkspaceContext");

// Mock Supabase functions
vi.mock("../../src/lib/supabase", () => ({
  initiateOAuthFlow: vi.fn(),
  exchangeCodeForToken: vi.fn(),
  checkSupabaseConnection: vi.fn(),
  listProjects: vi.fn(),
  checkTokenNeedsRefresh: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

// Mock useSWR
vi.mock("swr", () => ({
  default: vi.fn(),
}));

const mockWorkspaces = [
  {
    id: "workspace-1",
    name: "Test Workspace 1",
    description: "First test workspace",
    project_ref: "project-1",
  },
  {
    id: "workspace-2",
    name: "Test Workspace 2",
    description: "Second test workspace",
    project_ref: null, // Unlinked workspace
  },
];

const mockProjects = [
  {
    id: "project-1",
    name: "Test Project 1",
    status: "ACTIVE_HEALTHY",
  },
  {
    id: "project-2",
    name: "Test Project 2",
    status: "ACTIVE_HEALTHY",
  },
];

describe("WorkspaceSwitcherModal", () => {
  const mockOnOpenChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when disconnected from Supabase", () => {
    beforeEach(() => {
      // Mock useSWR to return disconnected state
      const mockUseSWR = require("swr").default;
      mockUseSWR.mockImplementation((key: string) => {
        if (key === "sbConnection") {
          return {
            data: { result: false, error: 'Not connected' },
            mutate: vi.fn(),
            isLoading: false,
          };
        }
        return { data: null, mutate: vi.fn(), isLoading: false };
      });

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

      await waitFor(() => {
        expect(screen.getByText(/No Supabase connection found/)).toBeTruthy();
        expect(screen.getByText('Connect Supabase Project')).toBeTruthy();
      });

      // Should not show workspace info text
      expect(screen.queryByText(/A workspace links to a Supabase project/)).toBeNull();
      
      // Should not show any workspace cards
      expect(screen.queryByText('Test Workspace 1')).toBeNull();
      expect(screen.queryByText('Test Workspace 2')).toBeNull();
    });

    test("should call initiateOAuthFlow when connect button is clicked", async () => {
      const { initiateOAuthFlow } = require("../../src/lib/supabase");
      
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Connect Supabase Project')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Connect Supabase Project'));
      expect(initiateOAuthFlow).toHaveBeenCalledOnce();
    });

    test("should allow modal to open when disconnected", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No Supabase connection found/)).toBeTruthy();
      });

      // Modal should be open and showing disconnected state
      expect(screen.getByRole('dialog')).toBeTruthy();
      
      // Close button should be visible when disconnected
      expect(screen.getByLabelText('Close')).toBeTruthy();
    });
  });

  describe("when connected to Supabase", () => {
    beforeEach(() => {
      // Mock useSWR to return connected state and projects
      const mockUseSWR = require("swr").default;
      mockUseSWR.mockImplementation((key: string) => {
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
          };
        }
        if (key === "projects") {
          return {
            data: mockProjects,
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

      await waitFor(() => {
        expect(screen.getByText(/A workspace links to a Supabase project/)).toBeTruthy();
        expect(screen.getByText('Test Workspace 1')).toBeTruthy();
        expect(screen.getByText('Test Workspace 2')).toBeTruthy();
      });
    });

    test("should show link project option for unlinked workspaces", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No project linked/)).toBeTruthy();
        expect(screen.getByText('Link Project')).toBeTruthy();
      });
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

      await waitFor(() => {
        expect(screen.getByText('Test Workspace 1')).toBeTruthy();
      });

      // Close button should be hidden when connected but no workspace selected
      expect(screen.queryByLabelText('Close')).toBeNull();

      // Try to close by pressing Escape - should be prevented when connected but no workspace selected
      fireEvent.keyDown(screen.getByRole("dialog"), {
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

      await waitFor(() => {
        expect(screen.getByText('Test Workspace 1')).toBeTruthy();
      });

      // Close button should be visible when current workspace is selected
      expect(screen.getByLabelText('Close')).toBeTruthy();
    });
  });

  describe("loading states", () => {
    test("should show loading spinner when checking connection", async () => {
      // Mock useSWR to return loading state
      const mockUseSWR = require("swr").default;
      mockUseSWR.mockImplementation((key: string) => {
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

      expect(screen.getByText('Checking connection...')).toBeTruthy();
    });
  });
}); 