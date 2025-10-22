/// <reference types="vitest/globals" />
import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils/test-utils";
import SchemaEditorPage from "../../src/pages/SchemaEditorPage";
import * as SchemaApi from "../../src/lib/api/SchemaApi";
import * as ContentApi from "../../src/lib/api/ContentApi";
import { useWorkspace } from "../../src/lib/contexts/WorkspaceContext";
import { Workspace } from "../../src/lib/workspaceSchema";
import useSWR from "swr";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

vi.mock("../../src/lib/api/SchemaApi", () => ({
  getSchema: vi.fn(),
  updateSchema: vi.fn(),
  listSchemas: vi.fn(),
  SchemaFieldType: {
    TEXT: "text",
    NUMBER: "number",
    DATE: "date",
    BOOLEAN: "boolean",
    ENUM: "enum",
    RELATION: "relation",
    IMAGE: "image",
    MARKDOWN: "markdown",
    JSON: "json",
  },
}));

vi.mock("../../src/lib/api/ContentApi", () => ({
  listContentItemsBySchema: vi.fn(),
  deleteContentItem: vi.fn(),
}));

vi.mock("../../src/lib/contexts/WorkspaceContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useWorkspace: vi.fn(),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ schemaId: "1" }),
    useNavigate: () => vi.fn(),
  };
});

