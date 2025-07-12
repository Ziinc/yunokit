/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.unmock("../../src/lib/contexts/WorkspaceContext");
vi.mock("swr", () => ({ default: vi.fn() }));
vi.mock("../../src/lib/api/WorkspaceApi");

import { WorkspaceProvider, useWorkspace } from "../../src/lib/contexts/WorkspaceContext";

const mockWorkspaces = [
  { id: 1, name: "One", description: "", project_ref: "p1" },
  { id: 2, name: "Two", description: "", project_ref: "p2" },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceProvider>{children}</WorkspaceProvider>
);

describe("WorkspaceContext", () => {
  beforeEach(() => {
    const mockUseSWR = require("swr").default;
    mockUseSWR.mockImplementation(() => ({
      data: mockWorkspaces,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    }));
    (localStorage.getItem as any).mockReset();
    (localStorage.setItem as any).mockReset();
    (localStorage.removeItem as any).mockReset();
  });

  test("initializes current workspace from localStorage", async () => {
    (localStorage.getItem as any).mockReturnValue("2");
    const { result } = renderHook(() => useWorkspace(), { wrapper });
    await waitFor(() => expect(result.current.currentWorkspace?.id).toBe(2));
  });

  test("saves workspace id to localStorage when switching", async () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });
    await waitFor(() => expect(result.current.workspaces.length).toBe(2));
    act(() => {
      result.current.setCurrentWorkspace(mockWorkspaces[0]);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "currentWorkspaceId",
      "1"
    );
  });
});
