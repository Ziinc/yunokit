import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom';
import ContentManagerPage from '../ContentManagerPage';
import { mockContentItems, contentSchemas } from '@/lib/mocks';
import { act } from 'react-dom/test-utils';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: vi.fn(() => ({
      pathname: '/manager',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })),
  };
});

// Mock the content schemas and items
vi.mock('@/lib/mocks', () => ({
  mockContentItems: [
    {
      id: '1',
      title: 'Test Article',
      schemaId: 'article',
      status: 'published',
      createdBy: 'user1@example.com',
      updatedBy: 'user2@example.com',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Draft Post',
      schemaId: 'blog',
      status: 'draft',
      createdBy: 'user2@example.com',
      updatedBy: 'user2@example.com',
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-04T00:00:00.000Z',
    },
  ],
  contentSchemas: [
    { id: 'article', name: 'Article' },
    { id: 'blog', name: 'Blog Post' },
  ],
}));

describe('ContentManagerPage', () => {
  // Helper function to render the component with specific query parameters
  const renderWithRouter = (queryParams: string = '') => {
    const routes = [
      {
        path: '/manager',
        element: <ContentManagerPage />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: [`/manager${queryParams}`],
    });

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
    
    // Mock the useLocation implementation for each test
    const useLocationMock = vi.spyOn(require('react-router-dom'), 'useLocation');
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }));
  });

  it('loads with default filter values when no query parameters are provided', async () => {
    renderWithRouter();
    
    // Verify default values are set
    await waitFor(() => {
      expect(screen.getByText('All Schemas')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByText('All Authors')).toBeInTheDocument();
    });
  });

  it('updates filter values from URL query parameters', async () => {
    // Mock useLocation to return query parameters
    const useLocationMock = vi.spyOn(require('react-router-dom'), 'useLocation');
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?status=published&schema=article&author=user1@example.com&search=test',
      hash: '',
      state: null,
      key: 'test',
    }));

    renderWithRouter('?status=published&schema=article&author=user1@example.com&search=test');
    
    // Verify filter values are updated from URL
    await waitFor(() => {
      // Check that the search input has the correct value
      const searchInput = screen.getByPlaceholderText('Search by title...');
      expect(searchInput).toHaveValue('test');
      
      // Check other filter values
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Article')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
  });

  it('applies filters when navigating to a URL with query parameters', async () => {
    // First render with no parameters
    const { rerender } = renderWithRouter();
    
    // Verify default state
    await waitFor(() => {
      expect(screen.getByText('All Schemas')).toBeInTheDocument();
    });
    
    // Now update the location to simulate navigation with query parameters
    const useLocationMock = vi.spyOn(require('react-router-dom'), 'useLocation');
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?status=draft&schema=blog&search=draft',
      hash: '',
      state: null,
      key: 'navigation',
    }));
    
    // Re-render to simulate navigation
    act(() => {
      rerender(
        <RouterProvider 
          router={createMemoryRouter([
            { path: '/manager', element: <ContentManagerPage /> }
          ], { 
            initialEntries: ['/manager?status=draft&schema=blog&search=draft'] 
          })} 
        />
      );
    });
    
    // Verify filter values have updated after navigation
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by title...');
      expect(searchInput).toHaveValue('draft');
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Blog Post')).toBeInTheDocument();
    });
  });

  it('correctly resets filters when clicking the reset button', async () => {
    // Start with filters applied
    const useLocationMock = vi.spyOn(require('react-router-dom'), 'useLocation');
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?status=published&schema=article&search=test',
      hash: '',
      state: null,
      key: 'test',
    }));

    renderWithRouter('?status=published&schema=article&search=test');
    
    // Verify initial filter values
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by title...');
      expect(searchInput).toHaveValue('test');
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
    
    // Click the reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Verify filters were reset
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by title...');
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByText('All Schemas')).toBeInTheDocument();
    });
  });

  it('correctly applies sort parameter from URL', async () => {
    // Render with sort parameter
    const useLocationMock = vi.spyOn(require('react-router-dom'), 'useLocation');
    useLocationMock.mockImplementation(() => ({
      pathname: '/manager',
      search: '?sort=updatedAt',
      hash: '',
      state: null,
      key: 'test',
    }));

    renderWithRouter('?sort=updatedAt');
    
    // Verify sort is applied
    await waitFor(() => {
      // Check that the sort dropdown shows the correct value
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });
  });
}); 