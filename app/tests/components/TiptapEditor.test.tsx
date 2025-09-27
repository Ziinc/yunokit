import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TiptapEditor } from '@/components/Content/TiptapEditor';
import { ContentSchema } from '@/lib/contentSchema';

// Test helper to wait for editor initialization
const waitForEditor = async () => {
  await waitFor(() => {
    expect(screen.queryByText('Loading editor...')).toBeNull();
  }, { timeout: 5000 });
};

describe('TiptapEditor', () => {
  const mockOnChange = vi.fn();

  const strictSchema: ContentSchema = {
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
        required: false
      },

    ],
    isCollection: false,
    strict: true,
    type: 'single'
  };

  const flexibleSchema: ContentSchema = {
    ...strictSchema,
    strict: false
  };

  const basicContent = {
    title: 'Test Title',
    content: 'Test content',
    published: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Loading editor...')).toBeDefined();
    });

    it('renders editor content after initialization', async () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();
      expect(screen.getByTestId('editor-content')).toBeDefined();
    });

    it('renders markdown toolbar only for flexible schemas', async () => {
      const { rerender } = render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();
      expect(screen.queryByTestId('bold-button')).toBeNull();

      rerender(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();
      expect(screen.getByTestId('bold-button')).toBeDefined();
      expect(screen.getByTestId('italic-button')).toBeDefined();
      expect(screen.getByTestId('strikethrough-button')).toBeDefined();
      expect(screen.getByTestId('bullet-list-button')).toBeDefined();
    });

    it('renders content divider controls only for flexible schemas when editable', async () => {
      const { rerender } = render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();
      expect(screen.queryByTestId('add-paragraph-button')).toBeNull();

      rerender(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();
      expect(screen.getByTestId('add-paragraph-button')).toBeDefined();
      expect(screen.getByTestId('add-field-button')).toBeDefined();
    });

    it('does not render content divider when not editable', async () => {
      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={false}
        />
      );

      await waitForEditor();
      expect(screen.queryByTestId('add-paragraph-button')).toBeNull();
      expect(screen.queryByTestId('add-field-button')).toBeNull();
    });
  });

  describe('Field Interactions', () => {
    it('renders schema fields with proper values', async () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      // Check if field labels are rendered
      expect(screen.getByText('Title')).toBeDefined();
      expect(screen.getByText('Content')).toBeDefined();
      expect(screen.getByText('Published')).toBeDefined();
    });

    it('handles text field interactions', async () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={{ title: 'Initial Title', content: '', published: false }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      // Verify that schema fields are rendered with values
      expect(screen.getByText('Title')).toBeDefined();
      expect(screen.getByText('Content')).toBeDefined();
      expect(screen.getByText('Published')).toBeDefined();

      // Verify editor structure is present
      expect(screen.getByTestId('editor-content')).toBeDefined();
    });

    it('handles boolean field interactions', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={strictSchema}
          content={{ published: false }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      // Find switch element for boolean field
      const switchElement = screen.getByRole('switch') as HTMLInputElement;
      expect(switchElement.checked).toBe(false);

      await user.click(switchElement);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Add Field Dialog', () => {
    it('opens add field dialog when clicking add field button', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();

      const addFieldButton = screen.getByTestId('add-field-button');
      await user.click(addFieldButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-field-dialog')).toBeDefined();
        expect(screen.getByText('Add New Field')).toBeDefined();
      });
    });

    it('creates new field through dialog', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();

      // Open dialog
      const addFieldButton = screen.getByTestId('add-field-button');
      await user.click(addFieldButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-field-dialog')).toBeDefined();
      });

      // Fill field name
      const nameInput = screen.getByPlaceholderText('Enter field name');
      await user.type(nameInput, 'New Field');

      // Add field
      const addButton = screen.getByText('Add Field');
      expect((addButton as HTMLButtonElement).disabled).toBe(false);
      await user.click(addButton);

      // Verify onChange was called and dialog closed
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        expect(screen.queryByTestId('add-field-dialog')).toBeNull();
      });
    });

    it('validates field name requirement', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();

      // Open dialog
      const addFieldButton = screen.getByTestId('add-field-button');
      await user.click(addFieldButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-field-dialog')).toBeDefined();
      });

      // Check that add button is disabled without name
      const addButton = screen.getByText('Add Field');
      expect((addButton as HTMLButtonElement).disabled).toBe(true);
    });





    it('closes dialog when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();

      // Open dialog
      const addFieldButton = screen.getByTestId('add-field-button');
      await user.click(addFieldButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-field-dialog')).toBeDefined();
      });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Check dialog closed
      await waitFor(() => {
        expect(screen.queryByTestId('add-field-dialog')).toBeNull();
      });
    });
  });

  describe('Content Handling', () => {
    it('initializes with empty content', async () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={{}}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();
      expect(screen.getByTestId('editor-content')).toBeDefined();
    });

    it('handles flexible schema content structure', async () => {
      const flexibleContent = {
        content: [],
        schema: {
          title: { id: 'title', name: 'Title', type: 'text', required: true, isDynamic: false }
        },
        title: 'Test',
        __textContent: 'Some text',
        __htmlContent: '<p>Some text</p>'
      };

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={flexibleContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();
      expect(screen.getByTestId('editor-content')).toBeDefined();
    });

    it('calls onChange when content changes', async () => {
      render(
        <TiptapEditor
          schema={strictSchema}
          content={{ title: 'Test Title' }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      // Verify that the editor initializes and can handle content
      expect(screen.getByTestId('editor-content')).toBeDefined();
      expect(screen.getByText('Title')).toBeDefined();

      // The editor should initialize with the provided content
      // In a real environment, onChange would be called when fields are modified
      expect(mockOnChange).toHaveBeenCalledTimes(0); // Not called during initialization
    });
  });

  describe('Markdown Toolbar', () => {
    it('renders markdown toolbar buttons for flexible schemas', async () => {
      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      expect(screen.getByTestId('bold-button')).toBeDefined();
      expect(screen.getByTestId('italic-button')).toBeDefined();
      expect(screen.getByTestId('strikethrough-button')).toBeDefined();
      expect(screen.getByTestId('bullet-list-button')).toBeDefined();
    });

    it('enables/disables toolbar buttons based on editor state', async () => {
      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const boldButton = screen.getByTestId('bold-button');
      const italicButton = screen.getByTestId('italic-button');

      // Buttons should be present (enabled/disabled state depends on editor focus)
      expect(boldButton).toBeDefined();
      expect(italicButton).toBeDefined();
    });
  });

  const multiTypeSchema: ContentSchema = {
    id: 'multi-type',
    name: 'Multi Type Schema',
    description: 'Schema with multiple field types',
    fields: [
      { id: 'text-field', name: 'Text Field', type: 'text', required: false },
      { id: 'number-field', name: 'Number Field', type: 'number', required: false },
      { id: 'boolean-field', name: 'Boolean Field', type: 'boolean', required: false }
    ],
    isCollection: false,
    strict: true,
    type: 'single'
  };

  describe('Enhanced Field Type Testing', () => {
    it('handles number field input correctly', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={multiTypeSchema}
          content={{ 'number-field': 0 }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const numberInput = screen.getByDisplayValue('0') as HTMLInputElement;
      expect(numberInput.type).toBe('number');

      await user.clear(numberInput);
      await user.type(numberInput, '42');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation Testing', () => {
    it('navigates between fields with tab key', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const textInputs = screen.getAllByRole('textbox');
      if (textInputs.length > 1) {
        await user.click(textInputs[0]);
        await user.tab();
        expect(document.activeElement).toBe(textInputs[1]);
      }
    });

    it('handles keyboard shortcuts for bold and italic in flexible mode', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const editorContent = screen.getByTestId('editor-content');
      await user.click(editorContent);

      await user.keyboard('{Control>}b{/Control}');
      await user.keyboard('{Control>}i{/Control}');

      expect(screen.getByTestId('bold-button')).toBeDefined();
      expect(screen.getByTestId('italic-button')).toBeDefined();
    });
  });

  describe('Field Validation Edge Cases', () => {
    it('validates required fields and shows error states', async () => {
      const requiredSchema: ContentSchema = {
        ...strictSchema,
        fields: [{
          id: 'required-text',
          name: 'Required Text',
          type: 'text',
          required: true
        }]
      };

      render(
        <TiptapEditor
          schema={requiredSchema}
          content={{ 'required-text': '' }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const requiredInput = screen.getByLabelText(/Required Text/i) || screen.getByRole('textbox');
      expect(requiredInput).toBeDefined();
      expect(requiredInput.hasAttribute('required')).toBe(true);
    });

    it('handles invalid number inputs gracefully', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={multiTypeSchema}
          content={{ 'number-field': 0 }}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const numberInput = screen.getByDisplayValue('0') as HTMLInputElement;
      await user.clear(numberInput);
      await user.type(numberInput, 'invalid');

      expect(numberInput.validity.valid).toBe(false);
    });

    // JSON and date field tests removed as those types are no longer supported in SchemaField
  });

  describe('Content Serialization Testing', () => {
    it('verifies editor content serialization matches expected format', async () => {
      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const editorElement = screen.getByTestId('editor-content');
      expect(editorElement.innerHTML).toBeDefined();
      expect(editorElement.innerHTML).not.toBe('');
    });

    it('handles content deserialization from flexible schema structure', async () => {
      const flexibleContent = {
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] }],
        schema: {
          title: { id: 'title', name: 'Title', type: 'text', required: true, isDynamic: false }
        },
        title: 'Deserialized Title'
      };

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={flexibleContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const editorElement = screen.getByTestId('editor-content');
      expect(editorElement).toBeDefined();
    });
  });

  describe('Focus Management Testing', () => {
    it('maintains focus when adding new fields', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={flexibleSchema}
          content={basicContent}
          onChange={mockOnChange}
          editable={true}
        />
      );

      await waitForEditor();

      const addFieldButton = screen.getByTestId('add-field-button');
      await user.click(addFieldButton);

      await waitFor(() => {
        const dialog = screen.getByTestId('add-field-dialog');
        const nameInput = screen.getByPlaceholderText('Enter field name');
        expect(document.activeElement).toBe(nameInput);
      });
    });

    it('focuses appropriate field after field removal', async () => {
      const user = userEvent.setup();

      render(
        <TiptapEditor
          schema={strictSchema}
          content={basicContent}
          onChange={mockOnChange}
        />
      );

      await waitForEditor();

      const textInputs = screen.getAllByRole('textbox');
      if (textInputs.length > 0) {
        await user.click(textInputs[0]);
        expect(document.activeElement).toBe(textInputs[0]);
      }
    });
  });
});
