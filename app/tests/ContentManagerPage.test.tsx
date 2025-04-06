import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ContentManagerPage from '@/pages/ContentManagerPage';
import { ContentApi } from '@/lib/api';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ContentItem, ContentSchema } from '@/lib/contentSchema';

// Mock the API
vi.mock('@/lib/api', () => ({
  ContentApi: {
    getContentItems: vi.fn(),
    getSchemas: vi.fn(),
  },
}));

describe('ContentManagerPage', () => {
  const mockSchemas: ContentSchema[] = [
    { id: 'blog', name: 'Blog Post', fields: [], type: 'collection' },
    { id: 'page', name: 'Page', fields: [], type: 'single' },
  ];

  const mockItems: ContentItem[] = [
    { 
      id: '1', 
      title: 'Blog 1', 
      schemaId: 'blog', 
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {},
    },
    { 
      id: '2', 
      title: 'Page 1', 
      schemaId: 'page', 
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (ContentApi.getContentItems as any).mockResolvedValue(mockItems);
    (ContentApi.getSchemas as any).mockResolvedValue(mockSchemas);
  });

  it('should apply schema filter from URL parameters', async () => {
    // Render with URL parameter
    render(
      <MemoryRouter initialEntries={['/manager?schema-id=blog']}>
        <Routes>
          <Route path="/manager" element={<ContentManagerPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Blog 1')).toBeInTheDocument();
      expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
    });

    // Verify schema filter is selected in the UI
    const schemaSelect = screen.getByRole('combobox', { name: /content schema/i });
    expect(schemaSelect).toHaveValue('blog');
  });
}); 