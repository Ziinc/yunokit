import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mocked, MockedFunction } from 'vitest';
import ContentManagerPage from '../src/pages/ContentManagerPage';
import { act } from 'react-dom/test-utils';
import { render } from './utils/test-utils';
import {listContentItems} from '../src/lib/api/ContentApi';
import {listSchemas, getSchema} from '../src/lib/api/SchemaApi';
import userEvent from '@testing-library/user-event';
// Import helpers after mocks are set up
import {
  createMockContentItem,
  createMockSchema,
  createSingleTypeSchema,
  createCollectionTypeSchema,
  createApiResponse,
} from './utils/mock-helpers';
import { useLocation, useNavigate } from 'react-router-dom';


// Setup API mocks
vi.mock('../src/lib/api/ContentApi');
vi.mock('../src/lib/api/SchemaApi');
vi.mock('../src/lib/contexts/WorkspaceContext');

// Setup router mocks


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({
      pathname: '/manager',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    })),
    useNavigate: vi.fn()
  };
});

let mockNavigate = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  (useNavigate as MockedFunction<typeof useNavigate>).mockReturnValue(mockNavigate);
});

describe('ContentManagerPage', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
      createApiResponse([
        createMockContentItem({ id: 1, title: 'Test Content 1', schema_id: 1 }),
        createMockContentItem({ id: 2, title: 'Test Content 2', schema_id: 2})
      ])
    );
    (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
      createApiResponse([ 
        createMockSchema({ id: 1, name: 'Test schema 1', type: 'single' }),
        createMockSchema({ id: 2, name: 'Test schema 2', type: 'collection' })
        
      ])
    );

  });
  it('mounts and loads data correctly', async () => {
    render(<ContentManagerPage />);
    await screen.findByText('Create new content');
    await screen.findByText('Test Content 1');
    await waitFor(async () => {
      expect(listContentItems).toHaveBeenCalled();
      expect(listSchemas).toHaveBeenCalled();
    });
    await screen.findByText('Test schema 1');
    await screen.findByText('Test schema 2');
  });
});


