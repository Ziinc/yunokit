import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContentManagerPage from '../src/pages/ContentManagerPage';
import { act } from 'react-dom/test-utils';
import { render } from './utils/test-utils';
import { ContentApi } from '../src/lib/api/ContentApi';

const mockContentItems = [
  {
    id: '1',
    title: 'Test Content 1',
    status: 'draft',
    schema: 'blog',
    author: 'user1@example.com',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Test Content 2',
    status: 'published',
    schema: 'article',
    author: 'user2@example.com',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockSchemas = [
  { id: 'blog', name: 'Blog Post' },
  { id: 'article', name: 'Article' }
];


describe('ContentManagerPage', () => {

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
    (ContentApi.getContentItems as any).mockResolvedValue(mockContentItems);
    (ContentApi.getSchemas as any).mockResolvedValue(mockSchemas);
  });

  it('loads with default filter values when no query parameters are provided', async () => {
    render(<ContentManagerPage />);
    
    // Verify default values are set
    await waitFor(async () => {
      expect(await screen.findByText('All Schemas')).toBeTruthy();
      expect(await screen.findByText('All Statuses')).toBeTruthy();
      expect(await screen.findByText('All Authors')).toBeTruthy();
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

    render(<ContentManagerPage />);
    
    // Verify filter values are updated from URL
    await waitFor(async () => {
      // Check that the search input has the correct value
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('test');
      
      // Check other filter values
      expect(await screen.findByText('Published')).toBeTruthy();
      expect(await screen.findByText('Article')).toBeTruthy();
      expect(await screen.findByText('user1')).toBeTruthy();
    });
  });

  it('applies filters when navigating to a URL with query parameters', async () => {
    // First render with no parameters
    const { rerender } = render(<ContentManagerPage />);
    
    // Verify default state
    await waitFor(async () => {
      expect(await screen.findByText('All Schemas')).toBeTruthy();
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
          <ContentManagerPage />
      );
    });
    
    // Verify filter values have updated after navigation
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('draft');
      expect(await screen.findByText('Draft')).toBeTruthy();
      expect(await screen.findByText('Blog Post')).toBeTruthy();
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

    render(<ContentManagerPage />);
    
    // Verify initial filter values
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('test');
      expect(await screen.findByText('Published')).toBeTruthy();
    });
    
    // Click the reset button
    const resetButton = await screen.findByText('Reset');
    fireEvent.click(resetButton);
    
    // Verify filters were reset
    await waitFor(async () => {
      const searchInput = await screen.findByPlaceholderText('Search by title...');
      expect(searchInput.getAttribute('value')).toBe('');
      expect(await screen.findByText('All Statuses')).toBeTruthy();
      expect(await screen.findByText('All Schemas')).toBeTruthy();
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

    render(<ContentManagerPage />);
    
    // Verify sort is applied
    await waitFor(async () => {
      // Check that the sort dropdown shows the correct value
      expect(await screen.findByText('Last Updated')).toBeTruthy();
    });
  });
});

describe('ContentManagerPage - Selection Actions', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock responses
    (ContentApi.getContentItems as any).mockResolvedValue(mockContentItems);
    (ContentApi.getSchemas as any).mockResolvedValue(mockSchemas);
  });
  
  it('selection bar remains visible after changing author', async () => {
    render(
          <ContentManagerPage />
    );
    
    // Wait for content to load
    await waitFor(async () => {
      expect(await screen.findByText('Loading content...')).toBeNull();
    });
    
    // Select items
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item checkbox (index 0 is header)
    fireEvent.click(checkboxes[2]); // Select second item checkbox
    
    // Verify selection bar appears
    expect(await screen.findByText('2 selected')).toBeTruthy();
    
    // Click change author button
    const changeAuthorButton = await screen.findByText('Change Author');
    fireEvent.click(changeAuthorButton);
    
    // Select new author in dialog
    const authorSelect = await screen.findByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = await screen.findByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    
    // Click apply changes
    const applyButton = await screen.findByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify selection bar is still visible after author change
    await waitFor(async () => {
      expect(await screen.findByText('2 selected')).toBeTruthy();
    });
    
    // Verify selection actions are still available
    expect(await screen.findByText('Download')).toBeTruthy();
    expect(await screen.findByText('Delete')).toBeTruthy();
    expect(await screen.findByText('Change Author')).toBeTruthy();
  });
  
  it('selection bar shows correct count after changing author', async () => {
    render(
          <ContentManagerPage />
    );
    
    // Wait for content to load
    await waitFor(async () => {
      expect(await screen.findByText('Loading content...')).toBeNull();
    });
    
    // Select one item
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item
    
    // Verify initial selection count
    expect(await screen.findByText('1 selected')).toBeTruthy();
    
    // Change author
    const changeAuthorButton = await screen.findByText('Change Author');
    fireEvent.click(changeAuthorButton);
    
    // Select new author and apply
    const authorSelect = await screen.findByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = await screen.findByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    const applyButton = await screen.findByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify selection count remains the same
    await waitFor(async () => {
      expect(await screen.findByText('1 selected')).toBeTruthy();
    });
  });
  
  it('selection persists in table after changing author', async () => {
    render(
          <ContentManagerPage />
    );
    
    // Wait for content to load
    await waitFor(async () => {
      expect(await screen.findByText('Loading content...')).toBeNull();
    });
    
    // Select items
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first item
    
    // Change author
    const changeAuthorButton = await screen.findByText('Change Author');
    fireEvent.click(changeAuthorButton);
    const authorSelect = await screen.findByRole('combobox');
    fireEvent.click(authorSelect);
    const newAuthorOption = await screen.findByText('user2@example.com');
    fireEvent.click(newAuthorOption);
    const applyButton = await screen.findByText('Apply Changes');
    fireEvent.click(applyButton);
    
    // Verify checkbox remains checked
    await waitFor(async () => {
      const updatedCheckboxes = await screen.findAllByRole('checkbox');
      expect(updatedCheckboxes[1].getAttribute('checked')).toBe('');
    });
  });
}); 