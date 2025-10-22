import React from 'react';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SchemaEditorPage from '../src/pages/SchemaEditorPage';
import ContentManagerPage from '../src/pages/ContentManagerPage';
import * as SchemaApi from '../src/lib/api/SchemaApi';
import * as ContentApi from '../src/lib/api/ContentApi';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WorkspaceProvider } from '../src/lib/contexts/WorkspaceContext';

vi.mock('../src/lib/api/SchemaApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/api/SchemaApi')>();
  return {
    ...actual,
    getSchema: vi.fn(),
    listSchemas: vi.fn(),
    updateSchema: vi.fn(),
    deleteSchema: vi.fn(),
    createSchema: vi.fn(),
  };
});

vi.mock('../src/lib/api/ContentApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/api/ContentApi')>();
  return {
    ...actual,
    listContentItems: vi.fn(),
    listContentItemsBySchema: vi.fn(),
    deleteContentItem: vi.fn(),
    updateContentItem: vi.fn(),
  };
});

vi.mock('../src/lib/api/WorkspaceApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/api/WorkspaceApi')>();
  return {
    ...actual,
    getWorkspaces: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Test Workspace',
        project_ref: 'test-project',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]),
  };
});

const mockSchema: SchemaApi.ContentSchemaRow = {
  id: 5,
  name: 'Article',
  description: 'Article schema',
  type: 'collection',
  fields: [
    {
      id: 'field1',
      label: 'Title',
      type: SchemaApi.SchemaFieldType.TEXT,
      required: true,
      default_value: '',
      description: '',
      options: null,
      relation_schema_id: null,
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  workspace_id: 1,
  archived_at: null,
};

const mockSchemas: SchemaApi.ContentSchemaRow[] = [
  mockSchema,
  {
    id: 1,
    name: 'Blog Post',
    description: 'Blog post schema',
    type: 'collection',
    fields: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    workspace_id: 1,
    archived_at: null,
  },
];

const mockContentItems: ContentApi.ContentItemRow[] = [
  {
    id: 1,
    title: 'Test Article 1',
    schema_id: 5,
    status: 'draft',
    data: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    published_at: null,
    workspace_id: 1,
  },
  {
    id: 2,
    title: 'Test Article 2',
    schema_id: 5,
    status: 'published',
    data: {},
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    published_at: '2024-01-02T00:00:00Z',
    workspace_id: 1,
  },
];

describe('Content Manager - Badge Navigation Infinite Loop Prevention', () => {
  let listContentItemsMock: ReturnType<typeof vi.fn>;
  let listSchemasMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup localStorage for workspace
    localStorage.setItem('currentWorkspaceId', '1');

    listSchemasMock = SchemaApi.listSchemas as any;
    listSchemasMock.mockResolvedValue({
      data: mockSchemas,
      error: null,
    });

    listContentItemsMock = ContentApi.listContentItems as any;
    listContentItemsMock.mockResolvedValue({
      data: mockContentItems,
      error: null,
    });
  });

  it('should not cause infinite loop when loading with schema filter from URL params', async () => {
    // Simulate clicking the badge in SchemaEditorPage which navigates to /manager?schema=5&page=1&perPage=10
    // This test verifies the fix prevents infinite loops in ContentManagerPage
    render(
      <MemoryRouter initialEntries={['/manager?schema=5&page=1&perPage=10']}>
        <WorkspaceProvider>
          <Routes>
            <Route path="/manager" element={<ContentManagerPage />} />
          </Routes>
        </WorkspaceProvider>
      </MemoryRouter>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title...')).toBeDefined();
    }, { timeout: 5000 });

    // Wait a moment for any potential loops to manifest
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Critical assertion: Verify that API calls are not being made hundreds of times
    // Before the fix, the infinite loop would cause hundreds/thousands of calls
    // After the fix, should only have initial load calls (typically 1-3 calls)
    const contentApiCallCount = listContentItemsMock.mock.calls.length;
    const schemaApiCallCount = listSchemasMock.mock.calls.length;

    expect(contentApiCallCount).toBeLessThan(5);
    expect(schemaApiCallCount).toBeLessThan(5);
  });

  it('should correctly apply schema filter when navigating from URL params', async () => {
    // Simulate the state after clicking the badge - URL has schema filter
    render(
      <MemoryRouter initialEntries={['/manager?schema=5&page=1&perPage=10']}>
        <WorkspaceProvider>
          <Routes>
            <Route path="/manager" element={<ContentManagerPage />} />
          </Routes>
        </WorkspaceProvider>
      </MemoryRouter>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title...')).toBeDefined();
    }, { timeout: 5000 });

    // Verify the correct schema is selected in the filter
    // The FilterForm should show "Article" for schema ID 5
    await waitFor(() => {
      const articles = screen.getAllByText('Article');
      // Should appear in both the dropdown and the aria-live region
      expect(articles.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // Verify content items are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeDefined();
      expect(screen.getByText('Test Article 2')).toBeDefined();
    });
  });

  it('should not trigger excessive re-renders after initial URL param sync', async () => {
    // Track render count with a custom component
    let renderCount = 0;
    const RenderCounter = () => {
      renderCount++;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/manager?schema=5&page=1&perPage=10']}>
        <WorkspaceProvider>
          <Routes>
            <Route
              path="/manager"
              element={
                <>
                  <RenderCounter />
                  <ContentManagerPage />
                </>
              }
            />
          </Routes>
        </WorkspaceProvider>
      </MemoryRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title...')).toBeDefined();
    }, { timeout: 5000 });

    const initialRenderCount = renderCount;

    // Wait to see if there are additional renders (infinite loop would cause this)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalRenderCount = renderCount;

    // Should not have excessive renders - allow for reasonable re-renders (data fetching, state updates)
    // But definitely not hundreds which would indicate an infinite loop
    const additionalRenders = finalRenderCount - initialRenderCount;
    expect(additionalRenders).toBeLessThan(20);
  });
});
