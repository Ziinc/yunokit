import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from './utils/test-utils';
import ContentSchemaBuilderPage from '../src/pages/ContentSchemaBuilderPage';
import * as SchemaApi from '../src/lib/api/SchemaApi';
import useSWR from 'swr';

const schemaApiMock = vi.hoisted(() => ({
  listSchemas: vi.fn(),
  createSchema: vi.fn(),
  updateSchema: vi.fn(),
  deleteSchema: vi.fn(),
}));

vi.mock('@/lib/api/SchemaApi', () => schemaApiMock);
vi.mock('../src/lib/api/SchemaApi', () => schemaApiMock);

vi.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const workspaceMock = vi.hoisted(() => ({
  useWorkspace: () => ({
    currentWorkspace: { id: 1, name: 'Test Workspace' }
  }),
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/lib/contexts/WorkspaceContext', () => workspaceMock);
vi.mock('../src/lib/contexts/WorkspaceContext', () => workspaceMock);

const schemaResponse = vi.hoisted(() => ({
  data: [
    {
      id: 1,
      name: 'Blog Post',
      type: 'collection',
      description: 'Blog post schema',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'markdown' },
        { name: 'published', type: 'boolean' }
      ],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    }
  ],
  error: null
}));

const useSWRMock = useSWR as unknown as ReturnType<typeof vi.fn>;

describe('ContentSchemaBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SchemaApi.listSchemas as any).mockResolvedValue(schemaResponse);
    useSWRMock.mockReturnValue({
      data: schemaResponse,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    } as any);
  });

  const renderPage = () => {
    return render(<ContentSchemaBuilderPage />);
  };

  describe('Table Rendering', () => {
    it('renders schema table with correct columns', async () => {
      renderPage();
      const headerMatchers = ['name', 'type', 'fields', 'description', 'last updated'];

      await screen.findByRole('columnheader', { name: /name/i });
      headerMatchers.forEach((label) => {
        expect(screen.getByRole('columnheader', { name: new RegExp(label, 'i') })).toBeDefined();
      });
    });

    it('displays correct schema data in table', async () => {
      renderPage();
      const [schema] = schemaResponse.data;
      const rowTexts = [schema.name, 'Collection', `${schema.fields.length} fields`];

      await screen.findByText(rowTexts[0]);
      rowTexts.forEach((text) => {
        expect(screen.getByText(text)).toBeDefined();
      });
    });
  });
});