const mockWorkspace: Workspace = {
  id: 1,
  name: "Test Workspace",
  slug: "test-workspace",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockCollectionSchema: SchemaApi.ContentSchemaRow = {
  id: 1,
  name: "Test Collection",
  description: "Test description",
  type: "collection",
  fields: [],
  workspace_id: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  deleted_at: null,
  archived_at: null,
};

const mockSingleSchema: SchemaApi.ContentSchemaRow = {
  ...mockCollectionSchema,
  type: "single",
};

const mockContentItems: ContentApi.ContentItemRow[] = [
  {
    id: 1,
    title: "Item 1",
    schema_id: 1,
    status: "published",
    data: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    published_at: "2024-01-01T00:00:00Z",
    workspace_id: 1,
    created_by: 1,
    updated_by: 1,
  },
  {
    id: 2,
    title: "Item 2",
    schema_id: 1,
    status: "published",
    data: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    published_at: "2024-01-01T00:00:00Z",
    workspace_id: 1,
    created_by: 1,
    updated_by: 1,
  },
];

describe("SchemaEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWorkspace as Mock).mockReturnValue({
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isLoading: false,
      setCurrentWorkspace: vi.fn(),
      refreshWorkspaces: vi.fn(),
    });
    (SchemaApi.listSchemas as Mock).mockResolvedValue({
      data: [mockCollectionSchema],
      error: null,
    });
  });

  describe("Collection to Single type switch validation", () => {
    test("blocks type switch when collection has multiple items", async () => {
      let swrCallCount = 0;
      (useSWR as Mock).mockImplementation((key: string) => {
        swrCallCount++;
        if (typeof key === 'string' && key.startsWith('schema-')) {
          return {
            data: { data: mockCollectionSchema, error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        if (typeof key === 'string' && key.startsWith('content-items-')) {
          return {
            data: { data: mockContentItems, error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        return { data: undefined, isLoading: true, mutate: vi.fn() };
      });
      
      (SchemaApi.listSchemas as Mock).mockResolvedValue({
        data: [mockCollectionSchema],
        error: null,
      });

      const user = userEvent.setup();
      render(<SchemaEditorPage />);

      // Verify schema name is displayed
      await screen.findByText("Test Collection");

      // Open the dropdown menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.getAttribute("aria-haspopup") === "menu");
      if (!menuButton) throw new Error("Menu button not found");
      await user.click(menuButton);

      // Click "Change Type" option
      const changeTypeOption = await screen.findByText("Change Type");
      await user.click(changeTypeOption);

      // Verify dialog opened with error message
      await screen.findByText("Change Schema Type");
      const errorHeading = await screen.findByText("Cannot Change Type");
      expect(errorHeading).toBeDefined();

      const errorMessage = await screen.findByText(/This schema contains 2 items/);
      expect(errorMessage).toBeDefined();

      // Verify "Change Type" button is disabled
      const changeTypeButton = screen.getByRole("button", { name: "Change Type" });
      expect(changeTypeButton.hasAttribute("disabled")).toBe(true);
    });

    test("allows type switch when collection has one item", async () => {
      (useSWR as Mock).mockImplementation((key: string) => {
        if (typeof key === 'string' && key.startsWith('schema-')) {
          return {
            data: { data: mockCollectionSchema, error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        if (typeof key === 'string' && key.startsWith('content-items-')) {
          return {
            data: { data: [mockContentItems[0]], error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        return { data: undefined, isLoading: true, mutate: vi.fn() };
      });
      
      (SchemaApi.listSchemas as Mock).mockResolvedValue({
        data: [mockCollectionSchema],
        error: null,
      });
      
      (SchemaApi.updateSchema as Mock).mockResolvedValue({
        data: { ...mockCollectionSchema, type: "single" },
        error: null,
      });

      const user = userEvent.setup();
      render(<SchemaEditorPage />);

      // Verify schema name is displayed
      await screen.findByText("Test Collection");

      // Open the dropdown menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.getAttribute("aria-haspopup") === "menu");
      if (!menuButton) throw new Error("Menu button not found");
      await user.click(menuButton);

      // Click "Change Type" option
      const changeTypeOption = await screen.findByText("Change Type");
      await user.click(changeTypeOption);

      // Verify dialog opened without error message
      await screen.findByText("Change Schema Type");
      expect(screen.queryByText("Cannot Change Type")).toBeNull();

      // Verify "Change Type" button is enabled
      const changeTypeButton = screen.getByRole("button", { name: "Change Type" });
      expect(changeTypeButton.hasAttribute("disabled")).toBe(false);

      // Click the button to perform the switch
      await user.click(changeTypeButton);

      // Verify the API was called
      await waitFor(() => {
        expect(SchemaApi.updateSchema).toHaveBeenCalledWith(
          1,
          { type: "single" },
          1
        );
      });
    });

    test("allows type switch when collection has no items", async () => {
      (useSWR as Mock).mockImplementation((key: string) => {
        if (typeof key === 'string' && key.startsWith('schema-')) {
          return {
            data: { data: mockCollectionSchema, error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        if (typeof key === 'string' && key.startsWith('content-items-')) {
          return {
            data: { data: [], error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        return { data: undefined, isLoading: true, mutate: vi.fn() };
      });
      
      (SchemaApi.listSchemas as Mock).mockResolvedValue({
        data: [mockCollectionSchema],
        error: null,
      });
      
      (SchemaApi.updateSchema as Mock).mockResolvedValue({
        data: { ...mockCollectionSchema, type: "single" },
        error: null,
      });

      const user = userEvent.setup();
      render(<SchemaEditorPage />);

      // Verify schema name is displayed
      await screen.findByText("Test Collection");

      // Open the dropdown menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.getAttribute("aria-haspopup") === "menu");
      if (!menuButton) throw new Error("Menu button not found");
      await user.click(menuButton);

      // Click "Change Type" option
      const changeTypeOption = await screen.findByText("Change Type");
      await user.click(changeTypeOption);

      // Verify dialog opened without error message
      await screen.findByText("Change Schema Type");
      expect(screen.queryByText("Cannot Change Type")).toBeNull();

      // Verify "Change Type" button is enabled
      const changeTypeButton = screen.getByRole("button", { name: "Change Type" });
      expect(changeTypeButton.hasAttribute("disabled")).toBe(false);
    });

    test("always allows type switch from single to collection", async () => {
      (useSWR as Mock).mockImplementation((key: string) => {
        if (typeof key === 'string' && key.startsWith('schema-')) {
          return {
            data: { data: mockSingleSchema, error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        if (typeof key === 'string' && key.startsWith('content-items-')) {
          return {
            data: { data: [mockContentItems[0]], error: null },
            isLoading: false,
            mutate: vi.fn(),
          };
        }
        return { data: undefined, isLoading: true, mutate: vi.fn() };
      });
      
      (SchemaApi.listSchemas as Mock).mockResolvedValue({
        data: [mockSingleSchema],
        error: null,
      });
      
      (SchemaApi.updateSchema as Mock).mockResolvedValue({
        data: { ...mockSingleSchema, type: "collection" },
        error: null,
      });

      const user = userEvent.setup();
      render(<SchemaEditorPage />);

      // Verify schema name is displayed
      await screen.findByText("Test Collection");

      // Open the dropdown menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.getAttribute("aria-haspopup") === "menu");
      if (!menuButton) throw new Error("Menu button not found");
      await user.click(menuButton);

      // Click "Change Type" option
      const changeTypeOption = await screen.findByText("Change Type");
      await user.click(changeTypeOption);

      // Verify dialog opened without error message
      await screen.findByText("Change Schema Type");
      expect(screen.queryByText("Cannot Change Type")).toBeNull();

      // Verify "Change Type" button is enabled
      const changeTypeButton = screen.getByRole("button", { name: "Change Type" });
      expect(changeTypeButton.hasAttribute("disabled")).toBe(false);

      // Click the button to perform the switch
      await user.click(changeTypeButton);

      // Verify the API was called
      await waitFor(() => {
        expect(SchemaApi.updateSchema).toHaveBeenCalledWith(
          1,
          { type: "collection" },
          1
        );
      });
    });
  });
});

