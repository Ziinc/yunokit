import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ContentItemEditor } from '@/components/Content/ContentItemEditor';
import { ContentSchemaRow } from '../../src/lib/api/SchemaApi';

// Mock the TiptapEditor component
vi.mock('@/components/Content/TiptapEditor', () => ({
  TiptapEditor: ({ schema, content, onChange }: any) => (
    <div data-testid="tiptap-editor" data-schema={schema.name} data-strict={schema.strict}>
      <button onClick={() => onChange({ ...content, title: 'Updated Title', content: 'updated content' })}>
        Update Content
      </button>
      {JSON.stringify(content)}
    </div>
  )
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid={`tab-trigger-${value}`} onClick={onClick}>{children}</button>
  )
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => (
    asChild ? children : <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Info: () => <div data-testid="info-icon" />
}));

describe('ContentItemEditor', () => {
  const mockOnSave = vi.fn();

  const mockStrictSchema: ContentSchema = {
    id: '1',
    name: 'Test Schema',
    description: 'Test description',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true,
        description: 'The title of the content'
      },
      {
        id: 'content',
        name: 'Content',
        type: 'text',
        required: false,
        description: 'The main content'
      },
      {
        id: 'published',
        name: 'Published',
        type: 'boolean',
        required: false,
        defaultValue: false
      }
    ],
    isCollection: false,
    strict: true,
    type: 'single'
  };

  const mockFlexibleSchema: ContentSchema = {
    ...mockStrictSchema,
    strict: false
  };

  const mockContent = {
    title: 'Test Title',
    content: 'Test content',
    published: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with strict schema', () => {
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Edit Test Schema')).toBeDefined();
      expect(screen.getByTestId('tiptap-editor')).toBeDefined();
      expect(screen.getByText('Save')).toBeDefined();
    });

    it('renders with flexible schema and shows flexible indicator', () => {
      render(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Edit Test Schema')).toBeDefined();
      expect(screen.getByTestId('info-icon')).toBeDefined();
      expect(screen.getByText('Flexible Schema')).toBeDefined();
    });

    it('shows collection edit title when schema is collection', () => {
      const collectionSchema = { ...mockStrictSchema, isCollection: true };
      
      render(
        <ContentItemEditor
          schema={collectionSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Edit Item')).toBeDefined();
    });

    it('renders both tabs (Content Fields and JSON Preview)', () => {
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('tab-trigger-fields')).toBeDefined();
      expect(screen.getByTestId('tab-trigger-json')).toBeDefined();
    });
  });

  describe('Content Initialization', () => {
    it('initializes content with provided initial content', () => {
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const editorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(editorContent).toContain('Test Title');
      expect(editorContent).toContain('Test content');
    });

    it('initializes with default values when no initial content provided', () => {
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={{}}
          onSave={mockOnSave}
        />
      );

      const editorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(editorContent).toContain('published":false'); // Default boolean value
    });

    it('initializes different field types with correct defaults', () => {
      const multiTypeSchema: ContentSchema = {
        ...mockStrictSchema,
        fields: [
          { id: 'text-field', name: 'Text', type: 'text', required: false },
          { id: 'number-field', name: 'Number', type: 'number', required: false },
          { id: 'bool-field', name: 'Enabled', type: 'boolean', required: false }
        ]
      };

      render(
        <ContentItemEditor
          schema={multiTypeSchema}
          initialContent={{}}
          onSave={mockOnSave}
        />
      );

      const editorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(editorContent).toContain('text-field":""');
      expect(editorContent).toContain('number-field":0');
      expect(editorContent).toContain('bool-field":false');
    });
  });

  describe('Content Updates', () => {
    it('updates content when TiptapEditor calls onChange', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const updateButton = screen.getByText('Update Content');
      await user.click(updateButton);

      const editorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(editorContent).toContain('Updated Title');
      expect(editorContent).toContain('updated content');
    });

    it('calls onSave with updated content when save button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const updateButton = screen.getByText('Update Content');
      await user.click(updateButton);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Title',
        content: 'updated content',
        published: true
      });
    });
  });

  describe('Validation', () => {
    it('prevents saving when required fields are missing in strict schema', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={{ content: 'Only content, no title' }}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Required fields missing',
        description: 'Please fill in the following fields: Title',
        variant: 'destructive'
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('allows saving when all required fields are present in strict schema', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={{ title: 'Valid Title', content: 'Some content' }}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Content saved',
        description: 'Your content has been saved successfully'
      });
    });

    it('validates flexible schema by checking for editor content', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={{}}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No content to save',
        description: 'Please add some content before saving',
        variant: 'destructive'
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('allows saving flexible schema when editor content exists', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={{ content: [], schema: {} }}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('switches between content fields and JSON preview tabs', async () => {
      const user = userEvent.setup();

      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      // Should start on fields tab
      expect(screen.getByTestId('tab-content-fields')).toBeDefined();

      // Switch to JSON tab using testid
      const jsonTabButton = screen.getByTestId('tab-trigger-json');
      await user.click(jsonTabButton);

      expect(screen.getByTestId('tab-content-json')).toBeDefined();
    });

    it('shows JSON preview with syntax highlighting', async () => {
      const user = userEvent.setup();
      
      render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const jsonTabButton = screen.getByTestId('tab-trigger-json');
      await user.click(jsonTabButton);

      expect(screen.getByTestId('tab-content-json')).toBeDefined();
      expect(screen.getByTestId('card')).toBeDefined();
    });

    it('shows different JSON content for flexible vs strict schemas', async () => {
      const user = userEvent.setup();
      
      const flexibleContent = {
        content: [],
        schema: {},
        title: 'Test'
      };

      const { rerender } = render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const jsonTabButton = screen.getByTestId('tab-trigger-json');
      await user.click(jsonTabButton);

      // For strict schema, should show the content directly
      expect(screen.getByTestId('tab-content-json')).toBeDefined();

      // Rerender with flexible schema
      rerender(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={flexibleContent}
          onSave={mockOnSave}
        />
      );

      // For flexible schema, should show content structure
      expect(screen.getByTestId('tab-content-json')).toBeDefined();
    });
  });

  describe('Flexible Schema Features', () => {
    it('shows flexible schema tooltip', () => {
      render(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('info-icon')).toBeDefined();
      expect(screen.getByText('Flexible Schema')).toBeDefined();
    });

    it('passes flexible schema to TiptapEditor', () => {
      render(
        <ContentItemEditor
          schema={mockFlexibleSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const tiptapEditor = screen.getByTestId('tiptap-editor');
      expect(tiptapEditor).toHaveAttribute('data-strict', 'false');
    });
  });

  describe('Error Handling', () => {
    it('handles multiple missing required fields', async () => {
      const user = userEvent.setup();
      const schemaWithMultipleRequired: ContentSchema = {
        ...mockStrictSchema,
        fields: [
          { id: 'title', name: 'Title', type: 'text', required: true },
          { id: 'author', name: 'Author', type: 'text', required: true },
          { id: 'content', name: 'Content', type: 'text', required: false }
        ]
      };
      
      render(
        <ContentItemEditor
          schema={schemaWithMultipleRequired}
          initialContent={{ content: 'Only content' }}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Required fields missing',
        description: 'Please fill in the following fields: Title, Author',
        variant: 'destructive'
      });
    });

    it('handles empty schema fields array', () => {
      const emptySchema: ContentSchema = {
        ...mockStrictSchema,
        fields: []
      };

      render(
        <ContentItemEditor
          schema={emptySchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('tiptap-editor')).toBeDefined();
    });
  });

  describe('Content Persistence', () => {
    it('preserves existing content when schema changes', () => {
      const { rerender } = render(
        <ContentItemEditor
          schema={mockStrictSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const editorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(editorContent).toContain('Test Title');

      // Rerender with new schema but same content
      const newSchema = { ...mockStrictSchema, name: 'Updated Schema' };
      rerender(
        <ContentItemEditor
          schema={newSchema}
          initialContent={mockContent}
          onSave={mockOnSave}
        />
      );

      const updatedEditorContent = screen.getByTestId('tiptap-editor').textContent;
      expect(updatedEditorContent).toContain('Test Title');
    });
  });
});
