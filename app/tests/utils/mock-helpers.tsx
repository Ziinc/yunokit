import { vi } from 'vitest';
import React from 'react';
import type { ContentItemRow } from '@/lib/api/ContentApi';
import type { ContentSchemaRow } from '@/lib/api/SchemaApi';

/**
 * Mock Helpers for Tests
 *
 * This file provides reusable helper functions for mocking common patterns in tests.
 */

// ============================================================================
// API Response Helpers
// ============================================================================

/**
 * Creates a successful API response structure
 */
export function createApiResponse<T>(data: T) {
  return {
    data,
    error: null
  };
}

/**
 * Creates an error API response structure
 */
export function createApiError(message: string, code?: string) {
  return {
    data: null,
    error: {
      message,
      code: code || 'ERROR'
    }
  };
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock ContentItemRow with sensible defaults
 */
export function createMockContentItem(overrides: Partial<ContentItemRow> = {}): ContentItemRow {
  return {
    id: 1,
    title: 'Test Content',
    schema_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    published_at: null,
    data: {},
    ...overrides
  };
}

/**
 * Creates multiple mock content items
 */
export function createMockContentItems(count: number, baseOverrides: Partial<ContentItemRow> = {}): ContentItemRow[] {
  return Array.from({ length: count }, (_, i) =>
    createMockContentItem({
      id: i + 1,
      title: `Test Content ${i + 1}`,
      ...baseOverrides
    })
  );
}

/**
 * Creates a mock ContentSchemaRow with sensible defaults
 */
export function createMockSchema(overrides: Partial<ContentSchemaRow> = {}): ContentSchemaRow {
  return {
    id: 1,
    name: 'Test Schema',
    workspace_id: 1,
    config: {},
    archived_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  };
}

/**
 * Creates multiple mock schemas
 */
export function createMockSchemas(count: number, baseOverrides: Partial<ContentSchemaRow> = {}): ContentSchemaRow[] {
  return Array.from({ length: count }, (_, i) =>
    createMockSchema({
      id: i + 1,
      name: `Schema ${i + 1}`,
      ...baseOverrides
    })
  );
}

/**
 * Creates a mock workspace object
 */
export function createMockWorkspace(overrides: { id?: number; name?: string } = {}) {
  return {
    id: 1,
    name: 'Test Workspace',
    ...overrides
  };
}

// ============================================================================
// API Module Mock Setup Helpers
// ============================================================================

/**
 * Sets up ContentApi mock with default responses
 */
export function setupContentApiMock(options: {
  listContentItems?: ContentItemRow[];
  deleteContentItem?: any;
  updateContentItem?: any;
} = {}) {
  const ContentApi = vi.hoisted(() => ({
    listContentItems: vi.fn(),
    deleteContentItem: vi.fn(),
    updateContentItem: vi.fn()
  }));

  // Set default mock implementations
  ContentApi.listContentItems.mockResolvedValue(
    createApiResponse(options.listContentItems || [])
  );

  ContentApi.deleteContentItem.mockResolvedValue(
    options.deleteContentItem !== undefined
      ? options.deleteContentItem
      : createApiResponse({ success: true })
  );

  ContentApi.updateContentItem.mockResolvedValue(
    options.updateContentItem !== undefined
      ? options.updateContentItem
      : createApiResponse({ success: true })
  );

  return ContentApi;
}

/**
 * Sets up SchemaApi mock with default responses
 */
export function setupSchemaApiMock(options: {
  listSchemas?: ContentSchemaRow[];
  createSchema?: any;
  updateSchema?: any;
  deleteSchema?: any;
} = {}) {
  const SchemaApi = vi.hoisted(() => ({
    listSchemas: vi.fn(),
    createSchema: vi.fn(),
    updateSchema: vi.fn(),
    deleteSchema: vi.fn()
  }));

  // Set default mock implementations
  SchemaApi.listSchemas.mockResolvedValue(
    createApiResponse(options.listSchemas || [])
  );

  SchemaApi.createSchema.mockResolvedValue(
    options.createSchema !== undefined
      ? options.createSchema
      : createApiResponse({ id: 1 })
  );

  SchemaApi.updateSchema.mockResolvedValue(
    options.updateSchema !== undefined
      ? options.updateSchema
      : createApiResponse({ success: true })
  );

  SchemaApi.deleteSchema.mockResolvedValue(
    options.deleteSchema !== undefined
      ? options.deleteSchema
      : createApiResponse({ success: true })
  );

  return SchemaApi;
}

// ============================================================================
// Common Mock Implementations
// ============================================================================

/**
 * Creates a mock implementation for useToast hook
 */
export function createMockUseToast() {
  const toast = vi.fn();
  return () => ({ toast });
}

/**
 * Creates a mock implementation for useWorkspace hook
 */
export function createMockUseWorkspace(options: {
  currentWorkspace?: any;
  workspaces?: any[];
  isLoading?: boolean;
} = {}) {
  return () => ({
    currentWorkspace: options.currentWorkspace || createMockWorkspace(),
    workspaces: options.workspaces || [createMockWorkspace()],
    isLoading: options.isLoading || false,
    setCurrentWorkspace: vi.fn(),
    refreshWorkspaces: vi.fn()
  });
}

/**
 * Creates a mock WorkspaceProvider component
 */
export function createMockWorkspaceProvider() {
  return ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
}

/**
 * Creates a mock implementation for useDebounceCallback hook
 */
export function createMockUseDebounceCallback() {
  return (callback: Function) => {
    const debouncedFn = callback as any;
    debouncedFn.cancel = vi.fn();
    return debouncedFn;
  };
}

/**
 * Creates a mock implementation for useLocation hook
 */
export function createMockUseLocation(initialLocation: {
  pathname?: string;
  search?: string;
  hash?: string;
  state?: any;
  key?: string;
} = {}) {
  return vi.fn(() => ({
    pathname: initialLocation.pathname || '/manager',
    search: initialLocation.search || '',
    hash: initialLocation.hash || '',
    state: initialLocation.state || null,
    key: initialLocation.key || 'default'
  }));
}

/**
 * Creates a mock implementation for useNavigate hook
 */
export function createMockUseNavigate() {
  const navigateFn = vi.fn();
  return vi.fn(() => navigateFn);
}

// ============================================================================
// Complete Mock Setups
// ============================================================================

/**
 * Returns all common mocks needed for ContentManagerPage tests
 */
export function getContentManagerPageMocks(options: {
  contentItems?: ContentItemRow[];
  schemas?: ContentSchemaRow[];
  location?: { pathname?: string; search?: string };
} = {}) {
  return {
    contentApi: {
      listContentItems: vi.fn().mockResolvedValue(
        createApiResponse(options.contentItems || [])
      ),
      deleteContentItem: vi.fn().mockResolvedValue(
        createApiResponse({ success: true })
      ),
      updateContentItem: vi.fn().mockResolvedValue(
        createApiResponse({ success: true })
      )
    },
    schemaApi: {
      listSchemas: vi.fn().mockResolvedValue(
        createApiResponse(options.schemas || [])
      )
    },
    useToast: createMockUseToast(),
    useWorkspace: createMockUseWorkspace(),
    useDebounceCallback: createMockUseDebounceCallback(),
    useLocation: createMockUseLocation(options.location),
    useNavigate: createMockUseNavigate(),
    WorkspaceProvider: createMockWorkspaceProvider()
  };
}

/**
 * Returns all common mocks needed for ContentSchemaBuilderPage tests
 */
export function getSchemaBuilderPageMocks(options: {
  schemas?: ContentSchemaRow[];
} = {}) {
  return {
    schemaApi: {
      listSchemas: vi.fn().mockResolvedValue(
        createApiResponse(options.schemas || [])
      ),
      createSchema: vi.fn().mockResolvedValue(
        createApiResponse({ id: 1 })
      ),
      updateSchema: vi.fn().mockResolvedValue(
        createApiResponse({ success: true })
      ),
      deleteSchema: vi.fn().mockResolvedValue(
        createApiResponse({ success: true })
      )
    },
    useToast: createMockUseToast(),
    useWorkspace: createMockUseWorkspace(),
    WorkspaceProvider: createMockWorkspaceProvider()
  };
}

// ============================================================================
// Mock Setup Utilities
// ============================================================================

/**
 * Updates the mock implementation of useLocation
 * Useful for simulating navigation changes in tests
 */
export function updateMockLocation(
  useLocationMock: ReturnType<typeof createMockUseLocation>,
  location: {
    pathname?: string;
    search?: string;
    hash?: string;
    state?: any;
    key?: string;
  }
) {
  useLocationMock.mockImplementation(() => ({
    pathname: location.pathname || '/manager',
    search: location.search || '',
    hash: location.hash || '',
    state: location.state || null,
    key: location.key || 'default'
  }));
}

/**
 * Updates the mock response for an API call
 */
export function updateApiMockResponse<T>(
  mockFn: ReturnType<typeof vi.fn>,
  data: T,
  error?: { message: string; code?: string }
) {
  if (error) {
    mockFn.mockResolvedValue(createApiError(error.message, error.code));
  } else {
    mockFn.mockResolvedValue(createApiResponse(data));
  }
}
