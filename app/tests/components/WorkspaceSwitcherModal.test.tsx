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
    project_ref: "project-2",
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
  });

  describe("when no workspace is selected", () => {
    beforeEach(() => {
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: null, // No workspace selected
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });
    });

    test("prevents modal from closing when no workspace is selected", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Wait for the modal to be rendered
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeTruthy();
      });

      // Try to close by pressing Escape
      fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        charCode: 27,
      });

      // Modal should not close - onOpenChange should not be called with false
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    test("allows modal to close after selecting a workspace", async () => {
      const mockSetCurrentWorkspace = vi.fn();
      
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: null,
        setCurrentWorkspace: mockSetCurrentWorkspace,
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
        expect(screen.getByText("Test Workspace 1")).toBeTruthy();
      });

      // Select a workspace by clicking on the card
      const workspaceTitle = screen.getByText("Test Workspace 1");
      const workspaceCard = workspaceTitle.closest("div");
      
      if (workspaceCard) {
        fireEvent.click(workspaceCard);
      }

      // Verify setCurrentWorkspace was called
      expect(mockSetCurrentWorkspace).toHaveBeenCalledWith(mockWorkspaces[0]);
      // Verify modal was closed
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("when a workspace is already selected", () => {
    beforeEach(() => {
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: mockWorkspaces[0], // First workspace selected
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });
    });

    test("shows the currently selected workspace with correct styling", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Test Workspace 1")).toBeTruthy();
      });

      // Look for the workspace card with primary border (selected state)
      const workspaceCard = screen.getByText("Test Workspace 1").closest("div");
      expect(workspaceCard?.className).toContain("border-primary");
    });
  });

  describe("workspace display", () => {
    beforeEach(() => {
      (useWorkspace as Mock).mockReturnValue({
        workspaces: mockWorkspaces,
        currentWorkspace: mockWorkspaces[0],
        setCurrentWorkspace: vi.fn(),
        isLoading: false,
        refreshWorkspaces: vi.fn(),
      });
    });

    test("displays workspace information correctly", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Test Workspace 1")).toBeTruthy();
        expect(screen.getByText("First test workspace")).toBeTruthy();
        expect(screen.getByText("Test Workspace 2")).toBeTruthy();
        expect(screen.getByText("Second test workspace")).toBeTruthy();
      });

      // Check that project status is displayed
      expect(screen.getByText("Test Project 1")).toBeTruthy();
      expect(screen.getByText("Test Project 2")).toBeTruthy();
    });

    test("displays project health status correctly", async () => {
      render(
        <WorkspaceSwitcherModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Test Project 1")).toBeTruthy();
      });

      // Look for green indicators for healthy projects
      const healthIndicators = document.querySelectorAll(".bg-green-500");
      expect(healthIndicators.length).toBeGreaterThan(0);
    });
  });
}); 