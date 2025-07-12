/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { screen, within } from "@testing-library/react";
import { render } from "../utils/test-utils";
import Dashboard from "../../src/pages/Dashboard";
import { ContentApi } from "../../src/lib/api/ContentApi";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";
import { isFeatureEnabled } from "../../src/lib/featureFlags";
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
  {
    id: "2",
    title: "Test Draft",
    status: "draft",
    schemaId: "blog",
    updatedAt: "2024-01-02T00:00:00Z",
    createdBy: "user@test.com",
    updatedBy: "user@test.com",
  },
  {
    id: "3",
    title: "Test Review",
    status: "pending_review",
    schemaId: "blog",
    updatedAt: "2024-01-03T00:00:00Z",
    createdBy: "user@test.com",
    updatedBy: "user@test.com",
  },
  {
    id: "4",
    title: "Test Review 2",
    status: "pending_review",
    schemaId: "blog",
    updatedAt: "2024-01-04T00:00:00Z",
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
    (ContentApi.getSchemas as Mock).mockResolvedValue(mockSchemas);
    (isFeatureEnabled as Mock).mockReturnValue(true);
  });

  describe("Empty States", () => {
    beforeEach(() => {
      (ContentApi.listContentItems as Mock).mockResolvedValue([]);
    });

    test("renders empty state for Last Edited widget", async () => {
      render(<Dashboard />);

      await screen.findByText("No recent activity");
      await screen.findByText("Content you edit will appear here");
      expect(screen.queryByRole("link", { name: /view more/i })).toBeNull();
    });

    test("renders empty state for Draft Content widget", async () => {
      render(<Dashboard />);

      await screen.findByText("No draft content");
      await screen.findByText("Content you save as draft will appear here");
      expect(screen.queryByRole("link", { name: /view more/i })).toBeNull();
    });

    test("renders empty state for Published Content widget", async () => {
      render(<Dashboard />);

      await screen.findByText("No published content");
      await screen.findByText("Content you publish will appear here");
      expect(screen.queryByRole("link", { name: /view more/i })).toBeNull();
    });

    test("renders empty state for Approval Requests widget", async () => {
      render(<Dashboard />);

      await screen.findByText("No content to review");
      await screen.findByText(
        "Content waiting for your review will appear here"
      );
      expect(screen.queryByRole("link", { name: /view more/i })).toBeNull();
    });
  });

  describe("Content Rendering", () => {
    beforeEach(() => {
      (ContentApi.listContentItems as Mock).mockResolvedValue(mockContentItems);
    });

    test("renders content items in Last Edited widget", async () => {
      render(<Dashboard />);

      const lastEditedSection = screen
        .getByRole("heading", { name: /last edited/i })
        .closest("div")?.parentElement?.parentElement;
      await within(lastEditedSection!).findByText("Test Content 1");
      await expect(screen.findByText("Test Content 2")).rejects.toThrow();
      await expect(screen.findByText("Test Draft")).rejects.toThrow();
      await expect(screen.findByText("Test Review")).rejects.toThrow();
    });

    test("renders content items in Draft Content widget", async () => {
      render(<Dashboard />);

      const draftSection = screen
        .getByRole("heading", { name: /draft content/i })
        .closest("div")?.parentElement?.parentElement;
      await within(draftSection!).findByText("Test Draft");
      await expect(within(draftSection!).findByText("Test Content 1")).rejects.toThrow();
      await expect(within(draftSection!).findByText("Test Review")).rejects.toThrow();
      const viewMoreLink = within(draftSection!).getByRole("link", {
        name: /view more/i,
      });
      expect(viewMoreLink.getAttribute("href")).toBe("/manager?status=draft");
    });

    test("renders content items in Published Content widget", async () => {
      render(<Dashboard />);

      const publishedSection = screen
        .getByRole("heading", { name: /published content/i })
        .closest("div")?.parentElement?.parentElement;
      await within(publishedSection!).findByText("Test Content 1");
      await expect(within(publishedSection!).findByText("Test Draft")).rejects.toThrow();
      await expect(within(publishedSection!).findByText("Test Review")).rejects.toThrow();
      const viewMoreLink = within(publishedSection!).getByRole("link", {
        name: /view more/i,
      });
      expect(viewMoreLink.getAttribute("href")).toBe(
        "/manager?status=published"
      );
    });

    test("renders content items in Approval Requests widget", async () => {
      render(<Dashboard />);

      const approvalSection = screen
        .getByRole("heading", { name: /approval requests/i })
        .closest("div")?.parentElement?.parentElement;
      await within(approvalSection!).findByText("Test Review");
      await expect(within(approvalSection!).findByText("Test Content 1")).rejects.toThrow();
      await expect(within(approvalSection!).findByText("Test Draft")).rejects.toThrow();
      const viewMoreLink = within(approvalSection!).getByRole("link", {
        name: /view more/i,
      });
      expect(viewMoreLink.getAttribute("href")).toBe(
        "/manager?status=pending_review"
      );
    });
  });

  describe("View More Navigation", () => {
    beforeEach(() => {
      (ContentApi.listContentItems as Mock).mockResolvedValue(mockContentItems);
    });

    test("navigates to correct route when clicking View More in Last Edited widget", async () => {
      render(<Dashboard />);

      const lastEditedSection = screen
        .getByRole("heading", { name: /last edited/i })
        .closest("div")?.parentElement?.parentElement;
      
      
      const lastEditedViewMore = await within(lastEditedSection!).findByRole("link", {
        name: /view more/i,
      });
      expect(lastEditedViewMore.getAttribute("href")).toBe("/manager?sort=updatedAt");
    });

    test("navigates to correct route when clicking View More in Draft Content widget", async () => {
      render(<Dashboard />);

      const draftSection = screen
        .getByRole("heading", { name: /draft content/i })
        .closest("div")?.parentElement?.parentElement;
      
      const draftViewMore =await  within(draftSection!).findByRole("link", {
        name: /view more/i,
      });
      expect(draftViewMore.getAttribute("href")).toBe("/manager?status=draft");
    });

    test("navigates to correct route when clicking View More in Published Content widget", async () => {
      render(<Dashboard />);

      const publishedSection = screen
        .getByRole("heading", { name: /published content/i })
        .closest("div")?.parentElement?.parentElement;
      
      const publishedViewMore = await within(publishedSection!).findByRole("link", {
        name: /view more/i,
      });
      expect(publishedViewMore.getAttribute("href")).toBe("/manager?status=published");
    });

    test("navigates to correct route when clicking View More in Approval Requests widget", async () => {
      render(<Dashboard />);

      const approvalSection = screen
        .getByRole("heading", { name: /approval requests/i })
        .closest("div")?.parentElement?.parentElement;
      // Then check for the View More link
      const approvalViewMore = await within(approvalSection!).findByRole("link", {
        name: /view more/i,
      });
      expect(approvalViewMore.getAttribute("href")).toBe(
        "/manager?status=pending_review"
      );
    });
  });
});
