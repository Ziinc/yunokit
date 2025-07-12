/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.unmock("../../src/lib/contexts/WorkspaceContext");
vi.mock("swr", () => ({ default: vi.fn() }));
vi.mock("../../src/lib/api/WorkspaceApi");

import swr from "swr";
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
    const mockUseSWR = vi.mocked(swr);
    mockUseSWR.mockImplementation(() => ({
      data: mockWorkspaces,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    }));
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(localStorage.setItem).mockReset();
    vi.mocked(localStorage.removeItem).mockReset();
  });

  test("initializes current workspace from localStorage", async () => {
    vi.mocked(localStorage.getItem).mockReturnValue("2");
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
