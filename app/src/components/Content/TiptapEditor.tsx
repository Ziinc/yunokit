import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SchemaField from './extensions/SchemaField';
import { ContentSchemaRow, SchemaField as SchemaFieldType, SchemaFieldType as FieldType } from '@/lib/api/SchemaApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Type, Hash, ToggleLeft, List, ListOrdered, Bold, Italic, Strikethrough, AlignLeft } from 'lucide-react';
import './TiptapEditor.css';
import { JSONContent, Editor } from '@tiptap/core';

// Define proper field types
interface ContentField {
  id: string;
  value: unknown;
  isDynamic?: boolean;
}

interface ContentData {
  fields: ContentField[];
}

interface TiptapEditorProps {
  schema: ContentSchemaRow;
  content: JSONContent | ContentData;
  onChange: (content: ContentData) => void;
  editable?: boolean;
}

// Field type options for the add field dialog
const FIELD_TYPE_OPTIONS: { value: FieldType; label: string; icon: ReactNode }[] = [
  { value: FieldType.TEXT, label: 'Text', icon: <Type className="h-4 w-4" /> },
  { value: FieldType.NUMBER, label: 'Number', icon: <Hash className="h-4 w-4" /> },
  { value: FieldType.BOOLEAN, label: 'Boolean', icon: <ToggleLeft className="h-4 w-4" /> },
];

interface AddFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: SchemaFieldType, insertIndex?: number) => void;
}

