/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../utils/test-utils";
import Dashboard from "../../src/pages/Dashboard";
import * as SchemaApi from "../../src/lib/api/SchemaApi";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";
import { Workspace } from "../../src/lib/workspaceSchema";
import { ContentSchema } from "../../src/lib/contentSchema";

// Test data
const mockContentItems = [
  {
    id: "1",
    title: "Test Content 1",
    status: "published",
    schemaId: "blog",
    updatedAt: "2024-01-01T00:00:00Z",
    publishedAt: "2024-01-01T00:00:00Z",
    createdBy: "user@test.com",
    updatedBy: "user@test.com",
  },
];

const mockSchemas: ContentSchema[] = [
  {
    id: "blog",
    name: "Blog Post",
    fields: [],
    type: "collection",
  },
];

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWorkspace as Mock).mockReturnValue({
      currentWorkspace: { id: "test-workspace" } as Workspace,
      workspaces: [],
      isLoading: false,
      setCurrentWorkspace: vi.fn(),
      refreshWorkspaces: vi.fn(),
    });
    (SchemaApi.listSchemas as Mock).mockResolvedValue(mockSchemas);
  });

  describe("Empty States", () => {
    test("renders empty state for Last Edited widget", async () => {
      render(<Dashboard />);

      await screen.findByText("No recent activity");
      await screen.findByText("Content you edit will appear here");
      expect(screen.queryByRole("link", { name: /view more/i })).toBeNull();
    });
  });

  describe("View More Navigation", () => {
    test("navigates to correct route when clicking View More in Last Edited widget", async () => {
      render(<Dashboard />);

      const lastEditedViewMore = await screen.findByRole("link", {
        name: /view more/i,
      });
      expect(lastEditedViewMore.getAttribute("href")).toBe("/manager?sort=updatedAt");
    });
  });
});