describe.todo('ContentManagerPage filters', () => {

  beforeEach(() => {
    // Reset location to default

    // Re-setup mock responses (they get cleared by vi.clearAllMocks)
    (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
      createApiResponse([
        createMockContentItem({ id: 1, title: 'first', schema_id: 1,  }),
        createMockContentItem({ id: 2, title: 'second', schema_id: 2 })
      ])
    );

    (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
      createApiResponse([
        createMockSchema({ id: 1, name: 'Blog Post', type: 'collection' }),
        createMockSchema({ id: 2, name: 'Article', type: 'collection' })
      ])
    );
  });

  it('search filter works correctly', async () => {
    // Mock useLocation to return query parameters (using schema id)
    (useLocation as MockedFunction<typeof useLocation>).mockReturnValue({
      pathname: '/manager',
      search: '?search=second',
      key: 'test',
      state: null,
      hash: ''
    });

    render(<ContentManagerPage />);
  
    // sets the input
    const searchInput = await screen.findByPlaceholderText('Search by title...');
    expect(searchInput.getAttribute('value')).toBe('second');

    // client side filtering
    expect(await screen.findByText('second')).toBeTruthy();
    expect(await screen.queryByText('first')).toBeNull();
  });

  it('applies filters when navigating to a URL with query parameters', async () => {
    // First render with no parameters
    const { rerender } = render(<ContentManagerPage />);

    // Verify default state
    await waitFor(async () => {
      expect(await screen.findByText('All Schemas')).toBeTruthy();
    });

    // Now update the location to simulate navigation with query parameters (using schema id)
    (useLocation as MockedFunction<typeof useLocation>).mockReturnValue({
      pathname: '/manager',
      search: '?schema=1&search=draft',
      key: 'navigation',
      state: null,
      hash: ''
    });

    // Re-render to simulate navigation
    rerender(
        <ContentManagerPage />
    );

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
    (useLocation as MockedFunction<typeof useLocation>).mockReturnValue({
      pathname: '/manager',
      search: '?schema=2&search=test',
      key: 'test',
      state: null,
      hash: ''
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
    (useLocation as MockedFunction<typeof useLocation>).mockReturnValue({
      pathname: '/manager',
      search: '?sort=updatedAt',
      key: 'test',
      state: null,
      hash: ''
    });

    render(<ContentManagerPage />);
    
    // Verify sort is applied
    const input = await screen.findByLabelText('Sort by', { selector: 'input' });
    expect(input.getAttribute('value')).toBe('updatedAt');
  });

  describe('handleCreateNew - Single-Type Schema Validation', () => {

    it('calls getSchema API to check schema type', async () => {
      const singleSchema = createSingleTypeSchema({ id: 1, name: 'MyContentPage' });
      
      (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
        createApiResponse([singleSchema])
      );
      (getSchema as MockedFunction<typeof getSchema>).mockResolvedValue(
        createApiResponse(singleSchema)
      );
      (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
        createApiResponse([])
      );

      render(<ContentManagerPage />);

      await waitFor(async () => {
        expect(await screen.findByText('MyContentPage')).toBeDefined();
      });

      // Trigger create new by selecting schema from dropdown
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(async () => {
        const schemaOption = await screen.findByText('MyContentPage');
        fireEvent.click(schemaOption);
      });

      // Verify getSchema was called
      await waitFor(() => {
        expect(getSchema).toHaveBeenCalledWith(1, 1);
      });
    });

    it('calls listContentItemsBySchema for single-type schemas', async () => {
      const singleSchema = createSingleTypeSchema({ id: 1, name: 'MyContentPage' });
      
      (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
        createApiResponse([singleSchema])
      );
      (getSchema as MockedFunction<typeof getSchema>).mockResolvedValue(
        createApiResponse(singleSchema)
      );
      (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
        createApiResponse([])
      );

      render(<ContentManagerPage />);

      await waitFor(async () => {
        expect(await screen.findByText('MyContentPage')).toBeDefined();
      });

      // Trigger create new
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(async () => {
        const schemaOption = await screen.findByText('MyContentPage');
        fireEvent.click(schemaOption);
      });

      // Verify listContentItemsBySchema was called
      await waitFor(() => {
        expect(listContentItems).toHaveBeenCalledWith(1, 1);
      });
    });

    it('displays error toast when validation fails', async () => {
      const singleSchema = createSingleTypeSchema({ id: 1, name: 'MyContentPage' });
      const existingContent = [createMockContentItem({ id: 1, schema_id: 1 })];
      
      (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
        createApiResponse([singleSchema])
      );
      (getSchema as MockedFunction<typeof getSchema>).mockResolvedValue(
        createApiResponse(singleSchema)
      );
      (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
        createApiResponse(existingContent)
      );

      render(<ContentManagerPage />);

      await waitFor(async () => {
        expect(await screen.findByText('MyContentPage')).toBeDefined();
      });

      // Trigger create new
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(async () => {
        const schemaOption = await screen.findByText('MyContentPage');
        fireEvent.click(schemaOption);
      });

      await screen.findByText('Cannot create new content');
    });

    it('blocks navigation when single-type schema has existing content', async () => {
      const singleSchema = createSingleTypeSchema({ id: 1, name: 'MyContentPage' });
      const existingContent = [createMockContentItem({ id: 1, schema_id: 1 })];
      
      (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
        createApiResponse([singleSchema])
      );
      (getSchema as MockedFunction<typeof getSchema>).mockResolvedValue(
        createApiResponse(singleSchema)
      );
      (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
        createApiResponse(existingContent)
      );

      render(<ContentManagerPage />);

      await waitFor(async () => {
        expect(await screen.findByText('MyContentPage')).toBeDefined();
      });

      // Trigger create new
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(async () => {
        const schemaOption = await screen.findByText('MyContentPage');
        fireEvent.click(schemaOption);
      });

      // Verify navigation was NOT called
      await waitFor(() => {
        expect(useNavigate).not.toHaveBeenCalled();
      });
    });

    it('allows navigation for valid cases', async () => {
      const singleSchema = createSingleTypeSchema({ id: 1, name: 'Settings' });
      const collectionSchema = createCollectionTypeSchema({ id: 2, name: 'Blog Posts' });
      
      (listSchemas as MockedFunction<typeof listSchemas>).mockResolvedValue(
        createApiResponse([singleSchema, collectionSchema])
      );
      
      // Test single-type without content
      (getSchema as MockedFunction<typeof getSchema>).mockResolvedValue(
        createApiResponse(singleSchema)
      );
      (listContentItems as MockedFunction<typeof listContentItems>).mockResolvedValue(
        createApiResponse([])
      );

      render(<ContentManagerPage />);

      await waitFor(async () => {
        expect(await screen.findByText('Settings')).toBeDefined();
      });

      // Trigger create new
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      await waitFor(async () => {
        const schemaOption = await screen.findByText('MyContentPage');
        fireEvent.click(schemaOption);
      });

      // Verify navigation WAS called
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/manager/editor/1/new');
      });
    });
  });
});