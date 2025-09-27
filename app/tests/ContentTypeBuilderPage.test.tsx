import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from './utils/test-utils';
import ContentSchemaBuilderPage from '../src/pages/ContentSchemaBuilderPage';
import * as SchemaApi from '../src/lib/api/SchemaApi';

// Mock the APIs
vi.mock('../src/lib/api/SchemaApi', () => ({
  listSchemas: vi.fn(),
  createSchema: vi.fn(),
  updateSchema: vi.fn(),
  deleteSchema: vi.fn()
}));

vi.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('../src/lib/contexts/WorkspaceContext', () => ({
  useWorkspace: () => ({
    workspace: { id: 1, name: 'Test Workspace' }
  }),
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ContentSchemaBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SchemaApi.listSchemas as any).mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Blog Post',
          type: 'Collection',
          description: 'Blog post schema',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'content', type: 'markdown' },
            { name: 'published', type: 'boolean' }
          ],
          created_at: '2023-01-01T00:00:00Z'
        }
      ],
      error: null
    });
  });

  const renderPage = () => {
    return render(<ContentSchemaBuilderPage />);
  };

  describe('Table Rendering', () => {
    it('renders schema table with correct columns', async () => {
      renderPage();
      
      // Check for schema table headers
      expect(await screen.findByRole('columnheader', { name: /name/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /fields/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /description/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeDefined();
    });

    it('displays correct schema data in table', async () => {
      renderPage();
      
      // Check first schema row
      expect(await screen.findByText('Blog Post')).toBeDefined();
      expect(screen.getByText('Collection')).toBeDefined();
      expect(screen.getByText('3 fields')).toBeDefined();
    });
  });
}); 