const AddFieldDialog: React.FC<AddFieldDialogProps> = ({ isOpen, onClose, onAddField }) => {
  const [newField, setNewField] = useState<Partial<SchemaFieldType>>({
    type: FieldType.TEXT,
    required: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.label?.trim()) return;

    const field: SchemaFieldType = {
      id: newField.label.toLowerCase().replace(/\s+/g, '-'),
      label: newField.label,
      type: newField.type!,
      required: newField.required || false,
      description: newField.description || null,
      default_value: null,
      options: [],
      relation_schema_id: null,
    };

    onAddField(field);
    setNewField({ type: FieldType.TEXT, required: false });
    onClose();
  };

  const handleClose = () => {
    setNewField({ type: FieldType.TEXT, required: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="add-field-dialog">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              placeholder="Enter field name"
              value={newField.label || ''}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="field-type">Field Type</Label>
            <Select 
              value={newField.type} 
              onValueChange={(value: FieldType) => setNewField({ ...newField, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="field-description">Description (Optional)</Label>
            <Input
              id="field-description"
              placeholder="Enter field description"
              value={newField.description || ''}
              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="field-required"
              checked={newField.required || false}
              onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
            />
            <Label htmlFor="field-required">Required field</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newField.label?.trim()}>
              Add Field
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ContentDividerProps {
  onAddParagraph: () => void;
  onAddField: () => void;
  schema: ContentSchemaRow;
}

const ContentDivider: React.FC<ContentDividerProps> = ({ onAddParagraph, onAddField, schema }) => {
  if (schema.strict) return null;

  return (
    <div className="group relative my-4 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex space-x-2 bg-white px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddParagraph}
                data-testid="add-paragraph-button"
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add paragraph</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddField}
                data-testid="add-field-button"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add field</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

interface MarkdownToolbarProps {
  editor: Editor;
  schema: ContentSchemaRow;
}

const MarkdownToolbar = ({ editor, schema }: MarkdownToolbarProps) => {
  if (!editor || schema.strict) return null;

  return (
    <div className="border-b border-gray-200 p-2">
      <div className="flex space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                data-testid="bold-button"
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                data-testid="italic-button"
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic (Ctrl+I)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                data-testid="strikethrough-button"
                className="h-8 w-8 p-0"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                data-testid="bullet-list-button"
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bullet List</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                data-testid="ordered-list-button"
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Numbered List</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ 
  schema, 
  content, 
  onChange, 
  editable = true 
}) => {
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<SchemaFieldType[]>([]);

  // Initialize dynamic fields from content if schema is flexible
  useEffect(() => {
    if (schema.strict) return;

    //   const dynamicFieldsFromContent: SchemaFieldType[] = [];
    //   if (content && typeof content === 'object' && 'fields' in content) {
    //   content.fields.forEach((field: { id: string; value: unknown; isDynamic?: boolean; label: string; type: FieldType; required?: boolean; description?: string; options?: string[] }) => {
    //     if (field.isDynamic) {
    //       dynamicFieldsFromContent.push({
    //         id: field.id,
    //         label: field.label,
    //         type: field.type,
    //         required: field.required || false,
    //         description: field.description || null,
    //         default_value: null,
    //         options: field.options || [],
    //         relation_schema_id: null,
    //       });
    //     }
    //   });
    // }
    // setDynamicFields(dynamicFieldsFromContent);
  }, [content, schema.strict]);

  // Memoize all fields (schema + dynamic)
  const allFields = useMemo(() => {
    return [...schema.fields, ...dynamicFields];
  }, [schema.fields, dynamicFields]);

  // Create the initial content structure from the schema
  const initialContent = useMemo(() => {
    const fields = allFields.map(field => ({
      id: field.id,
      value: getDefaultValue(field),
      isDynamic: !schema.fields.some(sf => sf.id === field.id),
    }));

    return { fields };
  }, [allFields, schema.fields]);

  // Helper function to get default value for a field
  function getDefaultValue(field: SchemaFieldType): unknown {
    if (field.default_value !== null) {
      return field.default_value;
    }
    
    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.MARKDOWN:
        return '';
      case FieldType.NUMBER:
        return 0;
      case FieldType.BOOLEAN:
        return false;
      case FieldType.JSON:
        return {};
      default:
        return '';
    }
  }

  // Merge existing content with initial structure
  const mergedContent = useMemo(() => {
    if (!content || typeof content !== 'object' || !('fields' in content)) {
      return initialContent;
    }

    const existingFieldsMap = new Map();
    if (Array.isArray(content.fields)) {
      content.fields.forEach((field: ContentField) => {
        existingFieldsMap.set(field.id, field);
      });
    }

    const mergedFields = allFields.map(field => {
      const existingField = existingFieldsMap.get(field.id);
      return {
        id: field.id,
        value: existingField?.value ?? getDefaultValue(field),
        isDynamic: !schema.fields.some(sf => sf.id === field.id),
      };
    });

    return { fields: mergedFields };
  }, [content, initialContent, allFields, schema.fields]);

  const handleAddField = useCallback((newField: SchemaFieldType, insertIndex?: number) => {
    setDynamicFields(prev => {
      const newFields = [...prev];
      // let updatedDynamicFields: SchemaFieldType[];
      
      if (insertIndex !== undefined) {
        newFields.splice(insertIndex, 0, newField);
      } else {
        newFields.push(newField);
      }
      return newFields;
    });

    // Add the field to content immediately
    const newFieldValue = {
      id: newField.id,
      value: getDefaultValue(newField),
      isDynamic: true,
    };

    const currentFields = Array.isArray(mergedContent.fields) ? [...mergedContent.fields] : [];
    if (insertIndex !== undefined) {
      currentFields.splice(insertIndex, 0, newFieldValue);
    } else {
      currentFields.push(newFieldValue);
    }

    onChange({ fields: currentFields });
  }, [mergedContent.fields, onChange]);

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    const updatedFields = mergedContent.fields.map((field: ContentField) => 
      field.id === fieldId ? { ...field, value } : field
    );
    onChange({ fields: updatedFields });
  }, [mergedContent.fields, onChange]);

  // Initialize content on mount and when schema changes
  useEffect(() => {
    onChange(mergedContent);
  }, [mergedContent, onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      SchemaField,
    ],
    content: '<p></p>',
    editable,
  });

  const handleAddParagraph = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent('<p></p>').run();
  }, [editor]);

  const handleOpenFieldDialog = useCallback(() => {
    setIsFieldDialogOpen(true);
  }, []);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <MarkdownToolbar editor={editor} schema={schema} />
      <div data-testid="editor-content" className="p-4">
        {/* Render schema fields */}
        {allFields.map((field, index) => (
          <div key={field.id} className="mb-4">
            <div className="mb-2">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              )}
            </div>
            <SchemaFieldComponent 
              field={field}
              value={mergedContent.fields.find((f: ContentField) => f.id === field.id)?.value}
              onChange={(value) => handleFieldChange(field.id, value)}
              required={field.required}
            />
            {editable && !schema.strict && index < allFields.length - 1 && (
              <ContentDivider 
                onAddParagraph={handleAddParagraph}
                onAddField={handleOpenFieldDialog}
                schema={schema}
              />
            )}
          </div>
        ))}

        {/* Content divider at the end for flexible schemas */}
        {editable && !schema.strict && (
          <ContentDivider 
            onAddParagraph={handleAddParagraph}
            onAddField={handleOpenFieldDialog}
            schema={schema}
          />
        )}

        {/* Editor content for markdown/rich text in flexible schemas */}
        {!schema.strict && (
          <EditorContent editor={editor} />
        )}
      </div>

      <AddFieldDialog
        isOpen={isFieldDialogOpen}
        onClose={() => setIsFieldDialogOpen(false)}
        onAddField={handleAddField}
      />
    </div>
  );
};

// Schema field component to render different field types
interface SchemaFieldComponentProps {
  field: SchemaFieldType;
  value: unknown;
  onChange: (value: unknown) => void;
  required?: boolean;
}

const SchemaFieldComponent: React.FC<SchemaFieldComponentProps> = ({ 
  field, 
  value, 
  onChange, 
  required 
}) => {
  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.MARKDOWN:
      return (
        <Input
          id={field.id}
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-label={field.label}
        />
      );
    
    case FieldType.NUMBER:
      return (
        <Input
          id={field.id}
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
          required={required}
          aria-label={field.label}
        />
      );
    
    case FieldType.BOOLEAN:
      return (
        <Switch
          id={field.id}
          checked={Boolean(value)}
          onCheckedChange={onChange}
          aria-label={field.label}
        />
      );
    
    case FieldType.DATE:
      return (
        <Input
          id={field.id}
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-label={field.label}
        />
      );
    
    default:
      return (
        <Input
          id={field.id}
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-label={field.label}
        />
      );
  }
};
