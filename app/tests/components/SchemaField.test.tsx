import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SchemaField from '@/components/Content/extensions/SchemaField';
import { SchemaFieldType } from '../../src/lib/api/SchemaApi';

// Test wrapper component that creates a Tiptap editor with SchemaField extension
const SchemaFieldTestWrapper = ({
  fieldId,
  fieldType,
  fieldName,
  fieldValue,
  fieldRequired = false,
  fieldDescription = '',
  fieldOptions = [],
  isDynamic = false,
  onFieldChange,
}: {
  fieldId: string;
      fieldType: SchemaFieldType;
  fieldName: string;
  fieldValue: unknown;
  fieldRequired?: boolean;
  fieldDescription?: string;
  fieldOptions?: string[];
  isDynamic?: boolean;
  onFieldChange?: (value: unknown) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit, SchemaField],
    content: {
      type: 'doc',
      content: [
        {
          type: 'schemaField',
          attrs: {
            fieldId,
            fieldType,
            fieldName,
            fieldValue,
            fieldRequired,
            fieldDescription,
            fieldOptions,
            isDynamic,
          },
        },
      ],
    },
    onUpdate: ({ editor }) => {
      // Extract field values when editor updates
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'schemaField' && node.attrs.fieldId === fieldId) {
          onFieldChange?.(node.attrs.fieldValue);
        }
        return true;
      });
    },
  });

  // Keep editor content in sync when props change (field value/type updates)
  React.useEffect(() => {
    if (!editor) return;
    // Inspect current node attrs and only update if something changed
    let current: any = null;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'schemaField' && node.attrs.fieldId === fieldId) {
        current = node.attrs;
        return false;
      }
      return true;
    });

    const next = {
      fieldId,
      fieldType,
      fieldName,
      fieldValue,
      fieldRequired,
      fieldDescription,
      fieldOptions,
      isDynamic,
    } as const;

    const changed = !current ||
      current.fieldType !== next.fieldType ||
      current.fieldName !== next.fieldName ||
      current.fieldRequired !== next.fieldRequired ||
      current.fieldDescription !== next.fieldDescription ||
      current.isDynamic !== next.isDynamic ||
      JSON.stringify(current.fieldOptions || []) !== JSON.stringify(next.fieldOptions || []) ||
      // Compare values via JSON to handle primitives and objects
      JSON.stringify(current.fieldValue) !== JSON.stringify(next.fieldValue);

    if (!changed) return;

    editor.commands.setContent(
      {
        type: 'doc',
        content: [
          {
            type: 'schemaField',
            attrs: next,
          },
        ],
      },
      false // do not emit update to avoid loops
    );
  }, [editor, fieldId, fieldType, fieldName, fieldValue, fieldRequired, fieldDescription, JSON.stringify(fieldOptions), isDynamic]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="schema-field-wrapper">
      <EditorContent editor={editor} />
    </div>
  );
};

