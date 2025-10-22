import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContentManagerPage from '../src/pages/ContentManagerPage';
import { act } from 'react-dom/test-utils';
import { render } from './utils/test-utils';
import * as ContentApi from '../src/lib/api/ContentApi';
import * as SchemaApi from '../src/lib/api/SchemaApi';

// Hoist mock creation to ensure they're available during module initialization
const mockContentApi = vi.hoisted(() => ({
  listContentItems: vi.fn(),
  deleteContentItem: vi.fn(),
  updateContentItem: vi.fn()
}));

const mockSchemaApi = vi.hoisted(() => ({
  listSchemas: vi.fn()
}));

const mockUseToast = vi.hoisted(() => () => ({ toast: vi.fn() }));

const mockUseWorkspace = vi.hoisted(() => () => ({
  currentWorkspace: { id: 1, name: 'Test Workspace' },
  workspaces: [{ id: 1, name: 'Test Workspace' }],
  isLoading: false,
  setCurrentWorkspace: vi.fn(),
  refreshWorkspaces: vi.fn()
}));

const mockWorkspaceProvider = vi.hoisted(() => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

const mockUseDebounceCallback = vi.hoisted(() => (callback: Function) => {
  const debouncedFn = callback as any;
  debouncedFn.cancel = vi.fn();
  return debouncedFn;
});

const mockUseLocation = vi.hoisted(() => vi.fn(() => ({
  pathname: '/manager',
  search: '',
  hash: '',
  state: null,
  key: 'default'
})));

const mockUseNavigate = vi.hoisted(() => vi.fn(() => vi.fn()));

// Setup API mocks
vi.mock('../src/lib/api/ContentApi', () => mockContentApi);
vi.mock('../src/lib/api/SchemaApi', () => mockSchemaApi);

// Setup hook mocks
vi.mock('../src/hooks/use-toast', () => ({
  useToast: mockUseToast
}));

vi.mock('../src/hooks/useDebounceCallback', () => ({
  useDebounceCallback: mockUseDebounceCallback
}));

vi.mock('../src/lib/contexts/WorkspaceContext', () => ({
  useWorkspace: mockUseWorkspace,
  WorkspaceProvider: mockWorkspaceProvider
}));

// Setup router mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: mockUseLocation,
    useNavigate: mockUseNavigate
  };
});

import { useLocation } from 'react-router-dom';
import type { Mock } from 'vitest';
const useLocationMock = useLocation as Mock;

// Import helpers after mocks are set up
import {
  createMockContentItem,
  createMockSchema,
  updateMockLocation,
  createApiResponse
} from './utils/mock-helpers';

describe('ContentManagerPage', () => {

  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();

    // Reset location to default
    updateMockLocation(useLocationMock, {
      pathname: '/manager',
      search: '',
      key: 'default'
    });

    // Re-setup mock responses (they get cleared by vi.clearAllMocks)
    mockContentApi.listContentItems.mockResolvedValue(
      createApiResponse([
        createMockContentItem({ id: 1, title: 'Test Content 1', schema_id: 1, published_at: null }),
        createMockContentItem({ id: 2, title: 'Test Content 2', schema_id: 2, published_at: '2024-01-02T00:00:00Z' })
      ])
    );

    mockSchemaApi.listSchemas.mockResolvedValue(
      createApiResponse([
        createMockSchema({ id: 1, name: 'Blog Post' }),
        createMockSchema({ id: 2, name: 'Article' })
      ])
    );
  });

  it('loads with default filter values when no query parameters are provided', async () => {
    render(<ContentManagerPage />);

    // Verify default values are set
    await waitFor(async () => {
      expect(await screen.findByText('All Schemas')).toBeTruthy();
      // Note: Status and Author filters removed with draft/review features
    });
  });

  it('updates filter values from URL query parameters', async () => {
    // Mock useLocation to return query parameters (using schema id)
    updateMockLocation(useLocationMock, {
      pathname: '/manager',
      search: '?schema=2&search=test',
      key: 'test'
    });

    render(<ContentManagerPage />);

    // Verify filter values are updated from URL
    await waitFor(async () => {
      // Check that the search input has the correct value
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('test');

      // Check schema filter value
      expect(await screen.findByText('Article')).toBeTruthy();
      // Note: Status and Author filters removed with draft/review features
    });
  });

  it('applies filters when navigating to a URL with query parameters', async () => {
    // First render with no parameters
    const { rerender } = render(<ContentManagerPage />);

    // Verify default state
    await waitFor(async () => {
      expect(await screen.findByText('All Schemas')).toBeTruthy();
    });

    // Now update the location to simulate navigation with query parameters (using schema id)
    updateMockLocation(useLocationMock, {
      pathname: '/manager',
      search: '?schema=1&search=draft',
      key: 'navigation'
    });

    // Re-render to simulate navigation
    act(() => {
      rerender(
          <ContentManagerPage />
      );
    });

    // Verify filter values have updated after navigation
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('draft');
      expect(await screen.findByText('Blog Post')).toBeTruthy();
      // Note: Status filter removed with draft/review features
    });
  });

  it('correctly resets filters when clicking the reset button', async () => {
    // Start with filters applied (using schema id)
    updateMockLocation(useLocationMock, {
      pathname: '/manager',
      search: '?schema=2&search=test',
      key: 'test'
    });

    render(<ContentManagerPage />);

    // Verify initial filter values
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('test');
      expect(await screen.findByText('Article')).toBeTruthy();
    });

    // Click the reset button
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    // Verify filters were reset
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('');
      expect(await screen.findByText('All Schemas')).toBeTruthy();
      // Note: Status filter removed with draft/review features
    });
  });

  it('correctly applies sort parameter from URL', async () => {
    // Render with sort parameter
    updateMockLocation(useLocationMock, {
      pathname: '/manager',
      search: '?sort=updatedAt',
      key: 'test'
    });

    render(<ContentManagerPage />);
    
    // Verify sort is applied
    await waitFor(async () => {
      // Check that the sort dropdown shows the correct value
      expect(await screen.findByText('Last Updated')).toBeTruthy();
    });
  });
});

// Note: Author management tests removed as this feature was removed along with draft/review features 