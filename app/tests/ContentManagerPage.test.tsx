import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContentManagerPage from '../src/pages/ContentManagerPage';
import { act } from 'react-dom/test-utils';
import { render } from './utils/test-utils';
import * as ContentApi from '../src/lib/api/ContentApi';
import * as SchemaApi from '../src/lib/api/SchemaApi';

// Mock API modules
vi.mock('../src/lib/api/ContentApi', () => ({
  listContentItems: vi.fn(),
  deleteContentItem: vi.fn(),
  updateContentItem: vi.fn()
}));

vi.mock('../src/lib/api/SchemaApi', () => ({
  listSchemas: vi.fn()
}));

vi.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('../src/hooks/useDebounceCallback', () => ({
  useDebounceCallback: (callback: Function) => {
    const debouncedFn = callback;
    debouncedFn.cancel = vi.fn();
    return debouncedFn;
  }
}));

vi.mock('../src/lib/contexts/WorkspaceContext', () => ({
  useWorkspace: () => ({
    currentWorkspace: { id: 1, name: 'Test Workspace' },
    workspaces: [{ id: 1, name: 'Test Workspace' }],
    isLoading: false
  }),
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useLocation: vi.fn(), useNavigate: vi.fn(() => vi.fn()) };
});
import { useLocation } from 'react-router-dom';
import type { Mock } from 'vitest';
const useLocationMock = useLocation as Mock;

const mockContentItems = [
  {
    id: 1,
    title: 'Test Content 1',
    schema_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    published_at: null,
    data: {}
  },
  {
    id: 2,
    title: 'Test Content 2',
    schema_id: 2,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    published_at: '2024-01-02T00:00:00Z',
    data: {}
  }
];

const mockSchemas = [
  { id: 1, name: 'Blog Post', workspace_id: 1, config: {}, archived_at: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Article', workspace_id: 1, config: {}, archived_at: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
];


describe('ContentManagerPage', () => {

  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
    
    // Mock the useLocation implementation for each test
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }));

    // Setup mock responses
    (ContentApi.listContentItems as any).mockResolvedValue({ data: mockContentItems });
    (SchemaApi.listSchemas as any).mockResolvedValue({ data: mockSchemas });
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
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?schema=2&search=test',
      hash: '',
      state: null,
      key: 'test',
    }));

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
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?schema=1&search=draft',
      hash: '',
      state: null,
      key: 'navigation',
    }));

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
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?schema=2&search=test',
      hash: '',
      state: null,
      key: 'test',
    }));

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
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?sort=updatedAt',
      hash: '',
      state: null,
      key: 'test',
    }));

    render(<ContentManagerPage />);
    
    // Verify sort is applied
    await waitFor(async () => {
      // Check that the sort dropdown shows the correct value
      expect(await screen.findByText('Last Updated')).toBeTruthy();
    });
  });
});

// Note: Author management tests removed as this feature was removed along with draft/review features 