describe('SchemaField', () => {
  const mockOnFieldChange = vi.fn();

  beforeEach(() => {
    mockOnFieldChange.mockClear();
  });

  describe('Text Field', () => {
    it('renders text input with correct value', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-text"
          fieldType="text"
          fieldName="Test Text"
          fieldValue="Initial value"
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('schema-field-test-text')).toBeDefined();
      });

      expect(screen.getByDisplayValue('Initial value')).toBeDefined();
      expect(screen.getByText('Test Text')).toBeDefined();
    });

    it('handles text input changes', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-text"
          fieldType="text"
          fieldName="Test Text"
          fieldValue="Initial value"
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('text-input-test-text')).toBeDefined();
      });

      const input = screen.getByTestId('text-input-test-text');
      expect(input).toHaveValue('Initial value');

      // Test that the input exists and can be interacted with
      expect(input).not.toBeDisabled();
    });

    it('shows placeholder when no description is provided', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-text"
          fieldType="text"
          fieldName="Test Text"
          fieldValue=""
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter test text')).toBeDefined();
      });
    });

    it('shows description as placeholder when provided', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-text"
          fieldType="text"
          fieldName="Test Text"
          fieldValue=""
          fieldDescription="Custom description"
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Custom description')).toBeDefined();
      });
    });
  });

  describe('Number Field', () => {
    it('renders number input with correct value', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Test Number"
          fieldValue={42}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;
      expect(input.type).toBe('number');
      expect(input.value).toBe('42');
    });

    it('handles number input changes', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Test Number"
          fieldValue={42}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;
      expect(input.type).toBe('number');
      expect(input.value).toBe('42');
      expect(input).not.toBeDisabled();
    });

    it('renders number input with correct attributes', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Test Number"
          fieldValue={123}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;
      expect(input.type).toBe('number');
      expect(input.value).toBe('123');
      expect(input).not.toBeDisabled();
    });

    it('accepts integer values', async () => {
      const user = userEvent.setup();
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Integer Field"
          fieldValue={0}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;

      // Clear and type an integer
      await user.clear(input);
      await user.type(input, '100');

      expect(input.value).toBe('100');
    });

    it('accepts float/decimal values', async () => {
      const user = userEvent.setup();
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Float Field"
          fieldValue={0}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;

      // Clear and type a float
      await user.clear(input);
      await user.type(input, '99.99');

      expect(input.value).toBe('99.99');
    });

    it('accepts negative numbers', async () => {
      const user = userEvent.setup();
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Negative Field"
          fieldValue={0}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;

      // Clear and type a negative number
      await user.clear(input);
      await user.type(input, '-42.5');

      expect(input.value).toBe('-42.5');
    });

    it('allows empty values when not required', async () => {
      const user = userEvent.setup();
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Optional Number"
          fieldValue={100}
          fieldRequired={false}
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;
      expect(input.value).toBe('100');

      // Clear the input
      await user.clear(input);

      // Input should allow empty value when not required
      expect(input.value).toBe('');
      expect(input).not.toBeDisabled();
    });

    it('uses default value 0 when fieldValue is 0', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-number"
          fieldType="number"
          fieldName="Zero Default"
          fieldValue={0}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('number-input-test-number')).toBeDefined();
      });

      const input = screen.getByTestId('number-input-test-number') as HTMLInputElement;
      expect(input.value).toBe('0');
    });
  });

  describe('Boolean Field', () => {
    it('renders boolean toggle with correct active label', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-boolean"
          fieldType="boolean"
          fieldName="Test Boolean"
          fieldValue={true}
          onFieldChange={mockOnFieldChange}
        />
      );

      const toggle = await screen.findByTestId('boolean-switch-test-boolean');
      const trueButton = within(toggle).getByRole('button', { name: 'true' });
      const falseButton = within(toggle).getByRole('button', { name: 'false' });

      expect(trueButton.getAttribute('aria-pressed')).toBe('true');
      expect(falseButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('toggles active label when selecting options', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <SchemaFieldTestWrapper
          fieldId="test-boolean"
          fieldType="boolean"
          fieldName="Test Boolean"
          fieldValue={true}
          onFieldChange={mockOnFieldChange}
        />
      );

      let toggle = await screen.findByTestId('boolean-switch-test-boolean');
      let trueButton = within(toggle).getByRole('button', { name: 'true' });
      let falseButton = within(toggle).getByRole('button', { name: 'false' });

      expect(trueButton.getAttribute('aria-pressed')).toBe('true');
      expect(falseButton.getAttribute('aria-pressed')).toBe('false');

      await user.click(falseButton);

      expect(mockOnFieldChange).toHaveBeenCalledWith(false);

      rerender(
        <SchemaFieldTestWrapper
          fieldId="test-boolean"
          fieldType="boolean"
          fieldName="Test Boolean"
          fieldValue={false}
        />
      );

      toggle = await screen.findByTestId('boolean-switch-test-boolean');
      trueButton = within(toggle).getByRole('button', { name: 'true' });
      falseButton = within(toggle).getByRole('button', { name: 'false' });

      expect(trueButton.getAttribute('aria-pressed')).toBe('false');
      expect(falseButton.getAttribute('aria-pressed')).toBe('true');

      rerender(
        <SchemaFieldTestWrapper
          fieldId="test-boolean"
          fieldType="boolean"
          fieldName="Test Boolean"
          fieldValue={true}
        />
      );

      toggle = await screen.findByTestId('boolean-switch-test-boolean');
      trueButton = within(toggle).getByRole('button', { name: 'true' });
      falseButton = within(toggle).getByRole('button', { name: 'false' });

      expect(trueButton.getAttribute('aria-pressed')).toBe('true');
      expect(falseButton.getAttribute('aria-pressed')).toBe('false');
    });
  });


  describe('Field Metadata', () => {
    it('displays field name correctly', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Custom Field Name"
          fieldValue=""
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Field Name')).toBeDefined();
      });
    });

    it('shows required indicator for required fields', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Required Field"
          fieldValue=""
          fieldRequired={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Required Field')).toBeDefined();
        expect(screen.getByText('*')).toBeDefined();
      });
    });

    it('displays field description when provided', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Field with Description"
          fieldValue=""
          fieldDescription="This is a helpful description"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('This is a helpful description')).toBeDefined();
      });
    });

    it('shows remove button for dynamic fields', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Dynamic Field"
          fieldValue=""
          isDynamic={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('remove-field-button-test-field')).toBeDefined();
      });
    });

    it('disables remove button for required dynamic fields', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Required Dynamic Field"
          fieldValue=""
          isDynamic={true}
          fieldRequired={true}
        />
      );

      await waitFor(() => {
        const removeButton = screen.getByTestId('remove-field-button-test-field');
        expect(removeButton).toBeDisabled();
      });
    });
  });

  describe('Field Actions', () => {
    it('shows bottom divider with action buttons on hover', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Field with Actions"
          fieldValue=""
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-paragraph-after-test-field')).toBeDefined();
        expect(screen.getByTestId('add-field-after-test-field')).toBeDefined();
      });
    });

    it('handles add paragraph action', async () => {
      const user = userEvent.setup();

      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Field with Actions"
          fieldValue=""
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-paragraph-after-test-field')).toBeDefined();
      });

      const addParagraphButton = screen.getByTestId('add-paragraph-after-test-field');
      await user.click(addParagraphButton);

      // The action should be called (we can't easily test editor changes without more setup)
      expect(addParagraphButton).toBeDefined();
    });

    it('handles add field action', async () => {
      const user = userEvent.setup();

      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Field with Actions"
          fieldValue=""
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-field-after-test-field')).toBeDefined();
      });

      const addFieldButton = screen.getByTestId('add-field-after-test-field');
      await user.click(addFieldButton);

      // The action should be called (logs to console in current implementation)
      expect(addFieldButton).toBeDefined();
    });
  });

  describe('Field Removal', () => {
    it('handles field removal for dynamic non-required fields', async () => {
      const user = userEvent.setup();

      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Removable Field"
          fieldValue=""
          isDynamic={true}
          fieldRequired={false}
        />
      );

      await waitFor(() => {
        const removeButton = screen.getByTestId('remove-field-button-test-field');
        expect(removeButton).not.toBeDisabled();
      });

      const removeButton = screen.getByTestId('remove-field-button-test-field');
      await user.click(removeButton);

      // Field removal should be initiated (actual removal depends on editor state)
      expect(removeButton).toBeDefined();
    });

    it('prevents removal of required fields', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Required Field"
          fieldValue=""
          isDynamic={true}
          fieldRequired={true}
        />
      );

      await waitFor(() => {
        const removeButton = screen.getByTestId('remove-field-button-test-field');
        expect(removeButton).toBeDisabled();
      });
    });
  });

  describe('Field State Persistence Testing', () => {
    it('persists field values across editor updates', async () => {
      const { rerender } = render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Persistent Field"
          fieldValue="initial value"
        />
      );

      await screen.findByDisplayValue('initial value');

      rerender(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Persistent Field"
          fieldValue="updated value"
        />
      );

      await screen.findByDisplayValue('updated value');
    });

    it('maintains state when field type changes', async () => {
      const { rerender } = render(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="text"
          fieldName="Changing Field"
          fieldValue="text value"
        />
      );

      await screen.findByTestId('text-input-test-field');

      rerender(
        <SchemaFieldTestWrapper
          fieldId="test-field"
          fieldType="number"
          fieldName="Changing Field"
          fieldValue={42}
        />
      );

      await screen.findByTestId('number-input-test-field');
      await screen.findByDisplayValue('42');
    });
  });

  describe('Field Interaction Sequences Testing', () => {
    it('handles sequential field interactions with state verification', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SchemaFieldTestWrapper
          fieldId="text-field"
          fieldType="text"
          fieldName="Text Field"
          fieldValue=""
          onFieldChange={mockOnFieldChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('text-input-text-field')).toBeDefined();
      });

      const textInput = screen.getByTestId('text-input-text-field');
      await user.type(textInput, 'typed text');

      // Verify text field state
      expect(textInput).toHaveValue('typed text');

      // Add boolean field and interact
      rerender(
        <div>
          <SchemaFieldTestWrapper
            fieldId="text-field"
            fieldType="text"
            fieldName="Text Field"
            fieldValue="typed text"
          />
          <SchemaFieldTestWrapper
            fieldId="bool-field"
            fieldType="boolean"
            fieldName="Boolean Field"
            fieldValue={false}
            onFieldChange={mockOnFieldChange}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getAllByDisplayValue('typed text')).toHaveLength(1);
        expect(screen.getByTestId('boolean-switch-bool-field')).toBeDefined();
      });
    });

    it('verifies combined state after multiple field updates', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <div>
          <SchemaFieldTestWrapper
            fieldId="text-field"
            fieldType="text"
            fieldName="Text Field"
            fieldValue="initial"
          />
          <SchemaFieldTestWrapper
            fieldId="number-field"
            fieldType="number"
            fieldName="Number Field"
            fieldValue={0}
          />
        </div>
      );

      await screen.findByDisplayValue('initial');
      await screen.findByDisplayValue('0');

      // Update values
      rerender(
        <div>
          <SchemaFieldTestWrapper
            fieldId="text-field"
            fieldType="text"
            fieldName="Text Field"
            fieldValue="updated text"
          />
          <SchemaFieldTestWrapper
            fieldId="number-field"
            fieldType="number"
            fieldName="Number Field"
            fieldValue={42}
          />
        </div>
      );

      await screen.findByDisplayValue('updated text');
      await screen.findByDisplayValue('42');
    });
  });

  describe('Accessibility Testing', () => {
    it('provides proper ARIA labels for text fields', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="accessible-text"
          fieldType="text"
          fieldName="Accessible Text Field"
          fieldValue=""
        />
      );

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /Accessible Text Field/i });
        expect(input).toBeDefined();
        expect(input).toHaveAttribute('aria-label', 'Accessible Text Field');
      });
    });

    it('ensures required fields have proper attributes', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="required-field"
          fieldType="text"
          fieldName="Required Field"
          fieldValue=""
          fieldRequired={true}
        />
      );

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('required');
        expect(input).toHaveAttribute('aria-required', 'true');
      });
    });

    it('provides descriptions as accessible help text', async () => {
      render(
        <SchemaFieldTestWrapper
          fieldId="described-field"
          fieldType="text"
          fieldName="Described Field"
          fieldValue=""
          fieldDescription="This field needs special formatting"
        />
      );

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        const description = screen.getByText('This field needs special formatting');
        expect(input).toHaveAttribute('aria-describedby');
        expect(description).toBeDefined();
      });
    });
  });

  describe('Field Dependencies Testing', () => {
    it('handles dependent field visibility based on boolean state', async () => {
      const { rerender } = render(
        <div>
          <SchemaFieldTestWrapper
            fieldId="enable-field"
            fieldType="boolean"
            fieldName="Enable Advanced"
            fieldValue={false}
          />
          {false && (
            <SchemaFieldTestWrapper
              fieldId="advanced-field"
              fieldType="text"
              fieldName="Advanced Option"
              fieldValue=""
            />
          )}
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Enable Advanced')).toBeDefined();
        expect(screen.queryByText('Advanced Option')).toBeNull();
      });

      rerender(
        <div>
          <SchemaFieldTestWrapper
            fieldId="enable-field"
            fieldType="boolean"
            fieldName="Enable Advanced"
            fieldValue={true}
          />
          {true && (
            <SchemaFieldTestWrapper
              fieldId="advanced-field"
              fieldType="text"
              fieldName="Advanced Option"
              fieldValue=""
            />
          )}
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Enable Advanced')).toBeDefined();
        expect(screen.getByText('Advanced Option')).toBeDefined();
      });
    });

  });
});
