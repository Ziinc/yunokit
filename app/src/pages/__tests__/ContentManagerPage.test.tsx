import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom';
import ContentManagerPage from '../ContentManagerPage';
import { mockContentItems, contentSchemas } from '@/lib/mocks';
import { act } from 'react-dom/test-utils';
import { ContentApi } from '@/lib/api';
import { BrowserRouter } from 'react-router-dom';

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

// Mock the ContentApi
vi.mock('@/lib/api', () => ({
  ContentApi: {
    getContentItems: vi.fn(),
    getSchemas: vi.fn(),
    saveContentItem: vi.fn(),
  },
}));

// Mock data
const mockContentItems = [
  {
    id: '1',
    title: 'Test Item 1',
    schemaId: 'blog-post',
    status: 'published',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user1@example.com',
    updatedBy: 'user1@example.com',
  },
  {
    id: '2',
    title: 'Test Item 2',
    schemaId: 'blog-post',
    status: 'published',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user1@example.com',
    updatedBy: 'user1@example.com',
  },
];

const mockSchemas = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    fields: [],
    isCollection: true,
  },
];

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

    // Setup mock responses
    ContentApi.getContentItems.mockResolvedValue(mockContentItems);
    ContentApi.getSchemas.mockResolvedValue(mockSchemas);
    ContentApi.saveContentItem.mockResolvedValue({});
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

describe('ContentManagerPage - Selection Actions', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock responses
    ContentApi.getContentItems.mockResolvedValue(mockContentItems);
    ContentApi.getSchemas.mockResolvedValue(mockSchemas);
    ContentApi.saveContentItem.mockResolvedValue({});
  });
  
  test('selection bar remains visible after changing author', async () => {
    render(
      <BrowserRouter>
        <ContentManagerPage />
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText('Loading content...')).not.toBeInTheDocument();
    });
    
    // Select items
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item checkbox (index 0 is header)
    fireEvent.click(checkboxes[2]); // Select second item checkbox
    
    // Verify selection bar appears
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    
    // Click change author button
    const changeAuthorButton = screen.getByText('Change Author');
    fireEvent.click(changeAuthorButton);
    
    // Select new author in dialog
    const authorSelect = screen.getByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = screen.getByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    
    // Click apply changes
    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify selection bar is still visible after author change
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
    
    // Verify selection actions are still available
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Change Author')).toBeInTheDocument();
  });
  
  test('selection bar shows correct count after changing author', async () => {
    render(
      <BrowserRouter>
        <ContentManagerPage />
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText('Loading content...')).not.toBeInTheDocument();
    });
    
    // Select one item
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item
    
    // Verify initial selection count
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    
    // Change author
    const changeAuthorButton = screen.getByText('Change Author');
    fireEvent.click(changeAuthorButton);
    
    // Select new author and apply
    const authorSelect = screen.getByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = screen.getByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify selection count remains the same
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });
  
  test('selection persists in table after changing author', async () => {
    render(
      <BrowserRouter>
        <ContentManagerPage />
      </BrowserRouter>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText('Loading content...')).not.toBeInTheDocument();
    });
    
    // Select items
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item
    
    // Change author
    const changeAuthorButton = screen.getByText('Change Author');
    fireEvent.click(changeAuthorButton);
    const authorSelect = screen.getByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = screen.getByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify checkbox remains checked
    await waitFor(() => {
      const updatedCheckboxes = screen.getAllByRole('checkbox');
      expect(updatedCheckboxes[1]).toBeChecked();
    });
  });
}); 